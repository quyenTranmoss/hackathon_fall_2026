"""Swell Teams backend: FastAPI + Mongo + JWT auth + Swell AI (OpenAI GPT-5.6-terra)."""
from fastapi import FastAPI, APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
import uuid
import jwt
import bcrypt
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta

from quiz_data import QUIZ_QUESTIONS, PERSONALITY_TYPES, compute_type

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGO = "HS256"
JWT_EXP_HOURS = 24 * 7
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Swell Teams")
api = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("swell")

# ---------------- Models ----------------

class SignupIn(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: str
    name: str
    avatar_color: str
    personality_type: Optional[str] = None
    personality_name: Optional[str] = None
    communication_style: Optional[str] = None
    personality_bio: Optional[str] = None
    bio: Optional[str] = None
    status: str = "offline"

class UpdateProfileIn(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None

class QuizSubmitIn(BaseModel):
    answers: Dict[str, str]  # question id (str) -> 'A' | 'B'

class MessageIn(BaseModel):
    conversation_id: str
    text: str
    attachment_name: Optional[str] = None
    attachment_data: Optional[str] = None  # base64 for demo

class SwellChatIn(BaseModel):
    text: str

class CreateConversationIn(BaseModel):
    kind: str  # 'dm' or 'channel'
    participants: List[str] = []  # other user ids for dm
    name: Optional[str] = None

# ---------------- Helpers ----------------

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_pw(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False

def make_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXP_HOURS)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

def color_for(name: str) -> str:
    palette = ["#0055FF", "#FF5D01", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"]
    return palette[sum(ord(c) for c in name) % len(palette)]

def user_public(u: dict) -> dict:
    return {
        "id": u["id"],
        "email": u["email"],
        "name": u["name"],
        "avatar_color": u.get("avatar_color", "#0055FF"),
        "personality_type": u.get("personality_type"),
        "personality_name": u.get("personality_name"),
        "communication_style": u.get("communication_style"),
        "personality_bio": u.get("personality_bio"),
        "bio": u.get("bio"),
        "status": "online" if u["id"] in online_users else "offline",
    }

async def current_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGO])
        uid = payload["sub"]
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    u = await db.users.find_one({"id": uid}, {"_id": 0})
    if not u:
        raise HTTPException(status_code=401, detail="User not found")
    return u

# ---------------- Presence & WS ----------------

online_users: Dict[str, List[WebSocket]] = {}

async def broadcast_presence(uid: str, status_str: str):
    payload = {"type": "presence", "user_id": uid, "status": status_str}
    dead = []
    for sockets in list(online_users.values()):
        for ws in list(sockets):
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)

async def notify_message(participants: List[str], message: dict):
    payload = {"type": "message", "message": message}
    for uid in participants:
        for ws in list(online_users.get(uid, [])):
            try:
                await ws.send_json(payload)
            except Exception:
                pass

# ---------------- Routes: auth ----------------

@api.post("/auth/signup")
async def signup(inp: SignupIn):
    existing = await db.users.find_one({"email": inp.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    uid = str(uuid.uuid4())
    doc = {
        "id": uid,
        "email": inp.email.lower(),
        "name": inp.name.strip(),
        "password_hash": hash_pw(inp.password),
        "avatar_color": color_for(inp.name),
        "personality_type": None,
        "personality_name": None,
        "communication_style": None,
        "personality_bio": None,
        "bio": None,
        "created_at": now_iso(),
    }
    await db.users.insert_one(doc)
    token = make_token(uid)
    return {"token": token, "user": user_public(doc)}

@api.post("/auth/login")
async def login(inp: LoginIn):
    u = await db.users.find_one({"email": inp.email.lower()}, {"_id": 0})
    if not u or not verify_pw(inp.password, u["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"token": make_token(u["id"]), "user": user_public(u)}

@api.get("/auth/me")
async def me(user=Depends(current_user)):
    return user_public(user)

# ---------------- Routes: users ----------------

@api.get("/users")
async def list_users(q: Optional[str] = None, user=Depends(current_user)):
    query: Dict[str, Any] = {"id": {"$ne": user["id"]}}
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"email": {"$regex": q, "$options": "i"}},
        ]
    docs = await db.users.find(query, {"_id": 0}).to_list(200)
    return [user_public(d) for d in docs]

@api.get("/users/{uid}")
async def get_user(uid: str, user=Depends(current_user)):
    u = await db.users.find_one({"id": uid}, {"_id": 0})
    if not u:
        raise HTTPException(404, "User not found")
    return user_public(u)

@api.put("/users/me")
async def update_me(inp: UpdateProfileIn, user=Depends(current_user)):
    updates = {k: v for k, v in inp.model_dump().items() if v is not None}
    if updates:
        await db.users.update_one({"id": user["id"]}, {"$set": updates})
    u = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    return user_public(u)

# ---------------- Routes: quiz ----------------

@api.get("/quiz/questions")
async def quiz_questions(user=Depends(current_user)):
    return {"questions": QUIZ_QUESTIONS}

async def swell_generate_bio(ptype: str, name: str) -> str:
    """Generate a personalized paragraph explaining what a personality type means."""
    meta = PERSONALITY_TYPES.get(ptype, {})
    fallback = (
        f"{name}, your type {ptype} — the {meta.get('name', 'Individual')} — reflects a distinctive "
        f"blend of preferences that shapes how you think, connect, and lead. "
        f"{meta.get('communication', '')} This mix suggests you bring a specific kind of strength to a "
        f"team: a way of seeing situations others may miss, and a natural rhythm for turning that insight "
        f"into action."
    )
    if not EMERGENT_LLM_KEY:
        return fallback
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"quiz-{uuid.uuid4()}",
            system_message="You are Swell, a warm, insightful personality-type coach in a workplace chat app.",
        ).with_model("openai", "gpt-5.6-terra")
        prompt = (
            f"Write a warm, insightful paragraph (4-6 sentences) explaining what personality type {ptype} "
            f"({meta.get('name','')}) means for {name}. Cover their thinking style, communication style, "
            f"strengths at work, and how teammates can best collaborate with them. Speak directly to {name} "
            f"in second person. No bullet points, no headings, no emojis."
        )
        resp = await chat.send_message(UserMessage(text=prompt))
        text = str(resp).strip() if resp else ""
        return text or fallback
    except Exception as e:
        logger.warning(f"swell_generate_bio failed: {e}")
        return fallback

@api.post("/quiz/submit")
async def quiz_submit(inp: QuizSubmitIn, user=Depends(current_user)):
    ptype = compute_type({int(k): v for k, v in inp.answers.items()})
    meta = PERSONALITY_TYPES.get(ptype, {"name": "Individual", "communication": ""})
    bio = await swell_generate_bio(ptype, user["name"])
    updates = {
        "personality_type": ptype,
        "personality_name": meta["name"],
        "communication_style": meta["communication"],
        "personality_bio": bio,
    }
    await db.users.update_one({"id": user["id"]}, {"$set": updates})
    return {"type": ptype, "name": meta["name"], "communication_style": meta["communication"], "personality_bio": bio}

# ---------------- Routes: conversations & messages ----------------

@api.post("/conversations")
async def create_conversation(inp: CreateConversationIn, user=Depends(current_user)):
    if inp.kind == "dm":
        if len(inp.participants) != 1:
            raise HTTPException(400, "DM needs exactly 1 other participant")
        other = inp.participants[0]
        # existing DM?
        existing = await db.conversations.find_one({
            "kind": "dm",
            "participants": {"$all": [user["id"], other], "$size": 2},
        }, {"_id": 0})
        if existing:
            return existing
        doc = {
            "id": str(uuid.uuid4()),
            "kind": "dm",
            "participants": [user["id"], other],
            "name": None,
            "created_at": now_iso(),
            "last_message": None,
            "last_ts": now_iso(),
        }
    else:
        participants = list(set([user["id"]] + inp.participants))
        doc = {
            "id": str(uuid.uuid4()),
            "kind": "channel",
            "participants": participants,
            "name": inp.name or "New Channel",
            "created_at": now_iso(),
            "last_message": None,
            "last_ts": now_iso(),
        }
    await db.conversations.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

async def enrich_conversation(c: dict, user_id: str) -> dict:
    out = {k: v for k, v in c.items() if k != "_id"}
    if c["kind"] == "dm":
        other_id = next((p for p in c["participants"] if p != user_id), None)
        if other_id:
            other = await db.users.find_one({"id": other_id}, {"_id": 0})
            if other:
                out["other_user"] = user_public(other)
    return out

@api.get("/conversations")
async def list_conversations(user=Depends(current_user)):
    docs = await db.conversations.find({"participants": user["id"]}, {"_id": 0}).sort("last_ts", -1).to_list(200)
    return [await enrich_conversation(d, user["id"]) for d in docs]

@api.get("/conversations/{cid}/messages")
async def get_messages(cid: str, user=Depends(current_user)):
    convo = await db.conversations.find_one({"id": cid}, {"_id": 0})
    if not convo or user["id"] not in convo["participants"]:
        raise HTTPException(404, "Conversation not found")
    msgs = await db.messages.find({"conversation_id": cid}, {"_id": 0}).sort("ts", 1).to_list(500)
    return msgs

@api.post("/messages")
async def send_message(inp: MessageIn, user=Depends(current_user)):
    convo = await db.conversations.find_one({"id": inp.conversation_id}, {"_id": 0})
    if not convo or user["id"] not in convo["participants"]:
        raise HTTPException(404, "Conversation not found")
    msg = {
        "id": str(uuid.uuid4()),
        "conversation_id": inp.conversation_id,
        "sender_id": user["id"],
        "sender_name": user["name"],
        "sender_color": user.get("avatar_color", "#0055FF"),
        "text": inp.text,
        "attachment_name": inp.attachment_name,
        "attachment_data": inp.attachment_data,
        "ts": now_iso(),
    }
    await db.messages.insert_one(msg)
    msg_out = {k: v for k, v in msg.items() if k != "_id"}
    await db.conversations.update_one(
        {"id": inp.conversation_id},
        {"$set": {"last_message": inp.text[:120], "last_ts": msg["ts"]}},
    )
    await notify_message(convo["participants"], msg_out)
    return msg_out

# ---------------- Routes: Swell AI ----------------

async def get_users_context(user_id: str) -> str:
    """Return a compact roster of teammates for Swell to reason about."""
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(200)
    lines = []
    for u in users:
        pt = u.get("personality_type") or "unknown"
        pn = u.get("personality_name") or ""
        cs = u.get("communication_style") or ""
        me_marker = " (this is the user asking you)" if u["id"] == user_id else ""
        lines.append(f"- {u['name']} <{u['email']}> — type: {pt} {pn}{me_marker}. Style: {cs}")
    return "\n".join(lines) if lines else "No teammates yet."

@api.post("/swell/chat")
async def swell_chat(inp: SwellChatIn, user=Depends(current_user)):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(500, "AI key not configured")
    roster = await get_users_context(user["id"])
    system = (
        "You are Swell, a warm, sharp AI teammate embedded in a workplace chat app. "
        "You help users understand the personality types (MBTI-style) and communication styles of their "
        "colleagues, and answer questions about how to reach them, what their type means, and how to "
        "collaborate well. Be concise, human, and specific. Never invent people who aren't in the roster.\n\n"
        f"TEAM ROSTER:\n{roster}"
    )
    session_id = f"swell-{user['id']}"
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=session_id, system_message=system).with_model(
            "openai", "gpt-5.6-terra"
        )
        # persist history in Mongo per user
        prior = await db.swell_history.find({"user_id": user["id"]}, {"_id": 0}).sort("ts", 1).to_list(50)
        # replay history so chat has context (send them silently)
        # (LlmChat is fresh each request; we prime by concatenating recent turns in the prompt)
        history_snippet = ""
        for h in prior[-10:]:
            role = "User" if h["role"] == "user" else "Swell"
            history_snippet += f"{role}: {h['text']}\n"
        user_text = inp.text
        prompt_text = f"{history_snippet}User: {user_text}\nSwell:" if history_snippet else user_text
        resp = await chat.send_message(UserMessage(text=prompt_text))
        answer = str(resp).strip() if resp else "I couldn't come up with a response — try rephrasing."
    except Exception as e:
        logger.exception("Swell chat failed")
        raise HTTPException(500, f"Swell failed: {e}")

    ts = now_iso()
    await db.swell_history.insert_many([
        {"user_id": user["id"], "role": "user", "text": inp.text, "ts": ts},
        {"user_id": user["id"], "role": "swell", "text": answer, "ts": ts},
    ])
    return {"answer": answer, "ts": ts}

@api.get("/swell/history")
async def swell_history(user=Depends(current_user)):
    docs = await db.swell_history.find({"user_id": user["id"]}, {"_id": 0}).sort("ts", 1).to_list(200)
    return docs

# ---------------- WebSocket ----------------

@api.websocket("/ws/{token}")
async def ws_endpoint(websocket: WebSocket, token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        uid = payload["sub"]
    except Exception:
        await websocket.close(code=1008)
        return
    await websocket.accept()
    online_users.setdefault(uid, []).append(websocket)
    await broadcast_presence(uid, "online")
    try:
        while True:
            data = await websocket.receive_json()
            # simple ping keepalive
            if data.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.info(f"ws err: {e}")
    finally:
        sockets = online_users.get(uid, [])
        if websocket in sockets:
            sockets.remove(websocket)
        if not sockets:
            online_users.pop(uid, None)
            await broadcast_presence(uid, "offline")

# ---------------- Root ----------------

@api.get("/")
async def root():
    return {"service": "swell-teams", "status": "ok"}

@api.get("/personality/{ptype}")
async def personality_info(ptype: str, user=Depends(current_user)):
    meta = PERSONALITY_TYPES.get(ptype.upper())
    if not meta:
        raise HTTPException(404, "Unknown type")
    return {"type": ptype.upper(), **meta}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useWs } from "../context/WsContext";
import { Avatar } from "../components/Avatar";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { PaperPlaneRight, Paperclip, MagnifyingGlass, VideoCamera, Phone, X, DotsThreeVertical } from "@phosphor-icons/react";

function timeShort(iso) {
  try { return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); } catch { return ""; }
}

export default function ChatPage() {
  const { user } = useAuth();
  const { online, onMessage } = useWs();
  const nav = useNavigate();
  const { cid } = useParams();

  const [convos, setConvos] = useState([]);
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [inCall, setInCall] = useState(false);
  const [attach, setAttach] = useState(null); // {name, data}
  const scrollRef = useRef(null);

  const active = convos.find((c) => c.id === cid);

  const loadConvos = useCallback(async () => {
    const { data } = await api.get("/conversations");
    setConvos(data);
  }, []);

  useEffect(() => {
    loadConvos();
    api.get("/users").then((r) => setUsers(r.data));
  }, [loadConvos]);

  useEffect(() => {
    if (!cid) { setMsgs([]); return; }
    api.get(`/conversations/${cid}/messages`).then((r) => setMsgs(r.data)).catch(() => setMsgs([]));
  }, [cid]);

  useEffect(() => {
    const off = onMessage?.((ev) => {
      if (ev.type === "message") {
        const m = ev.message;
        if (m.conversation_id === cid) {
          setMsgs((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
        }
        loadConvos();
      }
    });
    return () => off && off();
  }, [cid, onMessage, loadConvos]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const openDm = async (otherId) => {
    const { data } = await api.post("/conversations", { kind: "dm", participants: [otherId] });
    await loadConvos();
    nav(`/app/chat/${data.id}`);
  };

  const send = async () => {
    if (!cid) return;
    if (!text.trim() && !attach) return;
    try {
      const { data } = await api.post("/messages", {
        conversation_id: cid,
        text: text.trim(),
        attachment_name: attach?.name || null,
        attachment_data: attach?.data || null,
      });
      setMsgs((prev) => [...prev, data]);
      setText(""); setAttach(null);
    } catch { toast.error("Failed to send"); }
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { toast.error("File must be < 2MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setAttach({ name: f.name, data: reader.result });
    reader.readAsDataURL(f);
  };

  const filteredUsers = users.filter((u) => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()));

  const otherName = active?.other_user?.name || active?.name || "Conversation";
  const otherColor = active?.other_user?.avatar_color || "#0055FF";
  const otherStatus = active?.other_user && online.has(active.other_user.id) ? "online" : "offline";

  return (
    <div className="flex-1 flex min-w-0">
      {/* Conversation list */}
      <div className="w-80 border-r border-[#1c1c1f] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#1c1c1f]">
          <h2 className="heading font-semibold text-lg">Chat</h2>
          <div className="relative mt-3">
            <MagnifyingGlass size={16} className="absolute left-3 top-3 text-zinc-500" />
            <Input
              placeholder="Search people…"
              value={q} onChange={(e) => setQ(e.target.value)}
              className="pl-9 bg-[#121214] border-[#27272A] h-9"
              data-testid="chat-search-input"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {convos.length > 0 && (
            <div className="px-3 pt-3 pb-1 text-xs uppercase tracking-widest text-zinc-500">Recent</div>
          )}
          {convos.map((c) => {
            const other = c.other_user;
            const name = other?.name || c.name || "Chat";
            const color = other?.avatar_color || "#0055FF";
            const isActive = c.id === cid;
            const isOnline = other && online.has(other.id);
            return (
              <button
                key={c.id} onClick={() => nav(`/app/chat/${c.id}`)}
                data-testid={`convo-${c.id}`}
                className={`w-full text-left px-3 py-3 flex items-center gap-3 border-l-2 ${isActive ? "border-[#0055FF] bg-[#121214]" : "border-transparent hover:bg-[#101012]"}`}
              >
                <Avatar name={name} color={color} size={40} showStatus status={isOnline ? "online" : "offline"} />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2">
                    <div className="font-medium truncate text-sm">{name}</div>
                    <div className="text-xs text-zinc-500 mono shrink-0">{timeShort(c.last_ts)}</div>
                  </div>
                  <div className="text-xs text-zinc-500 truncate">{c.last_message || "No messages yet"}</div>
                </div>
              </button>
            );
          })}
          <div className="px-3 pt-4 pb-1 text-xs uppercase tracking-widest text-zinc-500">People</div>
          {filteredUsers.map((u) => (
            <button
              key={u.id} onClick={() => openDm(u.id)}
              data-testid={`user-${u.id}`}
              className="w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-[#101012]"
            >
              <Avatar name={u.name} color={u.avatar_color} size={36} showStatus status={online.has(u.id) ? "online" : "offline"} />
              <div className="min-w-0">
                <div className="text-sm truncate">{u.name}</div>
                <div className="text-xs text-zinc-500 truncate mono">{u.personality_type || "—"}</div>
              </div>
            </button>
          ))}
          {filteredUsers.length === 0 && convos.length === 0 && (
            <div className="p-6 text-sm text-zinc-500">No teammates yet. Invite someone or ask Swell for suggestions.</div>
          )}
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0C]">
        {active ? (
          <>
            <div className="h-16 glass border-b border-[#1c1c1f] flex items-center justify-between px-5">
              <div className="flex items-center gap-3">
                <Avatar name={otherName} color={otherColor} size={38} showStatus status={otherStatus} />
                <div>
                  <div className="font-medium">{otherName}</div>
                  <div className="text-xs text-zinc-500">
                    {otherStatus === "online" ? "Online" : "Offline"}
                    {active.other_user?.personality_type && (
                      <span className="ml-2 mono text-[#4A88FF]">· {active.other_user.personality_type}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => setInCall(true)} data-testid="chat-call-audio" className="text-zinc-400 hover:text-white">
                  <Phone size={18} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setInCall(true)} data-testid="chat-call-video" className="text-zinc-400 hover:text-white">
                  <VideoCamera size={18} />
                </Button>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                  <DotsThreeVertical size={18} />
                </Button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
              {msgs.length === 0 && (
                <div className="text-center text-zinc-500 text-sm py-10">
                  Say hi to {otherName}. Messages are end-to-end delivered in real time.
                </div>
              )}
              {msgs.map((m, i) => {
                const mine = m.sender_id === user.id;
                const prev = msgs[i - 1];
                const grouped = prev && prev.sender_id === m.sender_id;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"} fade-in-up`}>
                    <div className={`flex gap-2 max-w-[70%] ${mine ? "flex-row-reverse" : ""}`}>
                      {!mine && !grouped ? (
                        <Avatar name={m.sender_name} color={m.sender_color} size={30} />
                      ) : <div className="w-[30px] shrink-0" />}
                      <div>
                        {!grouped && (
                          <div className={`text-xs text-zinc-500 mb-1 ${mine ? "text-right" : ""}`}>
                            {mine ? "You" : m.sender_name} · <span className="mono">{timeShort(m.ts)}</span>
                          </div>
                        )}
                        <div className={`px-4 py-2.5 rounded-lg text-sm leading-relaxed ${mine ? "bg-[#0055FF] text-white" : "bg-[#141416] text-zinc-100 border border-[#1f1f22]"}`}>
                          {m.text}
                          {m.attachment_name && (
                            <div className="mt-2">
                              {m.attachment_data?.startsWith("data:image") ? (
                                <img src={m.attachment_data} alt={m.attachment_name} className="max-w-xs rounded-md border border-white/10" />
                              ) : (
                                <a href={m.attachment_data} download={m.attachment_name} className="inline-flex items-center gap-2 mt-1 text-xs bg-black/25 px-2 py-1 rounded-md">
                                  <Paperclip size={12} /> {m.attachment_name}
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-[#1c1c1f] p-4">
              {attach && (
                <div className="mb-2 inline-flex items-center gap-2 bg-[#141416] border border-[#27272A] px-3 py-1.5 rounded-md text-xs">
                  <Paperclip size={12} />
                  <span className="truncate max-w-[240px]">{attach.name}</span>
                  <button onClick={() => setAttach(null)} className="text-zinc-500 hover:text-white"><X size={12} /></button>
                </div>
              )}
              <div className="flex items-end gap-2 bg-[#121214] border border-[#27272A] rounded-lg px-3 py-2">
                <label className="text-zinc-500 hover:text-white cursor-pointer p-1" data-testid="chat-attach">
                  <Paperclip size={18} />
                  <input type="file" className="hidden" onChange={handleFile} />
                </label>
                <textarea
                  rows={1}
                  data-testid="chat-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Type a message…"
                  className="flex-1 bg-transparent outline-none text-sm resize-none max-h-32 min-h-[24px] text-white placeholder:text-zinc-500"
                />
                <Button size="icon" onClick={send} data-testid="chat-send" className="bg-[#0055FF] hover:bg-[#0044CC] h-8 w-8">
                  <PaperPlaneRight size={16} weight="fill" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-3">
            <div className="w-16 h-16 rounded-full bg-[#121214] border border-[#27272A] flex items-center justify-center">
              <ChatIcon />
            </div>
            <div className="text-sm">Pick a teammate to start chatting.</div>
          </div>
        )}
      </div>

      {inCall && <CallOverlay user={active?.other_user} onClose={() => setInCall(false)} />}
    </div>
  );
}

function ChatIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}

function CallOverlay({ user, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center" data-testid="call-overlay">
      <div className="w-full max-w-4xl grid grid-cols-2 gap-4 px-6">
        <div className="aspect-video rounded-lg bg-[#0F0F11] border border-[#1c1c1f] flex items-center justify-center">
          <Avatar name={user?.name || "?"} color={user?.avatar_color || "#0055FF"} size={100} />
        </div>
        <div className="aspect-video rounded-lg bg-[#0F0F11] border border-[#1c1c1f] flex items-center justify-center relative">
          <div className="text-zinc-500 text-sm">You (camera off)</div>
          <div className="absolute bottom-3 left-3 text-xs text-zinc-500 mono">Preview</div>
        </div>
      </div>
      <div className="mt-8 flex items-center gap-3">
        <Button variant="ghost" className="rounded-full bg-[#141416] border border-[#27272A] h-12 w-12">
          <VideoCamera size={20} />
        </Button>
        <Button variant="ghost" className="rounded-full bg-[#141416] border border-[#27272A] h-12 w-12">
          <Phone size={20} />
        </Button>
        <Button onClick={onClose} data-testid="call-end" className="rounded-full bg-red-600 hover:bg-red-700 h-12 px-6">
          End call
        </Button>
      </div>
      <div className="mt-6 text-xs text-zinc-500">In-call for {user?.name || "your teammate"} · this is a demo preview</div>
    </div>
  );
}

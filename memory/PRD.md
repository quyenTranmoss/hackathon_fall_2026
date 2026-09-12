# Swell Teams — PRD

## Problem Statement
Build a Microsoft Teams clone with email/password auth, real-time chat, calls, file share, plus an AI teammate "Swell" (OpenAI GPT-5.6-terra via Emergent Universal Key) who knows every user's 16-Personalities type and coaches on how to reach them. Includes a 16-Personalities style quiz.

## Architecture
- Backend: FastAPI (server.py) + MongoDB (Motor). JWT auth (email/password + bcrypt). WebSockets at /api/ws/{token} for presence + real-time messages. Swell AI via emergentintegrations LlmChat, model openai/gpt-5.6-terra. Quiz logic in quiz_data.py (12 MBTI questions across E/I, S/N, T/F, J/P).
- Frontend: React 19 + React Router 7 + Shadcn UI + Phosphor Icons + Sonner. Dark theme (Obsidian + Cobalt blue + Volt orange for Swell).

## Implemented (Feb 2026)
- Landing, login, signup pages
- 12-question personality quiz + AI-generated personality bio
- Sidebar app shell (Activity, Chat, Swell AI, Calls, Files, People, Profile)
- 1:1 direct messages with real-time WebSocket delivery
- Presence (online/offline dots) via WebSocket
- File attachments in chat (base64, <2MB)
- Video/voice call overlay (UI demo)
- Swell AI chat with team-roster context and persistent history
- People search + profile (own + others)
- Profile edit (name + bio)

## Test Credentials
See /app/memory/test_credentials.md

## Backlog / Next
- P1: Group channels UI polish (backend already supports kind=channel)
- P1: WebRTC real audio/video (currently UI-only overlay)
- P2: Message reactions + threading
- P2: Typing indicators
- P2: Object-storage-backed file uploads (currently base64)

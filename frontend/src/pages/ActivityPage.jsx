import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWs } from "../context/WsContext";
import { Avatar } from "../components/Avatar";
import { Sparkle } from "@phosphor-icons/react";

export default function ActivityPage() {
  const { user } = useAuth();
  const { online } = useWs();
  const nav = useNavigate();
  const [convos, setConvos] = useState([]);

  useEffect(() => {
    api.get("/conversations").then((r) => setConvos(r.data));
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0A0A0C]">
      <div className="max-w-4xl mx-auto p-6 lg:p-10">
        <h1 className="heading text-4xl font-semibold tracking-tight">Activity</h1>
        <p className="text-zinc-400 mt-2 mb-8">Hey {user.name.split(" ")[0]} &mdash; here&apos;s your feed.</p>

        {!user.personality_type && (
          <div className="mb-6 rounded-lg border swell-border swell-tint p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-md swell-gradient flex items-center justify-center shrink-0">
              <Sparkle size={18} weight="fill" className="text-black" />
            </div>
            <div className="flex-1">
              <div className="font-medium">Take the Swell personality quiz</div>
              <div className="text-sm text-zinc-400">Unlock personalized insights and help your team reach you better.</div>
            </div>
            <button onClick={() => nav("/quiz")} data-testid="activity-quiz-cta" className="rounded-md bg-[#FF5D01] hover:bg-[#e65200] px-4 py-2 text-sm text-white">Start quiz</button>
          </div>
        )}

        <div className="rounded-lg border border-[#27272A] bg-[#121214]">
          <div className="p-4 border-b border-[#1c1c1f] flex items-center justify-between">
            <div className="heading font-semibold">Recent conversations</div>
          </div>
          {convos.length === 0 && <div className="p-6 text-sm text-zinc-500">No conversations yet. Head to Chat to start one.</div>}
          {convos.map((c) => {
            const other = c.other_user;
            return (
              <button key={c.id} onClick={() => nav(`/app/chat/${c.id}`)} className="w-full text-left p-4 flex items-center gap-3 hover:bg-[#141416] border-b border-[#1c1c1f] last:border-b-0">
                <Avatar name={other?.name || c.name || "Chat"} color={other?.avatar_color || "#0055FF"} size={40} showStatus status={other && online.has(other.id) ? "online" : "offline"} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{other?.name || c.name}</div>
                  <div className="text-xs text-zinc-500 truncate">{c.last_message || "No messages yet"}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

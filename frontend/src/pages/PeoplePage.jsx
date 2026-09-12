import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useWs } from "../context/WsContext";
import { Avatar } from "../components/Avatar";
import { Input } from "../components/ui/input";
import { MagnifyingGlass, ChatCircle } from "@phosphor-icons/react";
import { Button } from "../components/ui/button";

export default function PeoplePage() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const { online } = useWs();
  const nav = useNavigate();

  useEffect(() => {
    const id = setTimeout(() => {
      api.get("/users", { params: q ? { q } : {} }).then((r) => setUsers(r.data));
    }, 180);
    return () => clearTimeout(id);
  }, [q]);

  const openDm = async (uid) => {
    const { data } = await api.post("/conversations", { kind: "dm", participants: [uid] });
    nav(`/app/chat/${data.id}`);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0A0A0C]">
      <div className="max-w-5xl mx-auto p-6 lg:p-10">
        <h1 className="heading text-4xl font-semibold tracking-tight mb-2">People</h1>
        <p className="text-zinc-400 mb-8">Search your team by name, email, or personality type.</p>
        <div className="relative mb-6">
          <MagnifyingGlass size={18} className="absolute left-3 top-3.5 text-zinc-500" />
          <Input
            data-testid="people-search"
            placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)}
            className="pl-10 h-12 bg-[#121214] border-[#27272A]"
          />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {users.map((u) => (
            <div key={u.id} className="rounded-lg border border-[#27272A] bg-[#121214] p-4 hover:border-[#3F3F46] transition-colors">
              <div className="flex items-center gap-3">
                <Avatar name={u.name} color={u.avatar_color} size={48} showStatus status={online.has(u.id) ? "online" : "offline"} />
                <div className="flex-1 min-w-0">
                  <button onClick={() => nav(`/app/profile/${u.id}`)} className="font-medium text-white hover:text-[#4A88FF] block truncate text-left" data-testid={`people-name-${u.id}`}>{u.name}</button>
                  <div className="text-xs text-zinc-500 truncate">{u.email}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="mono text-[#4A88FF]">{u.personality_type || "—"}</span>
                <Button size="sm" variant="ghost" onClick={() => openDm(u.id)} data-testid={`people-msg-${u.id}`} className="h-7 text-zinc-400 hover:text-white">
                  <ChatCircle size={14} className="mr-1" /> Message
                </Button>
              </div>
              {u.communication_style && (
                <p className="mt-3 text-xs text-zinc-400 leading-relaxed line-clamp-3">{u.communication_style}</p>
              )}
            </div>
          ))}
          {users.length === 0 && <div className="text-zinc-500 col-span-full">No teammates match your search.</div>}
        </div>
      </div>
    </div>
  );
}

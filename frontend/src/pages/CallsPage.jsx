import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { useWs } from "../context/WsContext";
import { Avatar } from "../components/Avatar";
import { VideoCamera, Phone } from "@phosphor-icons/react";
import { Button } from "../components/ui/button";

export default function CallsPage() {
  const [users, setUsers] = useState([]);
  const { online } = useWs();
  const nav = useNavigate();

  useEffect(() => { api.get("/users").then((r) => setUsers(r.data.filter((u) => online.has(u.id) || true))); }, [online]);

  const call = async (uid) => {
    const { data } = await api.post("/conversations", { kind: "dm", participants: [uid] });
    nav(`/app/chat/${data.id}`);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0A0A0C]">
      <div className="max-w-5xl mx-auto p-6 lg:p-10">
        <h1 className="heading text-4xl font-semibold tracking-tight">Calls</h1>
        <p className="text-zinc-400 mt-2 mb-8">Start a video or voice call with anyone on the team.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {users.map((u) => (
            <div key={u.id} className="rounded-lg border border-[#27272A] bg-[#121214] p-4 flex items-center gap-3">
              <Avatar name={u.name} color={u.avatar_color} size={48} showStatus status={online.has(u.id) ? "online" : "offline"} />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{u.name}</div>
                <div className="text-xs text-zinc-500">{online.has(u.id) ? "Online now" : "Offline"}</div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => call(u.id)} data-testid={`call-voice-${u.id}`} className="text-zinc-400 hover:text-white"><Phone size={16} /></Button>
              <Button size="icon" onClick={() => call(u.id)} data-testid={`call-video-${u.id}`} className="bg-[#0055FF] hover:bg-[#0044CC] h-8 w-8"><VideoCamera size={16} /></Button>
            </div>
          ))}
          {users.length === 0 && <div className="text-zinc-500 col-span-full">No teammates yet.</div>}
        </div>
      </div>
    </div>
  );
}

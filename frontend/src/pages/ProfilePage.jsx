import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useWs } from "../context/WsContext";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { At, ChatCircle, PencilSimple, FloppyDisk, X } from "@phosphor-icons/react";

export default function ProfilePage() {
  const { user, setUser, refresh } = useAuth();
  const { online } = useWs();
  const { uid } = useParams();
  const nav = useNavigate();
  const [target, setTarget] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "" });

  const isMe = !uid || uid === user.id;

  useEffect(() => {
    if (isMe) {
      setTarget(user);
      setForm({ name: user.name, bio: user.bio || "" });
    } else {
      api.get(`/users/${uid}`).then((r) => setTarget(r.data));
    }
  }, [uid, user, isMe]);

  if (!target) return <div className="flex-1 flex items-center justify-center text-zinc-500">Loading…</div>;

  const isOnline = isMe ? true : online.has(target.id);

  const save = async () => {
    try {
      const { data } = await api.put("/users/me", form);
      setUser(data);
      setTarget(data);
      await refresh();
      setEditing(false);
      toast.success("Profile updated");
    } catch { toast.error("Update failed"); }
  };

  const startDm = async () => {
    const { data } = await api.post("/conversations", { kind: "dm", participants: [target.id] });
    nav(`/app/chat/${data.id}`);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0A0A0C]">
      <div className="max-w-5xl mx-auto p-6 lg:p-10">
        <div className="flex items-start gap-6 flex-wrap">
          <Avatar name={target.name} color={target.avatar_color} size={96} showStatus status={isOnline ? "online" : "offline"} ring />
          <div className="flex-1 min-w-[240px]">
            {editing ? (
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="text-2xl bg-[#121214] border-[#27272A] mb-2" data-testid="profile-name-input" />
            ) : (
              <h1 className="heading text-4xl font-semibold tracking-tight" data-testid="profile-name">{target.name}</h1>
            )}
            <div className="mt-1 flex items-center gap-3 text-sm text-zinc-400">
              <span className="inline-flex items-center gap-1"><At size={14} /> {target.email}</span>
              <span className={`inline-flex items-center gap-1 ${isOnline ? "text-emerald-400" : "text-zinc-500"}`}>
                <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-zinc-600"}`} />
                {isOnline ? "Online" : "Offline"}
              </span>
              {target.personality_type && <span className="mono text-[#4A88FF]">{target.personality_type}</span>}
            </div>
          </div>
          <div className="flex gap-2">
            {!isMe && (
              <Button onClick={startDm} data-testid="profile-message-btn" className="bg-[#0055FF] hover:bg-[#0044CC]">
                <ChatCircle size={16} className="mr-2" /> Message
              </Button>
            )}
            {isMe && (
              editing ? (
                <>
                  <Button onClick={save} data-testid="profile-save-btn" className="bg-[#0055FF] hover:bg-[#0044CC]"><FloppyDisk size={16} className="mr-2" />Save</Button>
                  <Button variant="ghost" onClick={() => setEditing(false)}><X size={16} /></Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setEditing(true)} data-testid="profile-edit-btn" className="border-[#27272A]"><PencilSimple size={16} className="mr-2" />Edit</Button>
              )
            )}
          </div>
        </div>

        {/* Bento grid */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {target.personality_type ? (
            <>
              <div className="md:col-span-1 rounded-lg border border-[#27272A] bg-[#121214] p-6">
                <div className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Personality</div>
                <div className="heading text-6xl font-semibold tracking-tight">{target.personality_type}</div>
                <div className="heading mt-2 text-[#FF9000]">{target.personality_name}</div>
              </div>
              <div className="md:col-span-2 rounded-lg border swell-border swell-tint p-6">
                <div className="text-[#FF9000] text-xs uppercase tracking-widest mb-2">What this means</div>
                <p className="text-zinc-200 leading-relaxed">{target.personality_bio || "Take the quiz to unlock insights."}</p>
              </div>
              <div className="md:col-span-3 rounded-lg border border-[#27272A] bg-[#121214] p-6">
                <div className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Communication style</div>
                <p className="text-zinc-200 leading-relaxed">{target.communication_style}</p>
              </div>
            </>
          ) : (
            <div className="md:col-span-3 rounded-lg border border-dashed border-[#27272A] p-8 text-center">
              <div className="text-zinc-400 mb-3">{isMe ? "You haven't taken the personality quiz yet." : `${target.name} hasn't taken the quiz yet.`}</div>
              {isMe && (
                <Button onClick={() => nav("/quiz")} className="bg-[#0055FF] hover:bg-[#0044CC]" data-testid="profile-take-quiz">Take the quiz</Button>
              )}
            </div>
          )}
          <div className="md:col-span-3 rounded-lg border border-[#27272A] bg-[#121214] p-6">
            <div className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Bio</div>
            {editing ? (
              <Textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="bg-[#0A0A0C] border-[#27272A]" data-testid="profile-bio-input" />
            ) : (
              <p className="text-zinc-300 leading-relaxed">{target.bio || <span className="text-zinc-500">No bio yet.</span>}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

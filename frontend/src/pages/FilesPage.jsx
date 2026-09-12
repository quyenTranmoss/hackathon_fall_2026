import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Paperclip } from "@phosphor-icons/react";

export default function FilesPage() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    // Aggregate attachments from all my conversations
    (async () => {
      const { data: convos } = await api.get("/conversations");
      const collected = [];
      for (const c of convos) {
        try {
          const { data: msgs } = await api.get(`/conversations/${c.id}/messages`);
          msgs.forEach((m) => {
            if (m.attachment_name) collected.push({ ...m, convo: c });
          });
        } catch { /* skip */ }
      }
      setFiles(collected.reverse());
    })();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0A0A0C]">
      <div className="max-w-5xl mx-auto p-6 lg:p-10">
        <h1 className="heading text-4xl font-semibold tracking-tight">Files</h1>
        <p className="text-zinc-400 mt-2 mb-8">Every attachment shared across your chats.</p>
        {files.length === 0 && <div className="text-zinc-500">No files yet. Attach something in Chat.</div>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {files.map((f) => (
            <a key={f.id} href={f.attachment_data} download={f.attachment_name} className="rounded-lg border border-[#27272A] bg-[#121214] p-4 hover:border-[#3F3F46]">
              <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2"><Paperclip size={12}/>{f.sender_name} · <span className="mono">{new Date(f.ts).toLocaleString()}</span></div>
              {f.attachment_data?.startsWith("data:image") ? (
                <img src={f.attachment_data} alt={f.attachment_name} className="w-full h-32 object-cover rounded-md border border-white/5" />
              ) : (
                <div className="h-32 flex items-center justify-center bg-[#0A0A0C] rounded-md text-zinc-500 text-xs">{f.attachment_name}</div>
              )}
              <div className="mt-2 text-sm truncate">{f.attachment_name}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

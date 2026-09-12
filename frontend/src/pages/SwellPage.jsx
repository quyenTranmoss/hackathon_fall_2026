import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Sparkle, PaperPlaneRight, ArrowClockwise } from "@phosphor-icons/react";
import { toast } from "sonner";

const PROMPTS = [
  "Who on the team is an INFJ?",
  "How should I approach a message to an ENTJ?",
  "Which teammates communicate best asynchronously?",
  "Summarize my communication style.",
];

export default function SwellPage() {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    api.get("/swell/history").then((r) => setMsgs(r.data));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  const ask = async (q) => {
    const question = (q ?? text).trim();
    if (!question) return;
    setBusy(true);
    const now = new Date().toISOString();
    setMsgs((prev) => [...prev, { role: "user", text: question, ts: now }]);
    setText("");
    try {
      const { data } = await api.post("/swell/chat", { text: question });
      setMsgs((prev) => [...prev, { role: "swell", text: data.answer, ts: data.ts }]);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Swell couldn't respond");
    } finally { setBusy(false); }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0A0A0C]">
      <div className="h-16 glass border-b border-[#1c1c1f] flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md swell-gradient flex items-center justify-center">
            <Sparkle size={18} weight="fill" className="text-black" />
          </div>
          <div>
            <div className="font-medium">Swell</div>
            <div className="text-xs text-zinc-500">Your AI teammate · knows the team</div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMsgs([])} className="text-zinc-500 hover:text-white" data-testid="swell-reset">
          <ArrowClockwise size={16} />
        </Button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {msgs.length === 0 && (
          <div className="max-w-3xl mx-auto px-6 py-16">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs uppercase tracking-widest text-[#FF5D01]">Hi {user.name.split(" ")[0]}</span>
            </div>
            <h1 className="heading text-4xl sm:text-5xl leading-tight tracking-tight mb-6">
              Ask me anything about your team.
            </h1>
            <p className="text-zinc-400 leading-relaxed max-w-lg mb-8">
              I know every teammate&apos;s personality type and communication style. Ask how to reach someone, or how to work with them.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {PROMPTS.map((p) => (
                <button
                  key={p} onClick={() => ask(p)}
                  data-testid={`swell-prompt-${p.slice(0, 12)}`}
                  className="text-left rounded-lg border border-[#27272A] p-4 hover:swell-border hover:swell-tint transition-colors"
                >
                  <span className="text-sm text-zinc-200">{p}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
          {msgs.map((m, i) => (
            <div key={i} className={`flex gap-3 fade-in-up ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "swell" && (
                <div className="w-8 h-8 rounded-md swell-gradient flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkle size={14} weight="fill" className="text-black" />
                </div>
              )}
              <div className={`max-w-[85%] px-4 py-3 rounded-lg text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-[#0055FF] text-white"
                  : "swell-tint border swell-border text-zinc-100"
              }`}>
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex gap-3 fade-in-up">
              <div className="w-8 h-8 rounded-md swell-gradient flex items-center justify-center shrink-0">
                <Sparkle size={14} weight="fill" className="text-black" />
              </div>
              <div className="text-sm text-zinc-500 pt-2">Swell is thinking…</div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-[#1c1c1f] p-4">
        <div className="max-w-3xl mx-auto flex items-end gap-2 bg-[#121214] border border-[#27272A] rounded-lg px-3 py-2">
          <textarea
            rows={1}
            data-testid="swell-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); } }}
            placeholder="Ask Swell about your teammates…"
            className="flex-1 bg-transparent outline-none text-sm resize-none max-h-32 min-h-[24px] text-white placeholder:text-zinc-500"
          />
          <Button size="icon" onClick={() => ask()} disabled={busy} data-testid="swell-send" className="bg-[#FF5D01] hover:bg-[#e65200] h-8 w-8">
            <PaperPlaneRight size={16} weight="fill" />
          </Button>
        </div>
        <div className="max-w-3xl mx-auto mt-2 text-xs text-zinc-500">Powered by GPT-5.6 Terra</div>
      </div>
    </div>
  );
}

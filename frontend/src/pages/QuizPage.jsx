import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Sparkle, ArrowRight } from "@phosphor-icons/react";

export default function QuizPage() {
  const nav = useNavigate();
  const { refresh } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [idx, setIdx] = useState(0);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/quiz/questions").then((r) => setQuestions(r.data.questions));
  }, []);

  if (!questions.length) return <div className="min-h-screen flex items-center justify-center bg-[#09090B] text-zinc-500">Loading quiz…</div>;

  const q = questions[idx];
  const total = questions.length;
  const progress = ((idx + (result ? 1 : 0)) / total) * 100;

  const answer = (choice) => {
    const nextAnswers = { ...answers, [q.id]: choice };
    setAnswers(nextAnswers);
    if (idx < total - 1) {
      setIdx(idx + 1);
    } else {
      submit(nextAnswers);
    }
  };

  const submit = async (final) => {
    setBusy(true);
    try {
      const payload = Object.fromEntries(Object.entries(final).map(([k, v]) => [String(k), v]));
      const { data } = await api.post("/quiz/submit", { answers: payload });
      setResult(data);
      await refresh();
    } catch (e) {
      toast.error("Failed to submit quiz");
    } finally { setBusy(false); }
  };

  if (result) {
    return (
      <div className="min-h-screen bg-[#09090B] text-white flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-3xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-md swell-gradient flex items-center justify-center">
              <Sparkle size={16} weight="fill" className="text-black" />
            </div>
            <span className="text-xs uppercase tracking-widest text-[#FF5D01]">Analysis by Swell</span>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1 rounded-lg border border-[#27272A] bg-[#121214] p-6">
              <div className="text-zinc-400 text-sm mb-2">Your type</div>
              <div className="heading text-6xl font-semibold tracking-tight" data-testid="quiz-result-type">{result.type}</div>
              <div className="heading text-lg mt-2 text-[#FF9000]">{result.name}</div>
            </div>
            <div className="md:col-span-2 rounded-lg border border-[#27272A] bg-[#121214] p-6">
              <div className="text-zinc-400 text-sm mb-2">What this means for you</div>
              <p className="text-zinc-200 leading-relaxed" data-testid="quiz-result-bio">{result.personality_bio}</p>
            </div>
            <div className="md:col-span-3 rounded-lg border swell-border swell-tint p-6">
              <div className="text-[#FF9000] text-sm mb-2">Communication style</div>
              <p className="text-zinc-200 leading-relaxed">{result.communication_style}</p>
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <Button
              onClick={() => nav("/app/chat")}
              className="h-11 px-6 bg-[#0055FF] hover:bg-[#0044CC]"
              data-testid="quiz-continue-button"
            >
              Enter Swell Teams <ArrowRight size={18} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md swell-gradient flex items-center justify-center">
              <Sparkle size={16} weight="fill" className="text-black" />
            </div>
            <span className="heading font-semibold">Swell Personality Quiz</span>
          </div>
          <span className="text-sm text-zinc-500 mono">{idx + 1} / {total}</span>
        </div>
        <Progress value={progress} className="h-1 bg-[#27272A]" data-testid="quiz-progress" />
        <div className="mt-14">
          <div className="text-zinc-500 uppercase text-xs tracking-widest mb-3">Question {idx + 1}</div>
          <h2 className="heading text-3xl sm:text-4xl leading-tight mb-10" data-testid="quiz-question">{q.question}</h2>
          <div className="space-y-3">
            <button
              onClick={() => answer("A")}
              disabled={busy}
              data-testid="quiz-answer-a"
              className="w-full text-left p-5 rounded-lg border border-[#27272A] hover:border-[#0055FF] hover:bg-[#121214] transition-colors group"
            >
              <div className="text-xs text-zinc-500 mb-1 mono">A</div>
              <div className="text-zinc-100 group-hover:text-white">{q.a}</div>
            </button>
            <button
              onClick={() => answer("B")}
              disabled={busy}
              data-testid="quiz-answer-b"
              className="w-full text-left p-5 rounded-lg border border-[#27272A] hover:border-[#0055FF] hover:bg-[#121214] transition-colors group"
            >
              <div className="text-xs text-zinc-500 mb-1 mono">B</div>
              <div className="text-zinc-100 group-hover:text-white">{q.b}</div>
            </button>
          </div>
          {busy && <div className="mt-6 text-sm text-zinc-500">Swell is analyzing your answers…</div>}
        </div>
      </div>
    </div>
  );
}

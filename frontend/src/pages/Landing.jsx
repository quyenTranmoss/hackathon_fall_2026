import { Link } from "react-router-dom";
import { Sparkle, ArrowRight } from "@phosphor-icons/react";
import { Button } from "../components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md swell-gradient flex items-center justify-center">
            <Sparkle size={16} weight="fill" className="text-black" />
          </div>
          <span className="heading font-semibold">Swell Teams</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link to="/login" className="text-zinc-300 hover:text-white" data-testid="landing-login-link">Sign in</Link>
          <Link to="/signup" data-testid="landing-signup-link">
            <Button className="bg-[#0055FF] hover:bg-[#0044CC]">Get started</Button>
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 pt-24 pb-32">
        <div className="inline-flex items-center gap-2 mb-6 rounded-full px-3 py-1 border swell-border swell-tint">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5D01]" />
          <span className="text-xs uppercase tracking-widest text-[#FF9000]">Meet Swell</span>
        </div>
        <h1 className="heading text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05]">
          Team chat with a<br/>brain for people.
        </h1>
        <p className="mt-6 text-lg text-zinc-400 leading-relaxed max-w-2xl">
          A Microsoft Teams-style workspace with real-time chat, calls, and file share &mdash; plus <span className="text-white">Swell</span>, an AI teammate who understands each person&apos;s personality type and coaches you on how to reach them.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link to="/signup" data-testid="landing-cta">
            <Button className="h-12 px-6 bg-[#0055FF] hover:bg-[#0044CC]">
              Start free <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
          <Link to="/login" className="text-sm text-zinc-400 hover:text-white">or sign in →</Link>
        </div>
        <div className="mt-20 grid sm:grid-cols-3 gap-4">
          <Feature title="Real-time chat" body="Direct messages, group channels, files, calls." />
          <Feature title="Swell AI" body="Ask about a teammate — get their type, style, and best way to reach them." />
          <Feature title="16 Personalities" body="Take the quiz. See yours. Understand your team." />
        </div>
      </main>
    </div>
  );
}

function Feature({ title, body }) {
  return (
    <div className="rounded-lg border border-[#27272A] p-5">
      <div className="heading text-lg mb-1">{title}</div>
      <div className="text-sm text-zinc-400 leading-relaxed">{body}</div>
    </div>
  );
}

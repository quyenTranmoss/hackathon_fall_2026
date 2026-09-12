import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { SignIn, UserPlus, Sparkle } from "@phosphor-icons/react";

export default function AuthPage({ mode }) {
  const isSignup = mode === "signup";
  const nav = useNavigate();
  const { login, signup } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isSignup) {
        const u = await signup(form.name.trim(), form.email.trim(), form.password);
        toast.success(`Welcome, ${u.name}!`);
        nav("/quiz");
      } else {
        const u = await login(form.email.trim(), form.password);
        toast.success(`Hi ${u.name}`);
        nav(u.personality_type ? "/app/chat" : "/quiz");
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Something went wrong");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#09090B] text-white">
      {/* Left: form */}
      <div className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 mb-10" data-testid="auth-logo-link">
            <div className="w-9 h-9 rounded-md swell-gradient flex items-center justify-center">
              <Sparkle size={20} weight="fill" className="text-black" />
            </div>
            <span className="heading text-xl font-semibold tracking-tight">Swell Teams</span>
          </Link>
          <h1 className="heading text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
            {isSignup ? "Join your team." : "Welcome back."}
          </h1>
          <p className="text-zinc-400 text-base mb-8 leading-relaxed">
            {isSignup
              ? "Create an account, meet Swell, and discover the personality-driven way to work together."
              : "Log in to chat, collaborate, and let Swell decode your team."}
          </p>

          <form onSubmit={submit} className="space-y-5">
            {isSignup && (
              <div>
                <Label htmlFor="name" className="text-zinc-300">Full name</Label>
                <Input
                  id="name" data-testid="auth-name-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1.5 bg-[#121214] border-[#27272A] h-11"
                  placeholder="Jane Doe" required
                />
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-zinc-300">Email</Label>
              <Input
                id="email" data-testid="auth-email-input" type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1.5 bg-[#121214] border-[#27272A] h-11"
                placeholder="you@work.com" required
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-zinc-300">Password</Label>
              <Input
                id="password" data-testid="auth-password-input" type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1.5 bg-[#121214] border-[#27272A] h-11"
                placeholder="••••••••" required minLength={6}
              />
            </div>
            <Button
              type="submit" disabled={busy}
              data-testid="auth-submit-button"
              className="w-full h-11 bg-[#0055FF] hover:bg-[#0044CC] text-white font-medium"
            >
              {busy ? "..." : isSignup ? (<><UserPlus size={18} className="mr-2" />Create account</>) : (<><SignIn size={18} className="mr-2" />Sign in</>)}
            </Button>
          </form>
          <div className="mt-6 text-sm text-zinc-400">
            {isSignup ? (
              <>Already have an account? <Link to="/login" className="text-[#4A88FF] hover:text-white" data-testid="auth-switch-login">Sign in</Link></>
            ) : (
              <>New here? <Link to="/signup" className="text-[#4A88FF] hover:text-white" data-testid="auth-switch-signup">Create an account</Link></>
            )}
          </div>
        </div>
      </div>

      {/* Right: brand panel */}
      <div className="hidden lg:block relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1690378820474-b468b8ee64d3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwyfHxvZmZpY2UlMjB0ZWFtd29yayUyMG1vZGVybnxlbnwwfHx8fDE3ODkxNzUyNDV8MA&ixlib=rb-4.1.0&q=85"
          alt="teamwork" className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#09090B]/70" />
        <div className="relative h-full flex flex-col justify-end p-12">
          <div className="glass rounded-lg p-6 border border-white/5 max-w-md">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md swell-gradient flex items-center justify-center">
                <Sparkle size={14} weight="fill" className="text-black" />
              </div>
              <span className="text-xs uppercase tracking-widest text-[#FF5D01]">Meet Swell</span>
            </div>
            <p className="heading text-2xl leading-snug">
              &ldquo;Sarah is an INFJ &mdash; reach her with a thoughtful DM, not a group ping. She&apos;ll reply after lunch.&rdquo;
            </p>
            <p className="mt-4 text-sm text-zinc-400">Your AI teammate. Knows who&apos;s who, and how to talk to them.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

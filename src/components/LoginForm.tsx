"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

/* ── tiny icon helpers ─────────────────────────────────────── */
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
         stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0
           8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542
           7-4.477 0-8.268-2.943-9.542-7z"/>
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
         stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478
           0-8.269-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3
           3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88
           9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59
           3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943
           9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
    </svg>
  );
}

/* ── shared input style ─────────────────────────────────────── */
const inputCls =
  "w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-900 " +
  "placeholder-slate-400 px-3.5 py-2.5 text-sm transition " +
  "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent " +
  "hover:border-slate-300";

/* ── tabs ───────────────────────────────────────────────────── */
type Tab = "signin" | "signup";

export function LoginForm() {
  const router = useRouter();
  const [tab, setTab]           = useState<Tab>("signin");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [info, setInfo]         = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  /* ── sign in ──────────────────────────────────────────────── */
  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password. Please try again.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  /* ── sign up (creates account via API) ─────────────────────── */
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Registration failed."); return; }
      // Auto sign-in after registration
      const signInRes = await signIn("credentials", { email, password, redirect: false });
      if (signInRes?.error) {
        setInfo("Account created! Please sign in.");
        setTab("signin");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">

      {/* Tab switcher */}
      <div className="flex bg-slate-100 rounded-xl p-1 gap-1" role="tablist">
        {(["signin", "signup"] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => { setTab(t); setError(null); setInfo(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all
              ${tab === t
                ? "bg-white text-slate-900 shadow-sm shadow-slate-200"
                : "text-slate-500 hover:text-slate-700"}`}
          >
            {t === "signin" ? "Sign In" : "Create Account"}
          </button>
        ))}
      </div>

      {/* Alerts */}
      {error && (
        <div role="alert" className="flex items-start gap-2.5 bg-red-50 border border-red-200
                                     text-red-700 text-sm rounded-xl px-4 py-3">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {error}
        </div>
      )}
      {info && (
        <div role="status" className="bg-emerald-50 border border-emerald-200 text-emerald-700
                                      text-sm rounded-xl px-4 py-3">
          {info}
        </div>
      )}

      {/* ── SIGN IN ─────────────────────────────────────────── */}
      {tab === "signin" && (
        <form onSubmit={handleSignIn} className="space-y-4" aria-label="Sign in">
          <div>
            <label htmlFor="si-email"
                   className="block text-sm font-medium text-slate-700 mb-1.5">
              Email address
            </label>
            <input id="si-email" type="email" autoComplete="email" required
                   value={email} onChange={e => setEmail(e.target.value)}
                   className={inputCls} placeholder="you@company.com"/>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="si-pw"
                     className="text-sm font-medium text-slate-700">
                Password
              </label>
            </div>
            <div className="relative">
              <input id="si-pw"
                     type={showPw ? "text" : "password"}
                     autoComplete="current-password" required
                     value={password} onChange={e => setPassword(e.target.value)}
                     className={`${inputCls} pr-10`} placeholder="••••••••"/>
              <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2
                                 text-slate-400 hover:text-slate-700 transition"
                      aria-label={showPw ? "Hide password" : "Show password"}>
                <EyeIcon open={showPw}/>
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
                             disabled:bg-indigo-300 text-white font-semibold py-2.5 px-4
                             rounded-xl text-sm transition shadow-sm shadow-indigo-200
                             focus:outline-none focus:ring-2 focus:ring-indigo-500
                             focus:ring-offset-2 flex items-center justify-center gap-2">
            {loading
              ? <><Spinner/> Signing in…</>
              : "Sign in"}
          </button>
        </form>
      )}

      {/* ── SIGN UP ─────────────────────────────────────────── */}
      {tab === "signup" && (
        <form onSubmit={handleSignUp} className="space-y-4" aria-label="Create account">
          <div>
            <label htmlFor="su-name"
                   className="block text-sm font-medium text-slate-700 mb-1.5">
              Full name
            </label>
            <input id="su-name" type="text" autoComplete="name" required
                   value={name} onChange={e => setName(e.target.value)}
                   className={inputCls} placeholder="Jane Smith"/>
          </div>

          <div>
            <label htmlFor="su-email"
                   className="block text-sm font-medium text-slate-700 mb-1.5">
              Email address
            </label>
            <input id="su-email" type="email" autoComplete="email" required
                   value={email} onChange={e => setEmail(e.target.value)}
                   className={inputCls} placeholder="you@company.com"/>
          </div>

          <div>
            <label htmlFor="su-pw"
                   className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input id="su-pw"
                     type={showPw ? "text" : "password"}
                     autoComplete="new-password" required minLength={8}
                     value={password} onChange={e => setPassword(e.target.value)}
                     className={`${inputCls} pr-10`} placeholder="Min. 8 characters"/>
              <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2
                                 text-slate-400 hover:text-slate-700 transition"
                      aria-label={showPw ? "Hide password" : "Show password"}>
                <EyeIcon open={showPw}/>
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
                             disabled:bg-indigo-300 text-white font-semibold py-2.5 px-4
                             rounded-xl text-sm transition shadow-sm shadow-indigo-200
                             focus:outline-none focus:ring-2 focus:ring-indigo-500
                             focus:ring-offset-2 flex items-center justify-center gap-2">
            {loading
              ? <><Spinner/> Creating account…</>
              : "Create account"}
          </button>
        </form>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { store } from "@/lib/store";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signup");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Accept anything. Brief pause for feel.
    setTimeout(() => {
      store.setUser({
        username: username || "demo_user",
        email: email || "demo@tix.io",
        createdAt: Date.now(),
        kycVerified: false,
      });
      router.push("/kyc");
    }, 500);
  };

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-6">
      {/* hero left */}
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-16 items-center">
        <div className="hidden md:block animate-fade-in">
          <div className="font-mono text-xs text-accent tracking-[0.2em] mb-6">
            [ TIX PROTOCOL v1.0 ]
          </div>
          <h1 className="text-5xl lg:text-6xl font-sans font-semibold leading-[1.05] tracking-tight mb-6">
            tickets you <span className="text-accent">actually</span> own.
          </h1>
          <p className="text-fg-dim text-lg leading-relaxed max-w-md mb-8">
            Tokenized tickets held in your own wallet. Buy primary, resell secondary, no gatekeeper between you and your seat.
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center gap-3 text-fg-dim">
              <span className="text-accent">▸</span>
              <span>Self-custody wallet, one-tap setup</span>
            </div>
            <div className="flex items-center gap-3 text-fg-dim">
              <span className="text-accent">▸</span>
              <span>Peer-to-peer resale, zero platform lock-in</span>
            </div>
            <div className="flex items-center gap-3 text-fg-dim">
              <span className="text-accent">▸</span>
              <span>Verified identity via KYC, once</span>
            </div>
          </div>
        </div>

        {/* auth card */}
        <div className="animate-slide-up">
          <div className="bg-bg-card border border-border rounded-lg p-8 relative overflow-hidden">
            {/* corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-accent/60" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-accent/60" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-accent/60" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-accent/60" />

            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 border border-accent flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-accent" />
              </div>
              <div className="font-mono text-xs text-accent tracking-[0.2em]">
                {mode === "signup" ? "NEW ACCESS" : "RETURNING"}
              </div>
            </div>
            <h2 className="text-2xl font-semibold mb-6">
              {mode === "signup" ? "Create account" : "Sign in"}
            </h2>

            <form onSubmit={submit} className="space-y-4">
              <Field
                label="Username"
                value={username}
                onChange={setUsername}
                placeholder="e.g. neon_runner"
                autoFocus
              />
              {mode === "signup" && (
                <Field
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@domain.com"
                />
              )}
              <Field
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-bg font-mono text-sm font-semibold uppercase tracking-wider py-3 rounded hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="caret">authenticating</span>
                ) : (
                  <>
                    <span>{mode === "signup" ? "Create account" : "Sign in"}</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <button
                onClick={() => setMode(mode === "signup" ? "login" : "signup")}
                className="font-mono text-xs text-fg-dim hover:text-accent transition-colors"
              >
                {mode === "signup"
                  ? "Already have an account? Sign in →"
                  : "Need an account? Sign up →"}
              </button>
            </div>
          </div>

          <div className="mt-4 font-mono text-[10px] text-fg-faint text-center tracking-wider">
            DEMO MODE · ANY CREDENTIALS ACCEPTED
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-fg-dim">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="mt-1.5 w-full bg-bg border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:border-accent focus:glow transition-all placeholder:text-fg-faint"
      />
    </label>
  );
}

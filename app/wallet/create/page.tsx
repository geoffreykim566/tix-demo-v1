"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  generateSeedPhrase,
  generateWalletAddress,
  shortAddr,
  store,
} from "@/lib/store";
import StepIndicator from "@/components/StepIndicator";

type Stage = "intro" | "generating" | "seed" | "confirm" | "pin" | "done";

export default function WalletCreatePage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("intro");
  const [address] = useState(() => generateWalletAddress());
  const seed = useMemo(() => generateSeedPhrase(), []);
  const [seedRevealed, setSeedRevealed] = useState(false);
  const [confirmIndices, setConfirmIndices] = useState<number[]>([]);
  const [pickedConfirms, setPickedConfirms] = useState<string[]>([]);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinError, setPinError] = useState("");

  useEffect(() => {
    const user = store.getUser();
    if (!user) router.replace("/login");
    else if (!user.kycVerified) router.replace("/kyc");
  }, [router]);

  // pick 3 random indices to verify the user wrote down the seed
  useEffect(() => {
    if (stage === "confirm" && confirmIndices.length === 0) {
      const idx: number[] = [];
      while (idx.length < 3) {
        const n = Math.floor(Math.random() * seed.length);
        if (!idx.includes(n)) idx.push(n);
      }
      idx.sort((a, b) => a - b);
      setConfirmIndices(idx);
      setPickedConfirms(Array(3).fill(""));
    }
  }, [stage, confirmIndices.length, seed.length]);

  const generate = () => {
    setStage("generating");
    setTimeout(() => setStage("seed"), 1800);
  };

  const confirmValid =
    pickedConfirms.length === 3 &&
    pickedConfirms.every(
      (w, i) => w.trim().toLowerCase() === seed[confirmIndices[i]]
    );

  const submitPin = () => {
    setPinError("");
    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setPinError("PIN must be 6 digits");
      return;
    }
    if (pin !== pinConfirm) {
      setPinError("PINs don't match");
      return;
    }
    store.setWallet({
      address,
      createdAt: Date.now(),
      balanceUsd: 500,
    });
    setStage("done");
  };

  const copy = (text: string) => navigator.clipboard?.writeText(text);

  return (
    <div className="min-h-screen grid-bg">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <StepIndicator
            steps={[
              { label: "Account", status: "done" },
              { label: "Identity", status: "done" },
              { label: "Wallet", status: "current" },
            ]}
          />
        </div>

        <div className="bg-bg-card border border-border rounded-lg overflow-hidden animate-slide-up">
          <div className="border-b border-border px-6 py-4">
            <div className="font-mono text-xs text-accent tracking-[0.2em] mb-1">
              [ STEP 03 / WALLET PROVISIONING ]
            </div>
            <h1 className="text-xl font-semibold">
              {stage === "intro" && "Create your wallet"}
              {stage === "generating" && "Generating wallet"}
              {stage === "seed" && "Back up your recovery phrase"}
              {stage === "confirm" && "Confirm your recovery phrase"}
              {stage === "pin" && "Set a wallet PIN"}
              {stage === "done" && "Wallet ready"}
            </h1>
          </div>

          <div className="p-6">
            {stage === "intro" && (
              <>
                <p className="text-sm text-fg-dim leading-relaxed mb-6">
                  Your wallet will hold tickets as tokens you own outright. You control the keys — not us. That means you can transfer, resell, or walk away with your tickets any time.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                  {[
                    { n: "01", t: "Generate keys", d: "Cryptographic keypair created locally" },
                    { n: "02", t: "Save recovery phrase", d: "12-word backup to restore your wallet" },
                    { n: "03", t: "Set PIN", d: "6-digit code to authorize transactions" },
                  ].map((b) => (
                    <div key={b.n} className="bg-bg/50 border border-border-soft rounded p-4">
                      <div className="font-mono text-[10px] text-accent tracking-wider mb-2">
                        {b.n}
                      </div>
                      <div className="text-sm font-medium mb-1">{b.t}</div>
                      <div className="text-xs text-fg-dim leading-relaxed">{b.d}</div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={generate}
                  className="w-full bg-accent text-bg font-mono text-sm font-semibold uppercase tracking-wider py-3 rounded hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Generate wallet</span>
                  <span>→</span>
                </button>
              </>
            )}

            {stage === "generating" && (
              <div className="py-16 text-center">
                <div className="inline-block mb-6">
                  <div className="w-20 h-20 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                </div>
                <div className="font-mono text-sm text-accent caret mb-2">
                  Deriving keys
                </div>
                <div className="font-mono text-[10px] text-fg-dim space-y-1 tracking-wider">
                  <div>· Generating entropy from device noise</div>
                  <div>· Deriving master keypair (secp256k1)</div>
                  <div>· Computing public address</div>
                </div>
              </div>
            )}

            {stage === "seed" && (
              <>
                <div className="bg-yellow-500/5 border border-yellow-500/30 rounded p-4 mb-6 flex gap-3">
                  <div className="text-yellow-500 text-lg">⚠</div>
                  <div className="text-xs text-fg-dim leading-relaxed">
                    <div className="text-yellow-400 font-medium mb-1">
                      Write these 12 words down in order.
                    </div>
                    Anyone with this phrase controls your wallet. Never share it. If you lose it, you lose access to your tickets.
                  </div>
                </div>

                <div className="relative">
                  <div
                    className={`grid grid-cols-3 gap-2 p-5 bg-bg border border-border rounded-lg font-mono text-sm transition-all ${
                      seedRevealed ? "" : "blur-md select-none pointer-events-none"
                    }`}
                  >
                    {seed.map((w, i) => (
                      <div
                        key={i}
                        className="bg-bg-card border border-border-soft rounded px-3 py-2 flex items-center gap-2"
                      >
                        <span className="text-fg-faint text-[10px] w-5">
                          {(i + 1).toString().padStart(2, "0")}
                        </span>
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                  {!seedRevealed && (
                    <button
                      onClick={() => setSeedRevealed(true)}
                      className="absolute inset-0 flex items-center justify-center font-mono text-xs text-accent hover:bg-accent/5 transition-colors rounded-lg"
                    >
                      <div className="bg-bg-card border border-accent rounded px-4 py-2 glow">
                        <span className="tracking-wider">▸ TAP TO REVEAL</span>
                      </div>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => copy(seed.join(" "))}
                  className="w-full mt-4 font-mono text-xs text-fg-dim hover:text-accent border border-border-soft hover:border-accent/40 py-2 rounded transition-colors"
                >
                  Copy to clipboard
                </button>

                <button
                  onClick={() => setStage("confirm")}
                  disabled={!seedRevealed}
                  className="w-full mt-6 bg-accent text-bg font-mono text-sm font-semibold uppercase tracking-wider py-3 rounded hover:bg-accent/90 disabled:bg-bg-hover disabled:text-fg-faint disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <span>I've saved it — continue</span>
                  <span>→</span>
                </button>
              </>
            )}

            {stage === "confirm" && (
              <>
                <p className="text-sm text-fg-dim leading-relaxed mb-6">
                  Quick check — enter the words at the following positions to confirm you saved your phrase correctly.
                </p>
                <div className="space-y-3 mb-6">
                  {confirmIndices.map((idx, i) => (
                    <div key={i}>
                      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-fg-dim mb-1.5">
                        Word #{(idx + 1).toString().padStart(2, "0")}
                      </div>
                      <input
                        value={pickedConfirms[i]}
                        onChange={(e) => {
                          const next = [...pickedConfirms];
                          next[i] = e.target.value;
                          setPickedConfirms(next);
                        }}
                        className="w-full bg-bg border border-border rounded px-3 py-2.5 font-mono text-sm focus:outline-none focus:border-accent transition-colors"
                        placeholder="type the word..."
                      />
                    </div>
                  ))}
                </div>
                {pickedConfirms.some((w) => w.length > 0) && !confirmValid && (
                  <div className="font-mono text-xs text-red-400 mb-3">
                    Words don't match — check your backup.
                  </div>
                )}
                <button
                  onClick={() => setStage("pin")}
                  disabled={!confirmValid}
                  className="w-full bg-accent text-bg font-mono text-sm font-semibold uppercase tracking-wider py-3 rounded hover:bg-accent/90 disabled:bg-bg-hover disabled:text-fg-faint disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <span>Confirm</span>
                  <span>→</span>
                </button>
                <button
                  onClick={() => setStage("seed")}
                  className="w-full mt-3 font-mono text-xs text-fg-dim hover:text-accent transition-colors"
                >
                  ← Back to phrase
                </button>
              </>
            )}

            {stage === "pin" && (
              <>
                <p className="text-sm text-fg-dim leading-relaxed mb-6">
                  Set a 6-digit PIN. You'll enter this to authorize purchases and transfers.
                </p>
                <div className="space-y-4 mb-6">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-fg-dim mb-1.5">
                      New PIN
                    </div>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-bg border border-border rounded px-3 py-2.5 font-mono text-lg tracking-[0.4em] text-center focus:outline-none focus:border-accent transition-colors"
                      placeholder="••••••"
                    />
                  </div>
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-fg-dim mb-1.5">
                      Confirm PIN
                    </div>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={pinConfirm}
                      onChange={(e) =>
                        setPinConfirm(e.target.value.replace(/\D/g, ""))
                      }
                      className="w-full bg-bg border border-border rounded px-3 py-2.5 font-mono text-lg tracking-[0.4em] text-center focus:outline-none focus:border-accent transition-colors"
                      placeholder="••••••"
                    />
                  </div>
                </div>
                {pinError && (
                  <div className="font-mono text-xs text-red-400 mb-3">
                    {pinError}
                  </div>
                )}
                <button
                  onClick={submitPin}
                  className="w-full bg-accent text-bg font-mono text-sm font-semibold uppercase tracking-wider py-3 rounded hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Create wallet</span>
                  <span>→</span>
                </button>
              </>
            )}

            {stage === "done" && (
              <div className="py-6 text-center animate-fade-in">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full border-2 border-accent flex items-center justify-center glow-strong">
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="font-mono text-xs text-accent tracking-[0.2em] mb-2">
                  [ WALLET LIVE ]
                </div>
                <h3 className="text-2xl font-semibold mb-2">
                  Your wallet is ready
                </h3>

                <div className="max-w-sm mx-auto mt-6 bg-bg border border-border rounded-lg p-4 text-left">
                  <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-fg-dim mb-2">
                    Public address
                  </div>
                  <div className="font-mono text-xs text-accent break-all mb-3">
                    {address}
                  </div>
                  <div className="flex items-center justify-between font-mono text-xs border-t border-border-soft pt-3">
                    <span className="text-fg-dim">Available balance</span>
                    <span className="text-fg font-semibold">$500.00</span>
                  </div>
                  <div className="font-mono text-[10px] text-fg-faint mt-2">
                    Demo starter balance
                  </div>
                </div>

                <button
                  onClick={() => router.push("/home")}
                  className="mt-8 bg-accent text-bg font-mono text-sm font-semibold uppercase tracking-wider px-8 py-3 rounded hover:bg-accent/90 transition-colors inline-flex items-center gap-2"
                >
                  <span>Browse events</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { store } from "@/lib/store";
import StepIndicator from "@/components/StepIndicator";

type Stage = "upload" | "scanning" | "verified";

export default function KycPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const user = store.getUser();
    if (!user) router.replace("/login");
  }, [router]);

  const handleFile = (f: File) => {
    setFileName(f.name);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const startScan = () => {
    setStage("scanning");
    setTimeout(() => {
      setStage("verified");
      const user = store.getUser();
      if (user) store.setUser({ ...user, kycVerified: true });
    }, 2400);
  };

  const goNext = () => router.push("/wallet/create");

  return (
    <div className="min-h-screen grid-bg">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <StepIndicator
            steps={[
              { label: "Account", status: "done" },
              { label: "Identity", status: "current" },
              { label: "Wallet", status: "upcoming" },
            ]}
          />
        </div>

        <div className="bg-bg-card border border-border rounded-lg overflow-hidden animate-slide-up">
          <div className="border-b border-border px-6 py-4 flex items-center justify-between">
            <div>
              <div className="font-mono text-xs text-accent tracking-[0.2em] mb-1">
                [ STEP 02 / IDENTITY VERIFICATION ]
              </div>
              <h1 className="text-xl font-semibold">Verify your identity</h1>
            </div>
            <div className="font-mono text-[10px] text-fg-faint tracking-wider px-2 py-1 border border-border rounded">
              KYC · TIER 1
            </div>
          </div>

          <div className="p-6">
            {stage === "upload" && (
              <>
                <p className="text-sm text-fg-dim mb-6 leading-relaxed">
                  Upload a photo of a government-issued ID (driver's license, passport, or national ID). This verifies you're a real person so you can hold and transfer tickets.
                </p>

                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-10 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all group"
                >
                  {preview ? (
                    <div className="space-y-3">
                      <img
                        src={preview}
                        alt="ID preview"
                        className="max-h-56 mx-auto rounded border border-border"
                      />
                      <div className="font-mono text-xs text-fg-dim">
                        <span className="text-accent">✓</span> {fileName}
                      </div>
                      <div className="font-mono text-[10px] text-fg-faint">
                        Click to replace
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 mx-auto mb-4 border border-border rounded flex items-center justify-center group-hover:border-accent transition-colors">
                        <svg
                          className="w-5 h-5 text-fg-dim group-hover:text-accent"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                      </div>
                      <div className="font-mono text-sm text-fg mb-1">
                        Drop ID photo or click to upload
                      </div>
                      <div className="font-mono text-[10px] text-fg-faint tracking-wider">
                        JPG · PNG · HEIC · max 10MB
                      </div>
                    </>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />

                <div className="mt-6 bg-bg/50 border border-border-soft rounded p-4 space-y-2 font-mono text-xs text-fg-dim">
                  <div className="flex items-center gap-2">
                    <span className="text-accent">▸</span>
                    <span>Image is processed locally — never uploaded in this demo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-accent">▸</span>
                    <span>Any image will be accepted for testing purposes</span>
                  </div>
                </div>

                <button
                  onClick={startScan}
                  disabled={!preview}
                  className="mt-6 w-full bg-accent text-bg font-mono text-sm font-semibold uppercase tracking-wider py-3 rounded hover:bg-accent/90 disabled:bg-bg-hover disabled:text-fg-faint disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <span>Run verification</span>
                  <span>→</span>
                </button>
              </>
            )}

            {stage === "scanning" && (
              <div className="py-12 text-center">
                <div className="relative w-48 h-32 mx-auto mb-8 border border-accent/40 rounded overflow-hidden">
                  {preview && (
                    <img
                      src={preview}
                      alt="scanning"
                      className="w-full h-full object-cover opacity-60"
                    />
                  )}
                  <div
                    className="absolute inset-x-0 h-1 bg-accent shadow-[0_0_20px_rgba(0,229,184,0.8)]"
                    style={{
                      animation: "scan 1.5s ease-in-out infinite",
                    }}
                  />
                  <div className="absolute inset-0 border border-accent animate-pulse" />
                </div>
                <style>{`
                  @keyframes scan {
                    0%, 100% { top: 0; }
                    50% { top: calc(100% - 4px); }
                  }
                `}</style>
                <div className="font-mono text-sm text-accent caret mb-2">
                  Verifying document
                </div>
                <div className="font-mono text-xs text-fg-dim space-y-1">
                  <div>· Detecting document type</div>
                  <div>· Running facial biometric check</div>
                  <div>· Cross-referencing verification database</div>
                </div>
              </div>
            )}

            {stage === "verified" && (
              <div className="py-8 text-center animate-fade-in">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full border-2 border-accent flex items-center justify-center glow-strong">
                  <svg
                    className="w-8 h-8 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="font-mono text-xs text-accent tracking-[0.2em] mb-2">
                  [ VERIFIED ]
                </div>
                <h3 className="text-2xl font-semibold mb-2">You're all set</h3>
                <p className="text-sm text-fg-dim mb-8 max-w-sm mx-auto">
                  Identity confirmed. Next up: we'll set up a self-custody wallet so you can hold your tickets.
                </p>
                <button
                  onClick={goNext}
                  className="bg-accent text-bg font-mono text-sm font-semibold uppercase tracking-wider px-8 py-3 rounded hover:bg-accent/90 transition-colors inline-flex items-center gap-2"
                >
                  <span>Continue to wallet setup</span>
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

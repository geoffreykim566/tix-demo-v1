type Step = { label: string; status: "done" | "current" | "upcoming" };

export default function StepIndicator({ steps }: { steps: Step[] }) {
  return (
    <div className="flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-colors ${
              step.status === "done"
                ? "border-accent/40 text-accent bg-accent/5"
                : step.status === "current"
                ? "border-accent text-accent bg-accent/10 glow"
                : "border-border text-fg-faint"
            }`}
          >
            <span className="text-[10px]">
              {step.status === "done" ? "✓" : `0${i + 1}`}
            </span>
            <span>{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className="w-6 h-px bg-border" />
          )}
        </div>
      ))}
    </div>
  );
}

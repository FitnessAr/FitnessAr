import { Check } from "lucide-react";
import type { SetLog } from "./types";

export function SetRow({
  setNumber,
  previous,
  log,
  locked = false,
  onChangeWeight,
  onChangeReps,
  onToggleCompleted,
}: {
  setNumber: number;
  previous: { weight: number; reps: number };
  log: SetLog;
  locked?: boolean;
  onChangeWeight: (value: string) => void;
  onChangeReps: (value: string) => void;
  onToggleCompleted: () => void;
}) {
  const { completed } = log;

  return (
    <div
      className={`grid grid-cols-[28px_1fr_56px_48px_32px] items-center gap-3 rounded-2xl border px-3 py-2.5 ${
        completed ? "border-brand/25 bg-brand/10" : "border-border bg-surface"
      }`}
    >
      <span
        className={`text-sm font-bold ${completed ? "text-ink-muted" : "text-ink"}`}
      >
        {setNumber}
      </span>

      <span className="text-xs text-ink-muted">
        {previous.weight}kg × {previous.reps}
      </span>

      <input
        type="text"
        inputMode="decimal"
        value={log.weight}
        onChange={(event) => onChangeWeight(event.target.value)}
        aria-label={`Peso serie ${setNumber}`}
        className="w-14 rounded-lg border border-border bg-surface-elevated px-2 py-1.5 text-center text-sm font-bold text-ink focus:border-brand focus:outline-none"
      />

      <input
        type="text"
        inputMode="numeric"
        value={log.reps}
        onChange={(event) => onChangeReps(event.target.value)}
        aria-label={`Repeticiones serie ${setNumber}`}
        className="w-12 rounded-lg border border-border bg-surface-elevated px-2 py-1.5 text-center text-sm font-bold text-ink focus:border-brand focus:outline-none"
      />

      <button
        type="button"
        onClick={onToggleCompleted}
        disabled={locked}
        aria-label={completed ? "Marcar serie como pendiente" : "Marcar serie como completa"}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
          completed
            ? "border-brand bg-brand text-brand-foreground"
            : "border-border text-transparent"
        } ${locked ? "cursor-not-allowed opacity-40" : ""}`}
      >
        <Check className="h-4 w-4" />
      </button>
    </div>
  );
}

import Link from "next/link";
import type { DayWorkout } from "../active-routine";

function toTitleCase(label: string): string {
  return label.charAt(0) + label.slice(1).toLowerCase();
}

export function DayRow({
  label,
  isToday,
  workout,
}: {
  label: string;
  isToday: boolean;
  workout: DayWorkout;
}) {
  const isRestDay = workout === null;

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
        isToday ? "border-brand/40 bg-brand/5" : "border-border bg-surface"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          isToday
            ? "bg-brand text-brand-foreground"
            : "bg-surface-elevated text-ink-muted"
        }`}
      >
        {toTitleCase(label)}
      </span>

      {isRestDay ? (
        <p className="flex-1 text-sm italic text-ink-muted">Descanso</p>
      ) : (
        <div className="flex-1">
          <p className="text-sm font-bold text-ink">{workout.title}</p>
          <p className="text-xs text-ink-muted">
            {workout.exerciseCount} ejercicios · ~{workout.durationMinutes} min
          </p>
        </div>
      )}

      {isToday && !isRestDay && (
        <Link
          href="/alumno/rutina/hoy"
          className="shrink-0 rounded-full bg-brand px-3 py-1 text-xs font-extrabold uppercase text-brand-foreground"
        >
          Ver
        </Link>
      )}
    </div>
  );
}

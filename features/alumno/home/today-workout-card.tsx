import Link from "next/link";
import { ChevronRight, Clock, Dumbbell, Zap } from "lucide-react";
import type { TodayWorkout } from "./types";

export function TodayWorkoutCard({ workout }: { workout: TodayWorkout }) {
  if (!workout) {
    return (
      <div className="rounded-2xl border border-border bg-surface px-5 py-10 text-center">
        <p className="text-lg font-extrabold text-ink">Hoy es día de descanso</p>
        <p className="mt-1 text-sm text-ink-muted">
          Aprovechá para recuperar, mañana seguimos.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-brand/25 bg-linear-to-br from-brand/15 via-surface to-surface px-5 py-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand">
            {workout.routineName} · {workout.dayLabel}
          </p>
          <h3 className="mt-1 text-2xl font-black uppercase leading-tight text-ink">
            {workout.title}
          </h3>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground">
          <Dumbbell className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
        <span className="flex items-center gap-1.5">
          <Dumbbell className="h-4 w-4" /> {workout.exerciseCount} ejercicios
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" /> ~{workout.durationMinutes} min
        </span>
        <span className="flex items-center gap-1.5">
          <Zap className="h-4 w-4" /> {workout.difficulty}
        </span>
      </div>

      <Link
        href="/alumno/rutina/hoy"
        className="mt-5 flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-brand text-base font-extrabold uppercase tracking-wide text-brand-foreground transition-opacity active:opacity-80"
      >
        Comenzar entrenamiento
        <ChevronRight className="h-5 w-5" />
      </Link>
    </div>
  );
}

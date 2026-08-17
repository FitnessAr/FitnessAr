import { Bell, Flame } from "lucide-react";
import type { AlumnoHomeData } from "./types";
import { WeekCalendar } from "./week-calendar";
import { TodayWorkoutCard } from "./today-workout-card";
import { WeeklySummary } from "./weekly-summary";

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function HomeScreen({ data }: { data: AlumnoHomeData }) {
  const { studentName, week, todayWorkout, weeklySummary } = data;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-8 px-6 pb-28 pt-8">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm text-ink-muted">Buen día,</p>
          <p className="text-3xl font-black text-ink">{studentName}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-ink-muted">
            <Bell className="h-5 w-5" />
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-sm font-bold text-brand">
            {getInitials(studentName)}
          </span>
        </div>
      </header>

      <div className="flex items-center gap-4 rounded-2xl border border-brand/20 bg-brand/10 px-4 py-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-flame/15 text-flame">
          <Flame className="h-6 w-6" />
        </span>
        <div>
          <p className="font-extrabold text-ink">
            ¡{weeklySummary.streakDays} días seguidos entrenando!
          </p>
          <p className="text-sm text-ink-muted">Seguí así, vas muy bien.</p>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Esta semana
        </p>
        <WeekCalendar week={week} />
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Entrenamiento de hoy
        </p>
        <TodayWorkoutCard workout={todayWorkout} />
      </section>

      <section className="flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Resumen semanal
        </p>
        <WeeklySummary summary={weeklySummary} />
      </section>
    </div>
  );
}

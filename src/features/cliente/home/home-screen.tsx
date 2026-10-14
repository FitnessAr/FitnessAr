import { Bell, Flame } from "lucide-react";
import { getInitials } from "@/lib/get-initials";
import type { ClienteHomeData } from "./types";
import { WeekCalendar } from "./week-calendar";
import { TodayWorkoutCard } from "./today-workout-card";
import { WeeklySummary } from "./weekly-summary";
import { NoProfessorAssigned } from "./no-professor-assigned";

export function HomeScreen({ data }: { data: ClienteHomeData }) {
  const { clientName } = data;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-8 px-6 pb-28 pt-8">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm text-ink-muted">Buen día,</p>
          <p className="text-3xl font-black text-ink">{clientName}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-ink-muted">
            <Bell className="h-5 w-5" />
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-sm font-bold text-brand">
            {getInitials(clientName)}
          </span>
        </div>
      </header>

      {!data.hasProfessor ? (
        <NoProfessorAssigned />
      ) : (
        <>
          <div className="flex items-center gap-4 rounded-2xl border border-brand/20 bg-brand/10 px-4 py-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-flame/15 text-flame">
              <Flame className="h-6 w-6" />
            </span>
            <div>
              <p className="font-extrabold text-ink">
                ¡{data.weeklySummary.streakDays} días seguidos entrenando!
              </p>
              <p className="text-sm text-ink-muted">Seguí así, vas muy bien.</p>
            </div>
          </div>

          <section className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
              Esta semana
            </p>
            <WeekCalendar week={data.week} />
          </section>

          <section className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
              Entrenamiento de hoy
            </p>
            <TodayWorkoutCard workout={data.todayWorkout} />
          </section>

          <section className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
              Resumen semanal
            </p>
            <WeeklySummary summary={data.weeklySummary} />
          </section>
        </>
      )}
    </div>
  );
}

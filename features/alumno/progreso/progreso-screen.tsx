import { NoProfessorMessage } from "../no-professor-message";
import type { ProgresoData } from "./types";
import { WeeklyActivityRow } from "./weekly-activity-row";
import { StatsGrid } from "./stats-grid";
import { RecordsList } from "./records-list";

export function ProgresoScreen({ data }: { data: ProgresoData }) {
  if (!data.hasProfessor) {
    return <NoProfessorMessage label="Progreso" />;
  }

  const {
    weekDays,
    trainingsThisMonth,
    currentStreak,
    totalMinutesThisMonth,
    todayExercises,
    personalRecords,
  } = data;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 pb-28 pt-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Mi progreso
        </p>
        <h1 className="text-3xl font-black uppercase leading-tight text-ink">Esta semana</h1>
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-muted">
          Actividad semanal
        </p>
        <WeeklyActivityRow days={weekDays} />
      </section>

      <StatsGrid
        trainingsThisMonth={trainingsThisMonth}
        currentStreak={currentStreak}
        totalMinutesThisMonth={totalMinutesThisMonth}
        todayExercises={todayExercises}
      />

      <section className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Récords personales
        </p>
        <RecordsList records={personalRecords} />
      </section>
    </div>
  );
}

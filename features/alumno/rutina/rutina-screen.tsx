import type { RutinaScreenData } from "./types";
import { DayRow } from "./day-row";
import { ExerciseList } from "./exercise-list";
import { NoProfessorMessage } from "../no-professor-message";

function formatAssignedSince(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
  }).format(date);
}

export function RutinaScreen({ data }: { data: RutinaScreenData }) {
  if (!data) {
    return <NoProfessorMessage label="Mi rutina" />;
  }

  const { routineName, assignedBy, assignedSince, week, todayExercises } = data;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 pb-28 pt-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Mi rutina
        </p>
        <h1 className="text-3xl font-black uppercase leading-tight text-ink">
          {routineName}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Asignada por {assignedBy} · Desde el {formatAssignedSince(assignedSince)}
        </p>
      </header>

      <section className="flex flex-col gap-2">
        {week.map((day) => (
          <DayRow
            key={day.date.toISOString()}
            label={day.label}
            isToday={day.isToday}
            workout={day.workout}
          />
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Ejercicios incluidos
        </p>
        <ExerciseList exercises={todayExercises} />
      </section>
    </div>
  );
}

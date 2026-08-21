import type { ExerciseSummary } from "../active-routine";

export function ExerciseList({ exercises }: { exercises: ExerciseSummary[] }) {
  if (exercises.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        Hoy es día de descanso — no hay ejercicios asignados.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {exercises.map((exercise) => (
        <div
          key={exercise.name}
          className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3"
        >
          <span className="text-sm font-semibold text-ink">{exercise.name}</span>
          <span className="text-sm text-ink-muted">
            {exercise.sets} x {exercise.reps}
          </span>
        </div>
      ))}
    </div>
  );
}

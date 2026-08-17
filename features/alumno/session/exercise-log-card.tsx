import type { ExerciseSummary } from "../active-routine";
import type { SetLog } from "./types";
import { SetRow } from "./set-row";
import { getMuscleGroupColorClassName } from "./muscle-group-color";

export function ExerciseLogCard({
  exercise,
  logs,
  isResting,
  activeSetIndex,
  onChangeWeight,
  onChangeReps,
  onToggleCompleted,
}: {
  exercise: ExerciseSummary;
  logs: SetLog[];
  isResting: boolean;
  activeSetIndex: number | null;
  onChangeWeight: (setIndex: number, value: string) => void;
  onChangeReps: (setIndex: number, value: string) => void;
  onToggleCompleted: (setIndex: number) => void;
}) {
  const allCompleted = logs.every((log) => log.completed);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
      <div>
        <p
          className={`text-base font-bold ${
            allCompleted ? "text-ink-muted line-through" : "text-ink"
          }`}
        >
          {exercise.name}
        </p>
        <span
          className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${getMuscleGroupColorClassName(
            exercise.muscleGroup
          )}`}
        >
          {exercise.muscleGroup}
        </span>
      </div>

      <div className="grid grid-cols-[28px_1fr_56px_48px_32px] gap-3 px-3 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
        <span>Set</span>
        <span>Previa</span>
        <span className="text-center">Kg</span>
        <span className="text-center">Reps</span>
        <span aria-hidden="true" />
      </div>

      <div className="flex flex-col gap-2">
        {exercise.previousSets.map((previous, index) => (
          <SetRow
            key={index}
            setNumber={index + 1}
            previous={previous}
            log={logs[index]}
            locked={isResting && activeSetIndex !== index}
            onChangeWeight={(value) => onChangeWeight(index, value)}
            onChangeReps={(value) => onChangeReps(index, value)}
            onToggleCompleted={() => onToggleCompleted(index)}
          />
        ))}
      </div>
    </div>
  );
}

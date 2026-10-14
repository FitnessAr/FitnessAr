export type RoutineExerciseDraft = {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  unit: "REPS" | "SECONDS";
  restSeconds: number;
};

export type RoutineDayDraft = {
  weekday: number;
  title: string;
  exercises: RoutineExerciseDraft[];
};

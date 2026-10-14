import type { ExerciseSummary } from "../active-routine";

export type SetLog = {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
};

export type SessionExerciseEntry = {
  exercise: ExerciseSummary;
  logs: SetLog[];
};

export type SessionData = {
  dayLabel: string;
  title: string;
  exerciseCount: number;
  durationMinutes: number;
  difficulty: string;
  exercises: SessionExerciseEntry[];
} | null;

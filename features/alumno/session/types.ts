import type { ExerciseSummary } from "../active-routine";

export type SessionData = {
  dayLabel: string;
  title: string;
  exerciseCount: number;
  durationMinutes: number;
  difficulty: string;
  exercises: ExerciseSummary[];
} | null;

export type SetLog = {
  weight: string;
  reps: string;
  completed: boolean;
};

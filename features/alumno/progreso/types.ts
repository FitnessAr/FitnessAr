import type { WeekDay } from "../week";

export type PersonalRecord = {
  exerciseName: string;
  weightKg: number;
  deltaKg: number | null;
};

export type ProgresoData =
  | { hasProfessor: false }
  | {
      hasProfessor: true;
      weekDays: (WeekDay & { completed: boolean })[];
      trainingsThisMonth: number;
      currentStreak: number;
      totalMinutesThisMonth: number;
      todayExercises: { hasWorkout: boolean; completed: number; total: number };
      personalRecords: PersonalRecord[];
    };

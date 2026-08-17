import type { WeekDay } from "../week";

export type { WeekDay };

export type TodayWorkout = {
  routineName: string;
  dayLabel: string;
  title: string;
  exerciseCount: number;
  durationMinutes: number;
  difficulty: string;
} | null;

export type WeeklySummary = {
  sessionsCompleted: number;
  sessionsTotal: number;
  minutes: number;
  streakDays: number;
};

export type AlumnoHomeData = {
  studentName: string;
  week: WeekDay[];
  todayWorkout: TodayWorkout;
  weeklySummary: WeeklySummary;
};

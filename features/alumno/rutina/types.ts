import type { DayWorkout, ExerciseSummary } from "../active-routine";
import type { WeekDay } from "../week";

export type RutinaScreenData = {
  routineName: string;
  assignedBy: string;
  assignedSince: Date;
  week: (WeekDay & { workout: DayWorkout })[];
  todayExercises: ExerciseSummary[];
};

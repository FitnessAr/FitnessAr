import { getActiveRoutine } from "../active-routine";
import { getCurrentWeekDays } from "../week";
import type { RutinaScreenData } from "./types";

export async function getRutinaData(): Promise<RutinaScreenData> {
  const routine = await getActiveRoutine();

  if (!routine) {
    return null;
  }

  const today = new Date();
  const week = getCurrentWeekDays(routine.scheduleWeekdays, today).map((day) => ({
    ...day,
    workout: routine.workoutsByWeekday[day.date.getDay()] ?? null,
  }));

  const todayWorkout = routine.workoutsByWeekday[today.getDay()] ?? null;

  return {
    routineName: routine.name,
    assignedBy: routine.assignedBy,
    assignedSince: routine.assignedSince,
    week,
    todayExercises: todayWorkout?.exercises ?? [],
  };
}

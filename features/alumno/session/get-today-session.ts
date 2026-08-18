import { getActiveRoutine } from "../active-routine";
import { WEEKDAY_NAMES_ES } from "../weekday-names";
import type { SessionData } from "./types";

export async function getTodaySession(): Promise<SessionData> {
  const routine = await getActiveRoutine();
  const today = new Date();
  const dayWorkout = routine.workoutsByWeekday[today.getDay()] ?? null;

  if (!dayWorkout) {
    return null;
  }

  return {
    dayLabel: WEEKDAY_NAMES_ES[today.getDay()],
    title: dayWorkout.title,
    exerciseCount: dayWorkout.exerciseCount,
    durationMinutes: dayWorkout.durationMinutes,
    difficulty: routine.difficulty,
    exercises: dayWorkout.exercises,
  };
}

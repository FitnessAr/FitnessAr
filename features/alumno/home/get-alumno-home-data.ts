import { getActiveRoutine } from "../active-routine";
import { getCurrentWeekDays } from "../week";
import { WEEKDAY_NAMES_ES } from "../weekday-names";
import type { AlumnoHomeData, TodayWorkout } from "./types";

export async function getAlumnoHomeData(): Promise<AlumnoHomeData> {
  const routine = await getActiveRoutine();
  const today = new Date();
  const week = getCurrentWeekDays(routine.scheduleWeekdays, today);
  const dayWorkout = routine.workoutsByWeekday[today.getDay()] ?? null;

  const todayWorkout: TodayWorkout = dayWorkout
    ? {
        routineName: routine.name,
        dayLabel: WEEKDAY_NAMES_ES[today.getDay()],
        title: dayWorkout.title,
        exerciseCount: dayWorkout.exerciseCount,
        durationMinutes: dayWorkout.durationMinutes,
        difficulty: dayWorkout.difficulty,
      }
    : null;

  return {
    studentName: "Sofía",
    week,
    todayWorkout,
    weeklySummary: {
      sessionsCompleted: 3,
      sessionsTotal: routine.scheduleWeekdays.length,
      minutes: 180,
      streakDays: 5,
    },
  };
}

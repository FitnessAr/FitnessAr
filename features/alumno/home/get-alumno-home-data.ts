import { getActiveRoutine, getCurrentStudentName } from "../active-routine";
import { getCurrentWeekDays } from "../week";
import { WEEKDAY_NAMES_ES } from "../weekday-names";
import type { AlumnoHomeData, TodayWorkout } from "./types";

export async function getAlumnoHomeData(): Promise<AlumnoHomeData> {
  const [routine, studentName] = await Promise.all([getActiveRoutine(), getCurrentStudentName()]);

  if (!routine) {
    return { studentName, hasProfessor: false };
  }

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
        difficulty: routine.difficulty,
      }
    : null;

  return {
    studentName,
    hasProfessor: true,
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

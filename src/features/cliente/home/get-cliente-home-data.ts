import { getActiveRoutine } from "../active-routine";
import { getCurrentWeekDays } from "../week";
import { WEEKDAY_NAMES_ES } from "../weekday-names";
import { getTrainingHistory, computeCurrentStreak } from "../training-history";
import type { Cliente, User } from "@/generated/prisma/client";
import type { ClienteHomeData, TodayWorkout } from "./types";

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export async function getClienteHomeData(user: User, cliente: Cliente): Promise<ClienteHomeData> {
  const routine = await getActiveRoutine(cliente);

  if (!routine) {
    return { clientName: user.name, hasProfessor: false };
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

  const log = await getTrainingHistory(cliente.id);
  const thisWeek = week.filter((day) => day.hasWorkout && day.date <= today);
  const completedThisWeek = thisWeek.filter((day) =>
    log.some((entry) => entry.completed && isSameDay(entry.date, day.date))
  );

  return {
    clientName: user.name,
    hasProfessor: true,
    week,
    todayWorkout,
    weeklySummary: {
      sessionsCompleted: completedThisWeek.length,
      sessionsTotal: routine.scheduleWeekdays.length,
      minutes: completedThisWeek.reduce((sum, day) => {
        const entry = log.find((logged) => isSameDay(logged.date, day.date));
        return sum + (entry?.durationMinutes ?? 0);
      }, 0),
      streakDays: computeCurrentStreak(log),
    },
  };
}

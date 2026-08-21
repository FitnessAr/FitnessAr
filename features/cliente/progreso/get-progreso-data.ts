import { getActiveRoutine } from "../active-routine";
import { getCurrentWeekDays } from "../week";
import { getTrainingLog, roundToHalfKg, type LoggedDay } from "./training-log";
import type { PersonalRecord, ProgresoData } from "./types";

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

// 1RM estimado (fórmula de Epley) — nivela series con distinto peso/reps a un número comparable,
// para que "200kg x 1" no le gane automáticamente a "190kg x 10" solo por tener más peso crudo.
function estimateOneRepMax(weight: number, reps: number): number {
  return weight * (1 + reps / 30);
}

function computeCurrentStreak(log: LoggedDay[]): number {
  let streak = 0;
  for (const day of log) {
    if (!day.completed) break;
    streak++;
  }
  return streak;
}

function computePersonalRecords(log: LoggedDay[]): PersonalRecord[] {
  const bestSetPerDayByExercise = new Map<string, { weight: number; oneRepMax: number }[]>();

  for (const day of log) {
    if (!day.completed) continue;

    for (const exercise of day.exercises) {
      const bestSetOfDay = exercise.sets.reduce((best, set) =>
        estimateOneRepMax(set.weight, set.reps) > estimateOneRepMax(best.weight, best.reps)
          ? set
          : best
      );

      const entries = bestSetPerDayByExercise.get(exercise.name) ?? [];
      entries.push({
        weight: bestSetOfDay.weight,
        oneRepMax: estimateOneRepMax(bestSetOfDay.weight, bestSetOfDay.reps),
      });
      bestSetPerDayByExercise.set(exercise.name, entries);
    }
  }

  return [...bestSetPerDayByExercise.entries()].map(([exerciseName, entries]) => {
    const [best, second] = [...entries].sort((a, b) => b.oneRepMax - a.oneRepMax);

    return {
      exerciseName,
      weightKg: best.weight,
      deltaKg: second ? roundToHalfKg(best.weight - second.weight) : null,
    };
  });
}

export async function getProgresoData(): Promise<ProgresoData> {
  const routine = await getActiveRoutine();

  if (!routine) {
    return { hasProfessor: false };
  }

  const today = new Date();
  const log = getTrainingLog(routine, today);

  const weekDays = getCurrentWeekDays(routine.scheduleWeekdays, today).map((day) => ({
    ...day,
    completed: log.some((entry) => entry.completed && isSameDay(entry.date, day.date)),
  }));

  const completedThisMonth = log.filter(
    (day) => day.completed && isSameMonth(day.date, today)
  );

  const todayWorkout = routine.workoutsByWeekday[today.getDay()] ?? null;

  return {
    hasProfessor: true,
    weekDays,
    trainingsThisMonth: completedThisMonth.length,
    currentStreak: computeCurrentStreak(log),
    totalMinutesThisMonth: completedThisMonth.reduce((sum, day) => sum + day.durationMinutes, 0),
    todayExercises: todayWorkout
      ? { hasWorkout: true, completed: 0, total: todayWorkout.exerciseCount }
      : { hasWorkout: false, completed: 0, total: 0 },
    personalRecords: computePersonalRecords(log),
  };
}

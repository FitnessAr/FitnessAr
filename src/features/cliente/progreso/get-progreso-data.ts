import { prisma } from "@/lib/db";
import { getActiveRoutine } from "../active-routine";
import { getCurrentWeekDays } from "../week";
import {
  getTrainingHistory,
  roundToHalfKg,
  computeCurrentStreak,
  type LoggedDay,
} from "../training-history";
import type { Cliente } from "@/generated/prisma/client";
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

function computePersonalRecords(log: LoggedDay[]): PersonalRecord[] {
  const bestSetPerDayByExercise = new Map<string, { weight: number; oneRepMax: number }[]>();

  for (const day of log) {
    if (!day.completed) continue;

    for (const exercise of day.exercises) {
      if (exercise.sets.length === 0) continue;

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

// Cuántos ejercicios de hoy ya están 100% completados (todas sus series), sin crear la sesión de
// hoy si todavía no existe (a diferencia de get-today-session.ts, que sí la crea al abrir el
// checklist) — ver una rutina en Progreso no debería generar una sesión vacía.
async function countCompletedExercisesToday(clienteId: string): Promise<number> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const session = await prisma.trainingSession.findFirst({
    where: { clienteId, date: todayStart },
    include: { exercises: { include: { sets: true } } },
  });

  if (!session) return 0;

  return session.exercises.filter(
    (exercise) => exercise.sets.length > 0 && exercise.sets.every((set) => set.completed)
  ).length;
}

export async function getProgresoData(cliente: Cliente): Promise<ProgresoData> {
  const routine = await getActiveRoutine(cliente);

  if (!routine) {
    return { hasProfessor: false };
  }

  const today = new Date();
  const log = await getTrainingHistory(cliente.id);

  const weekDays = getCurrentWeekDays(routine.scheduleWeekdays, today).map((day) => ({
    ...day,
    completed: log.some((entry) => entry.completed && isSameDay(entry.date, day.date)),
  }));

  const completedThisMonth = log.filter((day) => day.completed && isSameMonth(day.date, today));

  const todayWorkout = routine.workoutsByWeekday[today.getDay()] ?? null;
  const completedToday = todayWorkout ? await countCompletedExercisesToday(cliente.id) : 0;

  return {
    hasProfessor: true,
    weekDays,
    trainingsThisMonth: completedThisMonth.length,
    currentStreak: computeCurrentStreak(log),
    totalMinutesThisMonth: completedThisMonth.reduce((sum, day) => sum + day.durationMinutes, 0),
    todayExercises: todayWorkout
      ? { hasWorkout: true, completed: completedToday, total: todayWorkout.exerciseCount }
      : { hasWorkout: false, completed: 0, total: 0 },
    personalRecords: computePersonalRecords(log),
  };
}

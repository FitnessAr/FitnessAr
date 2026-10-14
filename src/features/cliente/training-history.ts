import { prisma } from "@/lib/db";

export type LoggedSet = { weight: number; reps: number };
export type LoggedExercise = { name: string; sets: LoggedSet[] };
export type LoggedDay = {
  date: Date;
  weekday: number;
  completed: boolean;
  durationMinutes: number;
  exercises: LoggedExercise[];
};

const HISTORY_DAYS_BACK = 60;

export function roundToHalfKg(value: number): number {
  return Math.round(value * 2) / 2;
}

// Racha actual: días programados consecutivos completados, contando desde el más reciente hacia
// atrás — se corta en el primer día no completado. Compartida entre Progreso y el resumen de Home.
export function computeCurrentStreak(log: LoggedDay[]): number {
  let streak = 0;
  for (const day of log) {
    if (!day.completed) break;
    streak++;
  }
  return streak;
}

// Historial real de entrenamientos del cliente, más reciente primero — reemplaza al generador
// sintético que vivía en features/cliente/progreso/training-log.ts (borrado). Alimenta tanto
// Progreso (racha, récords) como el resumen semanal de Home, para no duplicar la misma consulta.
export async function getTrainingHistory(clienteId: string): Promise<LoggedDay[]> {
  const since = new Date();
  since.setDate(since.getDate() - HISTORY_DAYS_BACK);
  since.setHours(0, 0, 0, 0);

  const sessions = await prisma.trainingSession.findMany({
    where: { clienteId, date: { gte: since } },
    include: { exercises: { include: { exercise: true, sets: true } } },
    orderBy: { date: "desc" },
  });

  return sessions.map((session) => ({
    date: session.date,
    weekday: session.weekday,
    completed: session.completed,
    durationMinutes: session.durationMinutes ?? 0,
    exercises: session.exercises.map((sessionExercise) => ({
      name: sessionExercise.exercise.name,
      sets: sessionExercise.sets
        .filter((set) => set.completed && set.weightKg !== null && set.reps !== null)
        .map((set) => ({ weight: Number(set.weightKg), reps: set.reps as number })),
    })),
  }));
}

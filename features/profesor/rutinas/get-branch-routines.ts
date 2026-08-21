import { prisma } from "@/lib/db";

const DIFFICULTY_LABELS: Record<string, string> = {
  PRINCIPIANTE: "Principiante",
  INTERMEDIO: "Intermedio",
  AVANZADO: "Avanzado",
};

export type BranchRoutine = {
  name: string;
  difficulty: string;
  scheduleWeekdays: number[];
  workoutsByWeekday: Record<number, { exerciseCount: number; durationMinutes: number } | null>;
};

// Reemplazo real de features/routines/catalog.ts (que sigue siendo el mock que alimenta al
// cliente) para el lado profesor: todas las rutinas de la sucursal, con cantidad de
// ejercicios/duración por día programado — no el detalle completo de cada ejercicio, que es lo
// que necesita el cliente al entrenar, no esta lista.
export async function getBranchRoutines(branchId: string): Promise<BranchRoutine[]> {
  const routines = await prisma.routine.findMany({
    where: { branchId },
    include: { days: { include: { exercises: true } } },
    orderBy: { createdAt: "asc" },
  });

  return routines.map((routine) => ({
    name: routine.name,
    difficulty: DIFFICULTY_LABELS[routine.difficulty] ?? routine.difficulty,
    scheduleWeekdays: routine.days.map((day) => day.weekday),
    workoutsByWeekday: Object.fromEntries(
      routine.days.map((day) => [
        day.weekday,
        { exerciseCount: day.exercises.length, durationMinutes: day.durationMinutes },
      ])
    ),
  }));
}

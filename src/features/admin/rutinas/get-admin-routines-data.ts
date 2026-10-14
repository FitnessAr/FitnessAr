import { prisma } from "@/lib/db";
import type { AdminRoutineRow, AdminRutinasData } from "./types";

const DIFFICULTY_LABELS: Record<string, string> = {
  PRINCIPIANTE: "Principiante",
  INTERMEDIO: "Intermedio",
  AVANZADO: "Avanzado",
};

// A diferencia de features/profesor/rutinas/get-branch-routines.ts (que solo trae las activas,
// porque el profesor no debe ver rutinas desactivadas), acá traemos TODAS: el admin necesita ver
// también las inactivas para poder reactivarlas.
export async function getAdminRoutinesData(branchId: string): Promise<AdminRutinasData> {
  const routines = await prisma.routine.findMany({
    where: { branchId },
    include: {
      profesor: { include: { user: true } },
      days: { include: { exercises: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const rows: AdminRoutineRow[] = routines.map((routine) => ({
    id: routine.id,
    name: routine.name,
    difficulty: DIFFICULTY_LABELS[routine.difficulty] ?? routine.difficulty,
    profesorName: routine.profesor?.user.name ?? "Sin profesor asignado",
    dayCount: routine.days.length,
    exerciseCount: routine.days.reduce((sum, day) => sum + day.exercises.length, 0),
    isActive: !routine.deactivatedAt,
  }));

  return { routines: rows, totalCount: rows.length };
}

import { prisma } from "@/lib/db";

export type BranchExercise = {
  id: string;
  name: string;
  muscleGroup: string | null;
};

// Ejercicios ya incluidos por el admin en la tabla local de la sucursal (no el catálogo global de
// ~1300) — lo que el profesor puede elegir para armar una rutina. A diferencia de
// features/admin/catalogo/get-catalogo-data.ts (que trae lo mismo pero sin el id real de Prisma,
// porque ese usa catalogId para mapear contra el catálogo externo), acá hace falta el id real:
// RoutineExercise.exerciseId apunta a Exercise.id.
export async function getBranchExercises(branchId: string): Promise<BranchExercise[]> {
  return prisma.exercise.findMany({
    where: { branchId },
    select: { id: true, name: true, muscleGroup: true },
    orderBy: { name: "asc" },
  });
}

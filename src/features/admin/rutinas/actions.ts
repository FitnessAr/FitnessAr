"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/features/admin/require-admin";

export type SetRoutineActiveResult = { ok: true } | { ok: false; error: string };

// Toggle reversible, mismo criterio que User.deactivatedAt. Sin guard de autoprotección: a
// diferencia de desactivar un usuario, acá no hay riesgo de lockout.
export async function setRoutineActiveAction(
  routineId: string,
  isActive: boolean
): Promise<SetRoutineActiveResult> {
  await requireAdmin();

  await prisma.routine.update({
    where: { id: routineId },
    data: { deactivatedAt: isActive ? null : new Date() },
  });

  revalidatePath("/admin/configuracion");
  revalidatePath("/profesor/rutinas");
  return { ok: true };
}

export type DeleteRoutineResult = { ok: true } | { ok: false; error: string };

// Borrado real de la fila. RoutineDay/RoutineExercise se borran en cascada; Cliente.routineId y
// TrainingSession.routineId quedan en null (SetNull) — mismo patrón que borrar un Profesor.
export async function deleteRoutineAction(routineId: string): Promise<DeleteRoutineResult> {
  await requireAdmin();

  await prisma.routine.delete({ where: { id: routineId } });

  revalidatePath("/admin/configuracion");
  revalidatePath("/profesor/rutinas");
  return { ok: true };
}

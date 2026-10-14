"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCliente } from "@/features/cliente/require-cliente";

export type UpdateSetResult = { ok: true } | { ok: false; error: string };

// Togglear/editar una serie puntual del checklist de hoy. El chequeo de pertenencia es
// obligatorio: un SessionSet solo se puede tocar si pertenece a una sesión del cliente que está
// logueado (no cualquiera con el id a mano).
export async function updateSetAction(
  sessionSetId: string,
  data: { completed: boolean; weightKg: number | null; reps: number | null }
): Promise<UpdateSetResult> {
  const { cliente } = await requireCliente();

  const set = await prisma.sessionSet.findFirst({
    where: { id: sessionSetId, sessionExercise: { session: { clienteId: cliente.id } } },
    select: { sessionExercise: { select: { sessionId: true } } },
  });

  if (!set) {
    return { ok: false, error: "No se encontró la serie." };
  }

  const sessionId = set.sessionExercise.sessionId;

  await prisma.sessionSet.update({
    where: { id: sessionSetId },
    data: { completed: data.completed, weightKg: data.weightKg, reps: data.reps },
  });

  const remaining = await prisma.sessionSet.count({
    where: { sessionExercise: { sessionId }, completed: false },
  });

  await prisma.trainingSession.update({
    where: { id: sessionId },
    data: { completed: remaining === 0 },
  });

  revalidatePath("/cliente/rutina/hoy");
  revalidatePath("/cliente/progreso");
  revalidatePath("/cliente");

  return { ok: true };
}

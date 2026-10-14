"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireProfesor } from "@/features/profesor/require-profesor";

export type ClaimClientResult = { ok: true } | { ok: false; error: string };

// El profesor reclama un cliente sin profesor de la sucursal (encontrado por DNI). El
// `profesorId: null` en el where evita una carrera si dos profesores lo reclaman a la vez — si ya
// lo tomó otro, el update no matchea ninguna fila y Prisma tira P2025, que tratamos como error de
// negocio (ya no está disponible), no una excepción.
export async function claimClientAction(clienteId: string): Promise<ClaimClientResult> {
  const { profesor } = await requireProfesor();

  try {
    await prisma.cliente.update({
      where: { id: clienteId, profesorId: null },
      data: { profesorId: profesor.id },
    });
  } catch {
    return { ok: false, error: "Ese cliente ya fue asignado a otro profesor." };
  }

  revalidatePath("/profesor/clientes");
  return { ok: true };
}

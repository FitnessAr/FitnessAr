import { redirect } from "next/navigation";
import { getCurrentRealUserId } from "@/features/auth/session";
import { prisma } from "@/lib/db";

// Guarda compartida por todo /cliente: exige una sesión real (no de demo) con rol CLIENTE,
// cuenta activa, y una fila Cliente asociada. Mismo patrón que requireAdmin()/requireProfesor().
export async function requireCliente() {
  const userId = await getCurrentRealUserId();
  if (!userId) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { cliente: true } });
  if (!user || user.role !== "CLIENTE" || user.deactivatedAt || !user.cliente) {
    redirect("/");
  }

  return { user, cliente: user.cliente };
}

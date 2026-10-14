import { redirect } from "next/navigation";
import { getCurrentRealUserId } from "@/features/auth/session";
import { prisma } from "@/lib/db";

// Guarda compartida por las 4 pestañas de /admin: exige una sesión real (no de demo) con rol
// ADMIN y cuenta activa. Cualquier otro caso vuelve al login — no hay pantalla admin sin esto.
export async function requireAdmin() {
  const userId = await getCurrentRealUserId();
  if (!userId) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN" || user.deactivatedAt) {
    redirect("/");
  }

  return user;
}

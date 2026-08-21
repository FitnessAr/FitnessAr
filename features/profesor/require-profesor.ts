import { redirect } from "next/navigation";
import { getCurrentRealUserId } from "@/features/auth/session";
import { prisma } from "@/lib/db";

// Guarda compartida por todo /profesor: exige una sesión real (no de demo) con rol PROFESOR,
// cuenta activa, y una fila Profesor asociada. Cualquier otro caso vuelve al login — mismo
// patrón que features/admin/require-admin.ts (requireAdmin()).
export async function requireProfesor() {
  const userId = await getCurrentRealUserId();
  if (!userId) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { profesor: true } });
  if (!user || user.role !== "PROFESOR" || user.deactivatedAt || !user.profesor) {
    redirect("/");
  }

  return { user, profesor: user.profesor };
}

import { redirect } from "next/navigation";
import {
  buildSessionClaims,
  getCurrentSessionClaims,
  isClaimsFresh,
  refreshSessionClaims,
} from "@/features/auth/session";

export type ProfesorSessionUser = { id: string; branchId: string; name: string };
export type ProfesorSessionProfesor = { id: string };

// Guarda compartida por todo /profesor: exige una sesión real (no de demo) con rol PROFESOR,
// cuenta activa, y una fila Profesor asociada. Mismo patrón de claims + revalidación cada 2h que
// features/admin/require-admin.ts (requireAdmin()) — ver ahí el detalle de la ventana de confianza.
export async function requireProfesor(): Promise<{
  user: ProfesorSessionUser;
  profesor: ProfesorSessionProfesor;
}> {
  const claims = await getCurrentSessionClaims();
  if (!claims || claims.role !== "PROFESOR") {
    redirect("/");
  }

  if (claims.active && claims.profesorId && isClaimsFresh(claims)) {
    return {
      user: { id: claims.userId, branchId: claims.branchId, name: claims.name },
      profesor: { id: claims.profesorId },
    };
  }

  const fresh = await buildSessionClaims(claims.userId);
  if (!fresh || fresh.role !== "PROFESOR" || !fresh.active || !fresh.profesorId) {
    redirect("/");
  }

  await refreshSessionClaims(fresh);
  return {
    user: { id: fresh.userId, branchId: fresh.branchId, name: fresh.name },
    profesor: { id: fresh.profesorId },
  };
}

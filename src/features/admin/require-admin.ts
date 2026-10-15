import { redirect } from "next/navigation";
import {
  buildSessionClaims,
  getCurrentSessionClaims,
  isClaimsFresh,
  refreshSessionClaims,
} from "@/features/auth/session";

export type AdminSession = {
  id: string;
  branchId: string;
  name: string;
  loginId: string | null;
};

// Guarda compartida por las 4 pestañas de /admin: exige una sesión real (no de demo) con rol
// ADMIN y cuenta activa. Mientras los claims firmados de la cookie no venzan (ventana de 2h, ver
// session-claims.ts), confía en ellos sin tocar la DB; si vencieron (o dicen "inactivo", por si se
// reactivó la cuenta mientras tanto) revalida contra la base y reemite la cookie.
export async function requireAdmin(): Promise<AdminSession> {
  const claims = await getCurrentSessionClaims();
  if (!claims || claims.role !== "ADMIN") {
    redirect("/");
  }

  if (claims.active && isClaimsFresh(claims)) {
    return { id: claims.userId, branchId: claims.branchId, name: claims.name, loginId: claims.loginId };
  }

  const fresh = await buildSessionClaims(claims.userId);
  if (!fresh || fresh.role !== "ADMIN" || !fresh.active) {
    redirect("/");
  }

  await refreshSessionClaims(fresh);
  return { id: fresh.userId, branchId: fresh.branchId, name: fresh.name, loginId: fresh.loginId };
}

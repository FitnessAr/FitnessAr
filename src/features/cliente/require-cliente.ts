import { redirect } from "next/navigation";
import {
  buildSessionClaims,
  getCurrentSessionClaims,
  isClaimsFresh,
  refreshSessionClaims,
} from "@/features/auth/session";

export type ClienteSessionUser = { id: string; name: string };
export type ClienteSessionCliente = { id: string };

// Guarda compartida por todo /cliente: exige una sesión real (no de demo) con rol CLIENTE, cuenta
// activa, y una fila Cliente asociada. Mismo patrón de claims + revalidación cada 2h que
// requireAdmin()/requireProfesor() — ver require-admin.ts para el detalle de la ventana de
// confianza. Ojo: esto NO devuelve routineId/profesorId/memberSince del cliente (son datos de
// negocio que cambian seguido, p.ej. cuando un profesor asigna rutina) — esos siempre se leen
// frescos de la DB en el momento en que se necesitan (ver features/cliente/active-routine.ts).
export async function requireCliente(): Promise<{
  user: ClienteSessionUser;
  cliente: ClienteSessionCliente;
}> {
  const claims = await getCurrentSessionClaims();
  if (!claims || claims.role !== "CLIENTE") {
    redirect("/");
  }

  if (claims.active && claims.clienteId && isClaimsFresh(claims)) {
    return {
      user: { id: claims.userId, name: claims.name },
      cliente: { id: claims.clienteId },
    };
  }

  const fresh = await buildSessionClaims(claims.userId);
  if (!fresh || fresh.role !== "CLIENTE" || !fresh.active || !fresh.clienteId) {
    redirect("/");
  }

  await refreshSessionClaims(fresh);
  return {
    user: { id: fresh.userId, name: fresh.name },
    cliente: { id: fresh.clienteId },
  };
}

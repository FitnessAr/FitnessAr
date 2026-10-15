// Forma de los datos que viajan firmados dentro de la cookie de sesión (ver session.ts). Reemplaza
// al viejo esquema de "solo userId": guarda ya resuelto todo lo que los guards (requireAdmin/
// requireProfesor/requireCliente) necesitan para autorizar sin pegarle a la DB en cada request.
export type SessionRole = "ADMIN" | "PROFESOR" | "CLIENTE";

export type SessionClaims = {
  userId: string;
  role: SessionRole;
  branchId: string;
  active: boolean;
  name: string;
  loginId: string | null;
  profesorId: string | null;
  clienteId: string | null;
  validatedAt: number;
};

// Ventana de confianza acordada explícitamente con el usuario: una cuenta recién desactivada puede
// retener acceso hasta este lapso antes de perderlo en el próximo refresh contra la DB. Pasado este
// tiempo, los guards vuelven a validar role/activo/perfil asociado y reemiten la cookie.
const REVALIDATE_AFTER_MS = 2 * 60 * 60 * 1000;

export function isClaimsFresh(claims: SessionClaims): boolean {
  return Date.now() - claims.validatedAt < REVALIDATE_AFTER_MS;
}

function isSessionRole(value: unknown): value is SessionRole {
  return value === "ADMIN" || value === "PROFESOR" || value === "CLIENTE";
}

// Valida la forma del JSON decodificado de la cookie — defensivo ante un cambio futuro de este
// esquema (una cookie vieja firmada con el formato anterior no debe crashear, solo tratarse como
// inválida y forzar un re-login).
export function isSessionClaims(value: unknown): value is SessionClaims {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.userId === "string" &&
    isSessionRole(v.role) &&
    typeof v.branchId === "string" &&
    typeof v.active === "boolean" &&
    typeof v.name === "string" &&
    (typeof v.loginId === "string" || v.loginId === null) &&
    (typeof v.profesorId === "string" || v.profesorId === null) &&
    (typeof v.clienteId === "string" || v.clienteId === null) &&
    typeof v.validatedAt === "number"
  );
}

// Separado de session.ts porque ese archivo importa `next/headers` (solo válido en Server
// Components) y este nombre de cookie también lo necesitan Client Components (login-form.tsx,
// logout-link.tsx).
export const SESSION_COOKIE_NAME = "fitnessar_demo_identity";

// El valor de la cookie indica de qué "espacio" de identidad viene: `demo:<key>` (formato
// heredado de las cuentas mock que ya se sacaron del login, ver CLAUDE.md — nada lo escribe más,
// pero `decodeSessionCookie` lo sigue reconociendo por compatibilidad) o `real:<payload>.<firma>`
// para un User real de la base, donde `payload` es un SessionClaims (ver session-claims.ts)
// serializado en base64url.
export function encodeRealPayload(payload: string): string {
  return `real:${payload}`;
}

export type DecodedSession =
  | { kind: "demo"; value: string }
  | { kind: "real"; value: string }
  | null;

export function decodeSessionCookie(raw: string | undefined | null): DecodedSession {
  if (!raw) return null;

  if (raw.startsWith("demo:")) {
    return { kind: "demo", value: raw.slice("demo:".length) };
  }

  if (raw.startsWith("real:")) {
    return { kind: "real", value: raw.slice("real:".length) };
  }

  return null;
}

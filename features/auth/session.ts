import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, decodeSessionCookie, encodeRealUserId } from "./session-cookie";

export { SESSION_COOKIE_NAME };

// Identidad de cuenta demo — las 4 cuentas mock que usaban esto se sacaron del login (ver
// CLAUDE.md), así que hoy esto siempre devuelve null; se deja sin tocar porque todo
// `features/cliente/` y `features/profesor/` sigue resolviendo su identidad acá y va a volver a
// tener un valor real cuando se implemente el login real de Cliente/Profesor (Fase 4).
export async function getCurrentIdentity(): Promise<string | null> {
  const store = await cookies();
  const decoded = decodeSessionCookie(store.get(SESSION_COOKIE_NAME)?.value);
  return decoded?.kind === "demo" ? decoded.value : null;
}

// La cookie `real:` guarda `<userId>.<firma>` en vez de un userId en texto plano: la firma la
// calcula únicamente authenticateRealUser (features/auth/authenticate-real-user.ts) después de
// validar la contraseña, así el servidor puede rechazar cualquier cookie editada a mano (devtools)
// sin haber pasado por un login real.
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Falta configurar SESSION_SECRET en las variables de entorno.");
  }
  return secret;
}

export function signUserId(userId: string): string {
  const signature = createHmac("sha256", getSessionSecret()).update(userId).digest("hex");
  return `${userId}.${signature}`;
}

function verifySignedUserId(signed: string): string | null {
  const separatorIndex = signed.lastIndexOf(".");
  if (separatorIndex === -1) return null;

  const userId = signed.slice(0, separatorIndex);
  const signature = signed.slice(separatorIndex + 1);
  const expected = createHmac("sha256", getSessionSecret()).update(userId).digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(signature, "hex");
  if (expectedBuffer.length !== actualBuffer.length) return null;
  if (!timingSafeEqual(expectedBuffer, actualBuffer)) return null;

  return userId;
}

// Identidad de un usuario real (tabla `User`, Postgres) — hoy solo la usa /admin.
export async function getCurrentRealUserId(): Promise<string | null> {
  const store = await cookies();
  const decoded = decodeSessionCookie(store.get(SESSION_COOKIE_NAME)?.value);
  if (decoded?.kind !== "real") return null;
  return verifySignedUserId(decoded.value);
}

// Loguea a un usuario real seteando la cookie httpOnly + firmada desde el servidor — lo usan
// authenticateRealUser (login) y registerClienteAction (alta), nunca el cliente directamente.
export async function setRealSession(userId: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, encodeRealUserId(signUserId(userId)), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
}

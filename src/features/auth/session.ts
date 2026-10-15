import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE_NAME, decodeSessionCookie, encodeRealPayload } from "./session-cookie";
import { isSessionClaims, type SessionClaims, type SessionRole } from "./session-claims";

export { SESSION_COOKIE_NAME };
export { isClaimsFresh, type SessionClaims } from "./session-claims";

// Identidad de cuenta demo — las 4 cuentas mock que usaban esto se sacaron del login (ver
// CLAUDE.md), así que hoy esto siempre devuelve null; se deja sin tocar porque todo
// `features/cliente/` y `features/profesor/` sigue resolviendo su identidad acá y va a volver a
// tener un valor real cuando se implemente el login real de Cliente/Profesor (Fase 4).
export async function getCurrentIdentity(): Promise<string | null> {
  const store = await cookies();
  const decoded = decodeSessionCookie(store.get(SESSION_COOKIE_NAME)?.value);
  return decoded?.kind === "demo" ? decoded.value : null;
}

// La cookie `real:` guarda `<payload>.<firma>` en vez de un userId en texto plano: la firma cubre
// el payload completo (los SessionClaims serializados), así el servidor puede rechazar cualquier
// cookie editada a mano (devtools) sin haber pasado por un login real o una revalidación propia.
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Falta configurar SESSION_SECRET en las variables de entorno.");
  }
  return secret;
}

function signPayload(payload: string): string {
  const signature = createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

function verifySignedPayload(signed: string): string | null {
  const separatorIndex = signed.lastIndexOf(".");
  if (separatorIndex === -1) return null;

  const payload = signed.slice(0, separatorIndex);
  const signature = signed.slice(separatorIndex + 1);
  const expected = createHmac("sha256", getSessionSecret()).update(payload).digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(signature, "hex");
  if (expectedBuffer.length !== actualBuffer.length) return null;
  if (!timingSafeEqual(expectedBuffer, actualBuffer)) return null;

  return payload;
}

function encodeClaims(claims: SessionClaims): string {
  const json = Buffer.from(JSON.stringify(claims), "utf8").toString("base64url");
  return signPayload(json);
}

function decodeClaims(signed: string): SessionClaims | null {
  const payload = verifySignedPayload(signed);
  if (!payload) return null;

  try {
    const parsed: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return isSessionClaims(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

// Única fuente de verdad para "¿qué puede hacer este userId hoy?": rol, cuenta activa, branch y el
// id de perfil asociado (Profesor/Cliente). La corren el login/registro (primer claim de la
// sesión) y los guards cuando vence la ventana de confianza de 2h (ver isClaimsFresh).
export async function buildSessionClaims(userId: string): Promise<SessionClaims | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      branchId: true,
      role: true,
      name: true,
      loginId: true,
      deactivatedAt: true,
    },
  });
  if (!user) return null;

  let profesorId: string | null = null;
  let clienteId: string | null = null;

  if (user.role === "PROFESOR") {
    const profesor = await prisma.profesor.findUnique({ where: { userId }, select: { id: true } });
    profesorId = profesor?.id ?? null;
  } else if (user.role === "CLIENTE") {
    const cliente = await prisma.cliente.findUnique({ where: { userId }, select: { id: true } });
    clienteId = cliente?.id ?? null;
  }

  return {
    userId: user.id,
    role: user.role as SessionRole,
    branchId: user.branchId,
    active: !user.deactivatedAt,
    name: user.name,
    loginId: user.loginId,
    profesorId,
    clienteId,
    validatedAt: Date.now(),
  };
}

// Reemite la cookie con claims frescos — la usan los guards después de revalidar contra la DB
// (ventana de 2h vencida) para no volver a pegarle a la base en el resto de requests cercanos.
export async function refreshSessionClaims(claims: SessionClaims): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, encodeRealPayload(encodeClaims(claims)), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
}

// Lee y verifica la firma de la cookie de sesión real — no toca la DB. `null` si no hay cookie, es
// de tipo "demo", o la firma/forma no es válida (incluye cookies del formato viejo pre-claims).
export async function getCurrentSessionClaims(): Promise<SessionClaims | null> {
  const store = await cookies();
  const decoded = decodeSessionCookie(store.get(SESSION_COOKIE_NAME)?.value);
  if (decoded?.kind !== "real") return null;
  return decodeClaims(decoded.value);
}

// Loguea a un usuario real construyendo sus claims desde la DB y seteando la cookie httpOnly +
// firmada desde el servidor — lo usan authenticateRealUser (login) y registerClienteAction (alta),
// nunca el cliente directamente.
export async function setRealSession(userId: string): Promise<void> {
  const claims = await buildSessionClaims(userId);
  if (!claims) {
    throw new Error("No se pudo construir la sesión: usuario no encontrado.");
  }
  await refreshSessionClaims(claims);
}

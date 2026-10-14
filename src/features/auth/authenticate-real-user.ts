"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { setRealSession } from "./session";

type AuthResult = { ok: true; redirectTo: string } | { ok: false; error: string };

// ADMIN → /admin, PROFESOR → /profesor, CLIENTE → /cliente — preparado para cuando existan
// cuentas reales de Profesor/Cliente (hoy solo hay una cuenta ADMIN real, la de bootstrap).
const ROLE_REDIRECTS: Record<string, string> = {
  ADMIN: "/admin",
  PROFESOR: "/profesor",
  CLIENTE: "/cliente",
};

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;
const GENERIC_ERROR = "Usuario o contraseña incorrectos.";

// Valida credenciales contra la tabla User real. Busca por loginId — los 3 roles (Admin,
// Profesor, Cliente) loguean por DNI+contraseña (loginId guarda el DNI; la cuenta de bootstrap
// usa el DNI fijo "12345678", no un documento real), nunca por email (el campo User.email queda
// sin usar desde el alta, ver
// "Roles del sistema" en CLAUDE.md). Nunca expone el hash al llamador.
export async function authenticateRealUser(
  identifier: string,
  password: string
): Promise<AuthResult> {
  const normalized = identifier.trim().toLowerCase();

  if (!normalized || !password) {
    return { ok: false, error: GENERIC_ERROR };
  }

  const user = await prisma.user.findFirst({
    where: {
      deactivatedAt: null,
      OR: [{ loginId: normalized }, { email: { equals: normalized, mode: "insensitive" } }],
    },
  });

  if (!user || !user.passwordHash) {
    return { ok: false, error: GENERIC_ERROR };
  }

  // Límite de intentos por cuenta (no por IP, ver nota en schema.prisma): si ya está bloqueada,
  // ni siquiera comparamos la contraseña — bloquea también un intento con la contraseña correcta,
  // a propósito, para que el límite sea real y no se pueda saltear adivinando bien a tiempo.
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const secondsLeft = Math.max(1, Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000));
    return {
      ok: false,
      error: `Demasiados intentos fallidos. Esperá ${secondsLeft}s e intentá de nuevo.`,
    };
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    const attempts = user.failedLoginAttempts + 1;
    const isNowLocked = attempts >= MAX_FAILED_ATTEMPTS;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: isNowLocked ? 0 : attempts,
        lockedUntil: isNowLocked ? new Date(Date.now() + LOCKOUT_MS) : null,
      },
    });

    return {
      ok: false,
      error: isNowLocked
        ? "Demasiados intentos fallidos. Esperá 1 minuto e intentá de nuevo."
        : GENERIC_ERROR,
    };
  }

  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  }

  await setRealSession(user.id);

  return { ok: true, redirectTo: ROLE_REDIRECTS[user.role] ?? "/" };
}

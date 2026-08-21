"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { setRealSession } from "@/features/auth/session";

export type RegisterClienteResult =
  | { ok: true; redirectTo: string }
  | { ok: false; error: string };

// Autoregistro de Cliente — a diferencia de createUserAction (panel de admin), esto lo llama
// alguien sin sesión todavía, así que no lleva requireAdmin(). branchId se resuelve con
// findFirst() porque en la práctica cada instancia tiene una sola sucursal (mismo criterio que
// prisma/seed.ts). El Cliente arranca sin profesor asignado (profesorId: null) — mismo estado que
// ya maneja features/cliente/home/no-professor-assigned.tsx.
export async function registerClienteAction(formData: FormData): Promise<RegisterClienteResult> {
  const name = String(formData.get("name") ?? "").trim();
  const loginId = String(formData.get("loginId") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!name || !loginId || !password) {
    return { ok: false, error: "Completá todos los campos obligatorios." };
  }

  if (password.length < 8) {
    return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
  }

  if (password !== confirmPassword) {
    return { ok: false, error: "Las contraseñas no coinciden." };
  }

  const branch = await prisma.branch.findFirst();
  if (!branch) {
    return { ok: false, error: "No se encontró la sucursal. Contactá al administrador." };
  }

  const existing = await prisma.user.findUnique({
    where: { branchId_loginId: { branchId: branch.id, loginId } },
  });
  if (existing) {
    return { ok: false, error: "Ya existe una cuenta con ese DNI." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        branchId: branch.id,
        role: "CLIENTE",
        loginId,
        passwordHash,
        name,
      },
    });

    await tx.cliente.create({
      data: {
        userId: createdUser.id,
        memberSince: new Date(),
        profesorId: null,
        routineId: null,
      },
    });

    return createdUser;
  });

  await setRealSession(user.id);

  return { ok: true, redirectTo: "/cliente" };
}

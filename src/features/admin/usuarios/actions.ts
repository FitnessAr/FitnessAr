"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/features/admin/require-admin";

export type CreateUserResult = { ok: true } | { ok: false; error: string };

// Crea User (+ Profesor si corresponde) en una sola transacción. El admin nunca crea cuentas de
// Cliente, ver "Roles del sistema".
export async function createUserAction(formData: FormData): Promise<CreateUserResult> {
  const admin = await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const loginId = String(formData.get("loginId") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const role = String(formData.get("role") ?? "");
  const schedule = String(formData.get("schedule") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim() || null;
  const bio = String(formData.get("bio") ?? "").trim() || null;

  if (!name || !loginId || !password || (role !== "ADMIN" && role !== "PROFESOR")) {
    return { ok: false, error: "Completá todos los campos obligatorios." };
  }

  if (password !== confirmPassword) {
    return { ok: false, error: "Las contraseñas no coinciden." };
  }

  const existing = await prisma.user.findUnique({
    where: { branchId_loginId: { branchId: admin.branchId, loginId } },
  });
  if (existing) {
    return { ok: false, error: "Ya existe una cuenta con ese usuario." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        branchId: admin.branchId,
        role,
        loginId,
        passwordHash,
        name,
        image,
        bio,
      },
    });

    if (role === "PROFESOR") {
      await tx.profesor.create({
        data: { userId: user.id, schedule: schedule || null },
      });
    }
  });

  revalidatePath("/admin/usuarios");
  return { ok: true };
}

export type SetUserActiveResult = { ok: true } | { ok: false; error: string };

// Activar/desactivar una cuenta (el toggle de la lista) — la cuenta sigue en la base, solo deja
// de poder loguear y de aparecer en listados activos, reversible en cualquier momento. Distinto
// de deleteUserAction (el tacho de basura), que sí borra la fila de verdad — ver ese comentario.
// Un admin nunca puede desactivar su propia cuenta — si no, se queda afuera del sistema sin forma
// de revertirlo desde la app (pasó una vez en desarrollo, quedó como guardia server-side a
// propósito, no solo deshabilitado en la UI).
export async function setUserActiveAction(
  userId: string,
  isActive: boolean
): Promise<SetUserActiveResult> {
  const admin = await requireAdmin();

  if (!isActive && userId === admin.id) {
    return { ok: false, error: "No podés desactivar tu propia cuenta." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { deactivatedAt: isActive ? null : new Date() },
  });

  revalidatePath("/admin/usuarios");
  return { ok: true };
}

export type DeleteUserResult = { ok: true } | { ok: false; error: string };

// El tacho de basura de la lista: borrado real de la fila (a diferencia del toggle, que solo
// desactiva). onDelete: Cascade en Profesor.user se encarga de borrar el perfil de Profesor
// asociado; las rutinas/clientes que tenía asignados no se borran — Routine.profesorId y
// Cliente.profesorId son SetNull (ver prisma/schema.prisma), quedan sin autor/profesor asignado.
// Un admin nunca puede borrar su propia cuenta — mismo motivo que en setUserActiveAction, pero acá
// ni siquiera hay un "reactivar" posible después.
export async function deleteUserAction(userId: string): Promise<DeleteUserResult> {
  const admin = await requireAdmin();

  if (userId === admin.id) {
    return { ok: false, error: "No podés eliminar tu propia cuenta." };
  }

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/admin/usuarios");
  return { ok: true };
}

export type UpdateUserProfileResult = { ok: true } | { ok: false; error: string };

// Edición de perfil (nombre, imagen, bio, rol, horario) desde el panel admin.
// El DNI no se puede cambiar (es el loginId, identificador de login).
export async function updateUserProfileAction(
  userId: string,
  formData: FormData
): Promise<UpdateUserProfileResult> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "");
  const image = String(formData.get("image") ?? "").trim() || null;
  const bio = String(formData.get("bio") ?? "").trim() || null;
  const schedule = String(formData.get("schedule") ?? "").trim();

  if (!name || (role !== "ADMIN" && role !== "PROFESOR")) {
    return { ok: false, error: "Completá todos los campos obligatorios." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { name, role, image, bio },
    });

    if (role === "PROFESOR") {
      await tx.profesor.upsert({
        where: { userId },
        update: { schedule: schedule || null },
        create: { userId, schedule: schedule || null },
      });
    } else if (role === "ADMIN") {
      await tx.profesor.deleteMany({ where: { userId } });
    }
  });

  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${userId}`);
  return { ok: true };
}

export type UpdateUserPasswordResult = { ok: true } | { ok: false; error: string };

// Reseteo de contraseña desde el panel: el admin nunca ve ni necesita la contraseña anterior (ni
// podría — solo se guarda el hash), solo carga una nueva. Sirve para cualquier cuenta gestionada
// acá (Admin o Profesor), incluida la propia.
export async function updateUserPasswordAction(
  userId: string,
  formData: FormData
): Promise<UpdateUserPasswordResult> {
  await requireAdmin();

  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!password || password.length < 6) {
    return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };
  }

  if (password !== confirmPassword) {
    return { ok: false, error: "Las contraseñas no coinciden." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  revalidatePath("/admin/usuarios");
  return { ok: true };
}

import { prisma } from "@/lib/db";
import type { AdminUserRow, UsuariosData } from "./types";

// El admin gestiona cuentas de Administrador y Profesor — nunca Cliente, ver "Roles del sistema"
// en CLAUDE.md (el alta de Cliente es un camino aparte, todavía sin definir).
export async function getUsuariosData(): Promise<UsuariosData> {
  const users = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "PROFESOR"] } },
    orderBy: { createdAt: "asc" },
  });

  const rows: AdminUserRow[] = users.map((user) => ({
    id: user.id,
    name: user.name,
    loginId: user.loginId,
    role: user.role as "ADMIN" | "PROFESOR",
    isActive: !user.deactivatedAt,
  }));

  return {
    users: rows,
    counts: {
      total: rows.length,
      admins: rows.filter((row) => row.role === "ADMIN").length,
      profesores: rows.filter((row) => row.role === "PROFESOR").length,
    },
  };
}

// Para la pantalla de edición (/admin/usuarios/[id]/editar) — solo lo necesario para mostrar a
// quién se le está reseteando la contraseña, nunca el hash.
export async function getUserForEdit(id: string): Promise<AdminUserRow | null> {
  const user = await prisma.user.findFirst({
    where: { id, role: { in: ["ADMIN", "PROFESOR"] } },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    loginId: user.loginId,
    role: user.role as "ADMIN" | "PROFESOR",
    isActive: !user.deactivatedAt,
  };
}

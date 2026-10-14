import { prisma } from "@/lib/db";
import { formatArgentinaTime } from "@/lib/format-ar-time";
import type { User } from "@/generated/prisma/client";
import type { UsuarioTabData } from "./types";

// Recibe el admin ya resuelto por requireAdmin() en vez de volver a buscarlo.
export async function getUsuarioTabData(admin: User): Promise<UsuarioTabData> {
  const profesores = await prisma.user.findMany({
    where: { branchId: admin.branchId, role: "PROFESOR", deactivatedAt: null },
    orderBy: { name: "asc" },
    include: { profesor: true },
  });

  return {
    admin: { name: admin.name, loginId: admin.loginId },
    profesoresActivos: profesores.map((profesor) => ({
      id: profesor.id,
      name: profesor.name,
      schedule: profesor.profesor?.schedule ?? null,
    })),
    horaActualAR: formatArgentinaTime(),
  };
}

import { prisma } from "@/lib/db";

export type UnassignedClient = {
  id: string;
  name: string;
  loginId: string | null;
};

// Clientes de la sucursal que todavía no tienen profesor — pool del que cualquier profesor puede
// reclamar uno por DNI (ver CLAUDE.md: "el profesor busca al cliente por DNI y lo reclama").
export async function getUnassignedClients(branchId: string): Promise<UnassignedClient[]> {
  const clientes = await prisma.cliente.findMany({
    where: { profesorId: null, user: { branchId } },
    include: { user: true },
    orderBy: { user: { name: "asc" } },
  });

  return clientes.map((cliente) => ({
    id: cliente.id,
    name: cliente.user.name,
    loginId: cliente.user.loginId,
  }));
}

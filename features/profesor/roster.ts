import { prisma } from "@/lib/db";

export type Client = {
  id: string;
  name: string;
  routineName: string | null;
  memberSince: Date;
  streakDays: number;
  setsCompletedToday: number;
  lastActivityAt: Date | null;
};

// Roster real de un profesor puntual (profesorId = Profesor.id, no un id de mock). streakDays,
// setsCompletedToday y lastActivityAt quedan en su valor "vacío" (0 / null) a propósito: todavía
// no hay ninguna tabla de historial de entrenamiento poblada (TrainingSession) de la que
// derivarlos — inventar un número sería peor que mostrar que no hay datos.
export async function getClientRoster(profesorId: string): Promise<Client[]> {
  const clientes = await prisma.cliente.findMany({
    where: { profesorId },
    include: { user: true, routine: true },
    orderBy: { user: { name: "asc" } },
  });

  return clientes.map((cliente) => ({
    id: cliente.id,
    name: cliente.user.name,
    routineName: cliente.routine?.name ?? null,
    memberSince: cliente.memberSince,
    streakDays: 0,
    setsCompletedToday: 0,
    lastActivityAt: null,
  }));
}

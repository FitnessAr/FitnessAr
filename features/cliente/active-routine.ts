import { getRoutineCatalog, type RoutineTemplate } from "@/features/routines/catalog";
import { getAllClients } from "@/features/clients/roster";
import { getCurrentIdentity } from "@/features/auth/session";

export type { ExerciseSummary, DayWorkout } from "@/features/routines/catalog";

// Mock de demo — el lado cliente sigue 100% sobre datos de prueba (fuera de alcance de la
// migración a Prisma en curso, ver CLAUDE.md). Reemplaza al viejo features/profesor/professor.ts
// (ya real, borrado) solo para no perder el nombre mostrado acá ("Prof. <nombre>").
const MOCK_PROFESSOR_NAMES: Record<string, string> = {
  profesor: "Rodrigo Vega",
  profesor2: "Lucía Fernández",
};

export type ActiveRoutine = RoutineTemplate & {
  assignedBy: string;
  assignedSince: Date;
  memberSince: Date;
};

// El nombre del cliente logueado, independiente de si tiene o no profesor/rutina asignada —
// lo necesita el header de Home incluso en el estado "sin profesor asignado".
export async function getCurrentClientName(): Promise<string> {
  const identity = (await getCurrentIdentity()) ?? "cliente";
  const clients = await getAllClients();
  const client = clients.find((entry) => entry.loginId === identity);
  return client?.name ?? "Cliente";
}

// Resuelve la rutina asignada al cliente logueado en esta demo, o `null` si todavía no tiene
// profesor asignado (y por ende, ninguna rutina que mostrar). Mock — en el producto real esto
// sale de la asignación profesor→cliente.
export async function getActiveRoutine(): Promise<ActiveRoutine | null> {
  const identity = (await getCurrentIdentity()) ?? "cliente";
  const clients = await getAllClients();
  const client = clients.find((entry) => entry.loginId === identity);

  if (!client || !client.assignedProfessorId || !client.routineName) {
    return null;
  }

  const catalog = await getRoutineCatalog();
  const routine = catalog.find((entry) => entry.name === client.routineName);

  if (!routine) {
    throw new Error(`Rutina "${client.routineName}" no encontrada en el catálogo`);
  }

  const professorName = MOCK_PROFESSOR_NAMES[client.assignedProfessorId] ?? "Profesor";

  return {
    ...routine,
    assignedBy: `Prof. ${professorName}`,
    assignedSince: new Date(2026, 0, 1),
    memberSince: client.memberSince,
  };
}

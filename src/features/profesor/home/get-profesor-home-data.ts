import { getClientRoster } from "../roster";
import { getBranchRoutines } from "../rutinas/get-branch-routines";
import type { ProfesorSessionUser, ProfesorSessionProfesor } from "../require-profesor";
import type { ProfesorHomeData } from "./types";

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export async function getProfesorHomeData(
  user: ProfesorSessionUser,
  profesor: ProfesorSessionProfesor
): Promise<ProfesorHomeData> {
  const [roster, branchRoutines] = await Promise.all([
    getClientRoster(profesor.id),
    getBranchRoutines(user.branchId),
  ]);
  const today = new Date();

  return {
    professorName: user.name,
    totalClients: roster.length,
    totalRoutines: branchRoutines.length,
    activeToday: roster.filter(
      (client) => client.lastActivityAt !== null && isSameDay(client.lastActivityAt, today)
    ),
  };
}

import { prisma } from "@/lib/db";
import { getClientRoster } from "../roster";
import { getBranchRoutines } from "../rutinas/get-branch-routines";
import type { ProfesorSessionUser, ProfesorSessionProfesor } from "../require-profesor";
import type { ProfesorPerfilData } from "./types";

// `schedule` se lee fresco de la DB (no viaja en los claims de la sesión, ver require-profesor.ts)
// porque es un dato editable por el propio profesor — no queremos que la pantalla de su Perfil
// pueda mostrar un horario desactualizado hasta por 2h.
export async function getPerfilData(
  user: ProfesorSessionUser,
  profesor: ProfesorSessionProfesor
): Promise<ProfesorPerfilData> {
  const [roster, branchRoutines, profesorRow] = await Promise.all([
    getClientRoster(profesor.id),
    getBranchRoutines(user.branchId),
    prisma.profesor.findUnique({ where: { id: profesor.id }, select: { schedule: true } }),
  ]);

  return {
    professorName: user.name,
    schedule: profesorRow?.schedule ?? "Sin horario cargado",
    totalClients: roster.length,
    totalRoutines: branchRoutines.length,
  };
}

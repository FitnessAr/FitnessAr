import type { User, Profesor } from "@/generated/prisma/client";
import { getClientRoster } from "../roster";
import { getBranchRoutines } from "../rutinas/get-branch-routines";
import type { ProfesorPerfilData } from "./types";

export async function getPerfilData(user: User, profesor: Profesor): Promise<ProfesorPerfilData> {
  const [roster, branchRoutines] = await Promise.all([
    getClientRoster(profesor.id),
    getBranchRoutines(user.branchId),
  ]);

  return {
    professorName: user.name,
    schedule: profesor.schedule ?? "Sin horario cargado",
    totalClients: roster.length,
    totalRoutines: branchRoutines.length,
  };
}

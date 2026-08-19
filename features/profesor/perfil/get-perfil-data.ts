import { getStudentRoster } from "../roster";
import { getProfessorProfile } from "../professor";
import { getRoutineCatalog } from "@/features/routines/catalog";
import { getCurrentIdentity } from "@/features/auth/session";
import type { ProfesorPerfilData } from "./types";

export async function getPerfilData(): Promise<ProfesorPerfilData> {
  const professorId = (await getCurrentIdentity()) ?? "profesor";
  const [profile, roster, catalog] = await Promise.all([
    getProfessorProfile(professorId),
    getStudentRoster(professorId),
    getRoutineCatalog(),
  ]);

  return {
    professorName: profile.name,
    schedule: profile.schedule,
    totalStudents: roster.length,
    totalRoutines: catalog.length,
  };
}

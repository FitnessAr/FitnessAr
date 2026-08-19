import { getStudentRoster } from "../roster";
import { getProfessorProfile } from "../professor";
import { getCurrentIdentity } from "@/features/auth/session";
import type { ProfesorHomeData } from "./types";

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export async function getProfesorHomeData(): Promise<ProfesorHomeData> {
  const professorId = (await getCurrentIdentity()) ?? "profesor";
  const [roster, profile] = await Promise.all([
    getStudentRoster(professorId),
    getProfessorProfile(professorId),
  ]);
  const today = new Date();

  return {
    professorName: profile.name,
    totalStudents: roster.length,
    totalRoutines: new Set(roster.map((student) => student.routineName)).size,
    activeToday: roster.filter((student) => isSameDay(student.lastActivityAt, today)),
  };
}

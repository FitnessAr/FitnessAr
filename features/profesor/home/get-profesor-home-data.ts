import { getStudentRoster } from "../roster";
import type { ProfesorHomeData } from "./types";

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export async function getProfesorHomeData(): Promise<ProfesorHomeData> {
  const roster = await getStudentRoster();
  const today = new Date();

  return {
    professorName: "Rodrigo Vega",
    totalStudents: roster.length,
    totalRoutines: new Set(roster.map((student) => student.routineName)).size,
    activeToday: roster.filter((student) => isSameDay(student.lastActivityAt, today)),
  };
}

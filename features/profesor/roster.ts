import { getAllStudents, type Student } from "@/features/students/roster";

export type { Student } from "@/features/students/roster";

// Roster de un profesor puntual — filtra el pool completo de alumnos
// (features/students/roster.ts) por quién tiene asignado. La regla de negocio de
// "actividad"/"activo hoy" (lastActivityAt = último set tildado) vive en ese pool compartido.
export async function getStudentRoster(professorId: string): Promise<Student[]> {
  const all = await getAllStudents();
  return all.filter((student) => student.assignedProfessorId === professorId);
}

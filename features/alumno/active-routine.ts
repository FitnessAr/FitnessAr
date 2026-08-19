import { getRoutineCatalog, type RoutineTemplate } from "@/features/routines/catalog";
import { getAllStudents } from "@/features/students/roster";
import { getProfessorProfile } from "@/features/profesor/professor";
import { getCurrentIdentity } from "@/features/auth/session";

export type { ExerciseSummary, DayWorkout } from "@/features/routines/catalog";

export type ActiveRoutine = RoutineTemplate & {
  assignedBy: string;
  assignedSince: Date;
  memberSince: Date;
};

// El nombre del alumno logueado, independiente de si tiene o no profesor/rutina asignada —
// lo necesita el header de Home incluso en el estado "sin profesor asignado".
export async function getCurrentStudentName(): Promise<string> {
  const identity = (await getCurrentIdentity()) ?? "alumno";
  const students = await getAllStudents();
  const student = students.find((entry) => entry.loginId === identity);
  return student?.name ?? "Alumno";
}

// Resuelve la rutina asignada al alumno logueado en esta demo, o `null` si todavía no tiene
// profesor asignado (y por ende, ninguna rutina que mostrar). Mock — en el producto real esto
// sale de la asignación profesor→alumno.
export async function getActiveRoutine(): Promise<ActiveRoutine | null> {
  const identity = (await getCurrentIdentity()) ?? "alumno";
  const students = await getAllStudents();
  const student = students.find((entry) => entry.loginId === identity);

  if (!student || !student.assignedProfessorId || !student.routineName) {
    return null;
  }

  const catalog = await getRoutineCatalog();
  const routine = catalog.find((entry) => entry.name === student.routineName);

  if (!routine) {
    throw new Error(`Rutina "${student.routineName}" no encontrada en el catálogo`);
  }

  const professor = await getProfessorProfile(student.assignedProfessorId);

  return {
    ...routine,
    assignedBy: `Prof. ${professor.name}`,
    assignedSince: new Date(2026, 0, 1),
    memberSince: student.memberSince,
  };
}

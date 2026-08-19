import { getStudentRoster } from "@/features/profesor/roster";
import { getCurrentIdentity } from "@/features/auth/session";
import { AlumnosScreen } from "@/features/profesor/alumnos/alumnos-screen";

export default async function AlumnosPage() {
  const professorId = (await getCurrentIdentity()) ?? "profesor";
  const students = await getStudentRoster(professorId);
  return <AlumnosScreen students={students} />;
}

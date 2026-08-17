import { getStudentRoster } from "@/features/profesor/roster";
import { AlumnosScreen } from "@/features/profesor/alumnos/alumnos-screen";

export default async function AlumnosPage() {
  const students = await getStudentRoster();
  return <AlumnosScreen students={students} />;
}

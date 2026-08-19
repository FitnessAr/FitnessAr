import { getStudentRoster } from "@/features/profesor/roster";
import { getCurrentIdentity } from "@/features/auth/session";
import { NuevaRutinaScreen } from "@/features/profesor/rutinas/nueva/nueva-rutina-screen";

export default async function NuevaRutinaPage() {
  const professorId = (await getCurrentIdentity()) ?? "profesor";
  const roster = await getStudentRoster(professorId);
  return <NuevaRutinaScreen roster={roster} />;
}

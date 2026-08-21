import { requireProfesor } from "@/features/profesor/require-profesor";
import { getClientRoster } from "@/features/profesor/roster";
import { NuevaRutinaScreen } from "@/features/profesor/rutinas/nueva/nueva-rutina-screen";

export default async function NuevaRutinaPage() {
  const { profesor } = await requireProfesor();
  const roster = await getClientRoster(profesor.id);
  return <NuevaRutinaScreen roster={roster} />;
}

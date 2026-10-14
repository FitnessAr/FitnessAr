import { requireProfesor } from "@/features/profesor/require-profesor";
import { getRutinasData } from "@/features/profesor/rutinas/get-rutinas-data";
import { RutinasScreen } from "@/features/profesor/rutinas/rutinas-screen";

export default async function RutinasPage() {
  const { user, profesor } = await requireProfesor();
  const data = await getRutinasData(profesor.id, user.branchId);
  return <RutinasScreen data={data} />;
}

import { getProgresoData } from "@/features/alumno/progreso/get-progreso-data";
import { ProgresoScreen } from "@/features/alumno/progreso/progreso-screen";

export default async function ProgresoPage() {
  const data = await getProgresoData();
  return <ProgresoScreen data={data} />;
}

import { getProgresoData } from "@/features/cliente/progreso/get-progreso-data";
import { ProgresoScreen } from "@/features/cliente/progreso/progreso-screen";

export default async function ProgresoPage() {
  const data = await getProgresoData();
  return <ProgresoScreen data={data} />;
}

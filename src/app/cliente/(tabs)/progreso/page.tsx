import { requireCliente } from "@/features/cliente/require-cliente";
import { getProgresoData } from "@/features/cliente/progreso/get-progreso-data";
import { ProgresoScreen } from "@/features/cliente/progreso/progreso-screen";

export default async function ProgresoPage() {
  const { cliente } = await requireCliente();
  const data = await getProgresoData(cliente.id);
  return <ProgresoScreen data={data} />;
}

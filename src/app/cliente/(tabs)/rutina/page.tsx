import { requireCliente } from "@/features/cliente/require-cliente";
import { getRutinaData } from "@/features/cliente/rutina/get-rutina-data";
import { RutinaScreen } from "@/features/cliente/rutina/rutina-screen";

export default async function RutinaPage() {
  const { cliente } = await requireCliente();
  const data = await getRutinaData(cliente);
  return <RutinaScreen data={data} />;
}

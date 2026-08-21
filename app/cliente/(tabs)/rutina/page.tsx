import { getRutinaData } from "@/features/cliente/rutina/get-rutina-data";
import { RutinaScreen } from "@/features/cliente/rutina/rutina-screen";

export default async function RutinaPage() {
  const data = await getRutinaData();
  return <RutinaScreen data={data} />;
}

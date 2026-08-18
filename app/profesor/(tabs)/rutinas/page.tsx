import { getRutinasData } from "@/features/profesor/rutinas/get-rutinas-data";
import { RutinasScreen } from "@/features/profesor/rutinas/rutinas-screen";

export default async function RutinasPage() {
  const data = await getRutinasData();
  return <RutinasScreen data={data} />;
}

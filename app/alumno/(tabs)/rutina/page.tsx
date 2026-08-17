import { getRutinaData } from "@/features/alumno/rutina/get-rutina-data";
import { RutinaScreen } from "@/features/alumno/rutina/rutina-screen";

export default async function RutinaPage() {
  const data = await getRutinaData();
  return <RutinaScreen data={data} />;
}

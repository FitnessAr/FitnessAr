import { getAlumnoHomeData } from "@/features/alumno/home/get-alumno-home-data";
import { HomeScreen } from "@/features/alumno/home/home-screen";

export default async function AlumnoHomePage() {
  const data = await getAlumnoHomeData();
  return <HomeScreen data={data} />;
}

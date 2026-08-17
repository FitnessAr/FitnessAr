import { getProfesorHomeData } from "@/features/profesor/home/get-profesor-home-data";
import { HomeScreen } from "@/features/profesor/home/home-screen";

export default async function ProfesorHomePage() {
  const data = await getProfesorHomeData();
  return <HomeScreen data={data} />;
}

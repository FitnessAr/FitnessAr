import { requireProfesor } from "@/features/profesor/require-profesor";
import { getProfesorHomeData } from "@/features/profesor/home/get-profesor-home-data";
import { HomeScreen } from "@/features/profesor/home/home-screen";

export default async function ProfesorHomePage() {
  const { user, profesor } = await requireProfesor();
  const data = await getProfesorHomeData(user, profesor);
  return <HomeScreen data={data} />;
}

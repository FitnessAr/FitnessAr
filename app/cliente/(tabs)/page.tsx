import { getClienteHomeData } from "@/features/cliente/home/get-cliente-home-data";
import { HomeScreen } from "@/features/cliente/home/home-screen";

export default async function ClienteHomePage() {
  const data = await getClienteHomeData();
  return <HomeScreen data={data} />;
}

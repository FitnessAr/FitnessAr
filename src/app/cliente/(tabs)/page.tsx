import { requireCliente } from "@/features/cliente/require-cliente";
import { getClienteHomeData } from "@/features/cliente/home/get-cliente-home-data";
import { HomeScreen } from "@/features/cliente/home/home-screen";

export default async function ClienteHomePage() {
  const { user, cliente } = await requireCliente();
  const data = await getClienteHomeData(user, cliente);
  return <HomeScreen data={data} />;
}

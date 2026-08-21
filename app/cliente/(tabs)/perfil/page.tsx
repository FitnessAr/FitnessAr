import { getClientePerfilData } from "@/features/cliente/perfil/get-perfil-data";
import { PerfilScreen } from "@/features/cliente/perfil/perfil-screen";

export default async function PerfilPage() {
  const data = await getClientePerfilData();
  return <PerfilScreen data={data} />;
}

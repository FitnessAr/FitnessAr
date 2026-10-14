import { requireCliente } from "@/features/cliente/require-cliente";
import { getClientePerfilData } from "@/features/cliente/perfil/get-perfil-data";
import { PerfilScreen } from "@/features/cliente/perfil/perfil-screen";

export default async function PerfilPage() {
  const { user, cliente } = await requireCliente();
  const data = await getClientePerfilData(user, cliente);
  return <PerfilScreen data={data} />;
}

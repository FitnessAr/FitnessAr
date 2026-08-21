import { requireProfesor } from "@/features/profesor/require-profesor";
import { getClientRoster } from "@/features/profesor/roster";
import { ClientesScreen } from "@/features/profesor/clientes/clientes-screen";

export default async function ClientesPage() {
  const { profesor } = await requireProfesor();
  const clients = await getClientRoster(profesor.id);
  return <ClientesScreen clients={clients} />;
}

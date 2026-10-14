import { requireProfesor } from "@/features/profesor/require-profesor";
import { getClientRoster } from "@/features/profesor/roster";
import { getUnassignedClients } from "@/features/profesor/clientes/get-unassigned-clients";
import { ClientesScreen } from "@/features/profesor/clientes/clientes-screen";

export default async function ClientesPage() {
  const { user, profesor } = await requireProfesor();
  const [clients, unassignedClients] = await Promise.all([
    getClientRoster(profesor.id),
    getUnassignedClients(user.branchId),
  ]);
  return <ClientesScreen clients={clients} unassignedClients={unassignedClients} />;
}

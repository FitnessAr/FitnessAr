import { redirect } from "next/navigation";
import { requireCliente } from "@/features/cliente/require-cliente";
import { getActiveRoutine } from "@/features/cliente/active-routine";
import { getTodaySession } from "@/features/cliente/session/get-today-session";
import { SessionScreen } from "@/features/cliente/session/session-screen";

export default async function SessionPage() {
  const { cliente } = await requireCliente();
  const routine = await getActiveRoutine(cliente.id);

  if (!routine) {
    redirect("/cliente");
  }

  const session = await getTodaySession(cliente.id);
  return <SessionScreen session={session} />;
}

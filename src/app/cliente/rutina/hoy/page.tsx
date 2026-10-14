import { redirect } from "next/navigation";
import { requireCliente } from "@/features/cliente/require-cliente";
import { getActiveRoutine } from "@/features/cliente/active-routine";
import { getTodaySession } from "@/features/cliente/session/get-today-session";
import { SessionScreen } from "@/features/cliente/session/session-screen";

export default async function SessionPage() {
  const { cliente } = await requireCliente();
  const routine = await getActiveRoutine(cliente);

  if (!routine) {
    redirect("/cliente");
  }

  const session = await getTodaySession(cliente);
  return <SessionScreen session={session} />;
}

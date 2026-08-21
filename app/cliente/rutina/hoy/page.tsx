import { redirect } from "next/navigation";
import { getActiveRoutine } from "@/features/cliente/active-routine";
import { getTodaySession } from "@/features/cliente/session/get-today-session";
import { SessionScreen } from "@/features/cliente/session/session-screen";

export default async function SessionPage() {
  const routine = await getActiveRoutine();

  if (!routine) {
    redirect("/cliente");
  }

  const session = await getTodaySession();
  return <SessionScreen session={session} />;
}

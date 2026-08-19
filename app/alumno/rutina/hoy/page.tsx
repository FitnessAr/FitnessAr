import { redirect } from "next/navigation";
import { getActiveRoutine } from "@/features/alumno/active-routine";
import { getTodaySession } from "@/features/alumno/session/get-today-session";
import { SessionScreen } from "@/features/alumno/session/session-screen";

export default async function SessionPage() {
  const routine = await getActiveRoutine();

  if (!routine) {
    redirect("/alumno");
  }

  const session = await getTodaySession();
  return <SessionScreen session={session} />;
}

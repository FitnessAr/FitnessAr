import { getTodaySession } from "@/features/alumno/session/get-today-session";
import { SessionScreen } from "@/features/alumno/session/session-screen";

export default async function SessionPage() {
  const session = await getTodaySession();
  return <SessionScreen session={session} />;
}

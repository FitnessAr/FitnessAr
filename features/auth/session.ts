import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "./session-cookie";

export { SESSION_COOKIE_NAME };

// Mock de demo — sesión mínima vía cookie, sin backend todavía. El valor guardado es
// directamente la clave de login (features/auth/demo-accounts.ts), reutilizada como "identidad
// actual" en vez de inventar un esquema de IDs paralelo mientras seguimos en fase de demo.
export async function getCurrentIdentity(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE_NAME)?.value ?? null;
}

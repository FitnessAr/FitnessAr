"use server";

import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "./session-cookie";

// Borra la cookie de sesión (demo o real, mismo nombre para las dos) desde el servidor — la
// cookie `real:` es httpOnly, así que el cliente ya no puede tocarla directamente.
export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}

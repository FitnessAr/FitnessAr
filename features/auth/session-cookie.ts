// Separado de session.ts porque ese archivo importa `next/headers` (solo válido en Server
// Components) y este nombre de cookie también lo necesitan Client Components (login-form.tsx,
// logout-link.tsx).
export const SESSION_COOKIE_NAME = "fitnessar_demo_identity";

// Credenciales hardcodeadas solo para la demo — se borra al conectar autenticación real (Clerk).
export const DEMO_ACCOUNTS = {
  alumno: { password: "alumno", redirectTo: "/alumno" },
  profesor: { password: "profesor", redirectTo: "/profesor" },
} as const;

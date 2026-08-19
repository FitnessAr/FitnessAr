// Credenciales hardcodeadas solo para la demo — se borra al conectar autenticación real (Clerk).
// alumno2/profesor2 son cuentas "vacías" (sin nadie agendado entre sí) para poder mostrar en la
// demo el estado de un alumno sin profesor asignado.
export const DEMO_ACCOUNTS = {
  alumno: { password: "alumno", redirectTo: "/alumno" },
  alumno2: { password: "alumno2", redirectTo: "/alumno" },
  profesor: { password: "profesor", redirectTo: "/profesor" },
  profesor2: { password: "profesor2", redirectTo: "/profesor" },
} as const;

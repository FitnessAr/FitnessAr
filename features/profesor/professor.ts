// Mock de demo — reemplazar por una consulta real (Prisma) cuando esté el backend.
// Fuente única de identidad por profesor; la usan Home y Perfil del lado profesor, y el lado
// alumno para mostrar quién le asignó su rutina.
const PROFESSORS: Record<string, { name: string; schedule: string }> = {
  profesor: { name: "Rodrigo Vega", schedule: "Lun–Sáb, 07:00–21:00" },
  profesor2: { name: "Lucía Fernández", schedule: "Lun–Vie, 09:00–18:00" },
};

export async function getProfessorProfile(
  professorId: string
): Promise<{ name: string; schedule: string }> {
  return PROFESSORS[professorId] ?? PROFESSORS.profesor;
}

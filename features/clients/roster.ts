export type Client = {
  name: string;
  // Solo presente si esta persona tenía login de demo — hoy sin uso real (ver CLAUDE.md: las
  // cuentas demo se sacaron del login), se conserva para cuando exista login real de Cliente.
  loginId?: string;
  // null = sin profesor asignado todavía.
  assignedProfessorId: string | null;
  routineName: string | null;
  // Desde cuándo es miembro del gimnasio — distinto de "desde cuándo tiene la rutina actual".
  memberSince: Date;
  streakDays: number;
  setsCompletedToday: number;
  lastActivityAt: Date;
};

function daysAgoAt(daysAgo: number, hours: number, minutes: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// Mock de demo — reemplazar por una consulta real (Prisma) cuando esté el backend.
// Fuente única de todas las personas clientas de la demo (asignadas o no) — tanto el roster de
// cada profesor (features/profesor/roster.ts, filtrado por assignedProfessorId) como el lado
// cliente (features/cliente/active-routine.ts, resuelto por loginId) consultan este mismo pool,
// en vez de tener cada uno su propio mock desincronizado.
export async function getAllClients(): Promise<Client[]> {
  return [
    {
      name: "Sofía Martínez",
      assignedProfessorId: "profesor",
      routineName: "Cardio y Tonificación",
      memberSince: new Date(2024, 10, 5),
      streakDays: 5,
      setsCompletedToday: 5,
      lastActivityAt: daysAgoAt(0, 10, 30),
    },
    {
      name: "Matías González",
      assignedProfessorId: "profesor",
      routineName: "Fuerza Total",
      memberSince: new Date(2023, 5, 12),
      streakDays: 12,
      setsCompletedToday: 12,
      lastActivityAt: daysAgoAt(0, 8, 15),
    },
    {
      name: "Luciana Torres",
      assignedProfessorId: "profesor",
      routineName: "Fuerza Total",
      memberSince: new Date(2022, 8, 20),
      streakDays: 23,
      setsCompletedToday: 0,
      lastActivityAt: daysAgoAt(1, 19, 0),
    },
    {
      name: "Diego Ramírez",
      assignedProfessorId: "profesor",
      routineName: "Cardio y Tonificación",
      memberSince: new Date(2025, 1, 10),
      streakDays: 3,
      setsCompletedToday: 0,
      lastActivityAt: daysAgoAt(2, 14, 0),
    },
    {
      name: "Valentina Ruiz",
      loginId: "cliente",
      assignedProfessorId: "profesor",
      routineName: "Fuerza Total",
      memberSince: new Date(2025, 0, 15),
      streakDays: 8,
      setsCompletedToday: 8,
      lastActivityAt: daysAgoAt(0, 9, 45),
    },
    {
      name: "Ezequiel Flores",
      assignedProfessorId: "profesor",
      routineName: "Cardio y Tonificación",
      memberSince: new Date(2023, 10, 8),
      streakDays: 15,
      setsCompletedToday: 0,
      lastActivityAt: daysAgoAt(1, 18, 30),
    },
    {
      name: "Camila Ibáñez",
      loginId: "cliente2",
      assignedProfessorId: null,
      routineName: null,
      memberSince: new Date(2026, 7, 10),
      streakDays: 0,
      setsCompletedToday: 0,
      lastActivityAt: daysAgoAt(0, 0, 0),
    },
  ];
}

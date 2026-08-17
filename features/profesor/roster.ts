export type Student = {
  name: string;
  routineName: string;
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
// Fuente única del roster de alumnos del profesor: la usan tanto la home
// (features/profesor/home/) como la pestaña Alumnos (features/profesor/alumnos/) para no quedar
// desincronizadas entre sí.
//
// `lastActivityAt` = el momento en que el alumno completó (tildó) la última serie de cualquiera
// de sus ejercicios — ese es el evento que determina su actividad. "Activo hoy" es simplemente:
// `lastActivityAt` cae en el día de la fecha.
export async function getStudentRoster(): Promise<Student[]> {
  return [
    {
      name: "Sofía Martínez",
      routineName: "Cardio y Tonificación",
      streakDays: 5,
      setsCompletedToday: 5,
      lastActivityAt: daysAgoAt(0, 10, 30),
    },
    {
      name: "Matías González",
      routineName: "Fuerza Total",
      streakDays: 12,
      setsCompletedToday: 12,
      lastActivityAt: daysAgoAt(0, 8, 15),
    },
    {
      name: "Luciana Torres",
      routineName: "Fuerza Total",
      streakDays: 23,
      setsCompletedToday: 0,
      lastActivityAt: daysAgoAt(1, 19, 0),
    },
    {
      name: "Diego Ramírez",
      routineName: "Cardio y Tonificación",
      streakDays: 3,
      setsCompletedToday: 0,
      lastActivityAt: daysAgoAt(2, 14, 0),
    },
    {
      name: "Valentina Ruiz",
      routineName: "Fuerza Total",
      streakDays: 8,
      setsCompletedToday: 8,
      lastActivityAt: daysAgoAt(0, 9, 45),
    },
    {
      name: "Ezequiel Flores",
      routineName: "Cardio y Tonificación",
      streakDays: 15,
      setsCompletedToday: 0,
      lastActivityAt: daysAgoAt(1, 18, 30),
    },
  ];
}

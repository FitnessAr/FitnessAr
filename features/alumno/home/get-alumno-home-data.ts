import { getCurrentWeekDays } from "./week";
import type { AlumnoHomeData, TodayWorkout } from "./types";

// Mock de demo — reemplazar por una consulta real (Prisma) cuando esté el backend.
// El contrato de salida (AlumnoHomeData) es lo único que le importa a la UI.
const SCHEDULE_WEEKDAYS = [1, 3, 5]; // lunes, miércoles, viernes (convención Date.getDay())

const WORKOUTS_BY_WEEKDAY: Record<number, TodayWorkout> = {
  1: {
    routineName: "Rutina A",
    dayLabel: "Lunes",
    title: "Fuerza Total",
    exerciseCount: 6,
    durationMinutes: 60,
    difficulty: "Intermedio",
  },
  3: {
    routineName: "Rutina B",
    dayLabel: "Miércoles",
    title: "Tren Superior",
    exerciseCount: 5,
    durationMinutes: 50,
    difficulty: "Intermedio",
  },
  5: {
    routineName: "Rutina C",
    dayLabel: "Viernes",
    title: "Piernas y Core",
    exerciseCount: 6,
    durationMinutes: 55,
    difficulty: "Intermedio",
  },
};

export async function getAlumnoHomeData(): Promise<AlumnoHomeData> {
  const today = new Date();
  const week = getCurrentWeekDays(SCHEDULE_WEEKDAYS, today);
  const todayWorkout = WORKOUTS_BY_WEEKDAY[today.getDay()] ?? null;

  return {
    studentName: "Sofía",
    week,
    todayWorkout,
    weeklySummary: {
      sessionsCompleted: 3,
      sessionsTotal: SCHEDULE_WEEKDAYS.length,
      minutes: 180,
      streakDays: 5,
    },
  };
}

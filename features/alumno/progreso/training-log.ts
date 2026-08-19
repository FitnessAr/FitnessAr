import type { ActiveRoutine } from "../active-routine";

export type LoggedSet = { weight: number; reps: number };
export type LoggedExercise = { name: string; sets: LoggedSet[] };
export type LoggedDay = {
  date: Date;
  weekday: number;
  completed: boolean;
  durationMinutes: number;
  exercises: LoggedExercise[];
};

const SESSIONS_BACK = 8;
// Sesión salteada a propósito, para que la racha actual sea menor al historial completo y así
// quede demostrado que el corte en el primer día no completado funciona de verdad.
const MISSED_SESSION_INDEX = 5;
const WEIGHT_DECAY_PER_SESSION = 0.05;
const MIN_WEIGHT_FACTOR = 0.4;

export function roundToHalfKg(value: number): number {
  return Math.round(value * 2) / 2;
}

function parseRepsAsNumber(reps: string): number {
  const numeric = parseInt(reps, 10);
  return Number.isNaN(numeric) ? 1 : numeric;
}

// Últimos `count` días programados de la rutina, antes de "hoy" (sin contar días de descanso),
// ordenados del más reciente al más viejo.
function getPastScheduledDates(scheduleWeekdays: number[], today: Date, count: number): Date[] {
  const dates: Date[] = [];
  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() - 1);

  while (dates.length < count) {
    if (scheduleWeekdays.includes(cursor.getDay())) {
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  return dates;
}

// Mock de demo — genera un historial de entrenamientos relativo a "hoy" (mismo criterio que
// daysAgoAt() en features/students/roster.ts), para que racha/actividad/récords tengan sentido
// sin importar qué día se mire la demo. Reemplazar por consultas reales (Prisma) cuando se
// persista lo que el alumno completa de verdad — hoy no hay backend para eso.
export function getTrainingLog(routine: ActiveRoutine, today: Date = new Date()): LoggedDay[] {
  const pastDates = getPastScheduledDates(routine.scheduleWeekdays, today, SESSIONS_BACK);

  return pastDates.map((date, index) => {
    const dayWorkout = routine.workoutsByWeekday[date.getDay()];
    const completed = index !== MISSED_SESSION_INDEX && dayWorkout !== null;

    if (!completed || !dayWorkout) {
      return {
        date,
        weekday: date.getDay(),
        completed: false,
        durationMinutes: 0,
        exercises: [],
      };
    }

    const decay = Math.max(1 - WEIGHT_DECAY_PER_SESSION * index, MIN_WEIGHT_FACTOR);
    const exercises: LoggedExercise[] = dayWorkout.exercises.map((exercise) => {
      const baseWeight = exercise.previousSets[0]?.weight ?? 0;
      const weight = roundToHalfKg(baseWeight * decay);
      const reps = parseRepsAsNumber(exercise.reps);

      return {
        name: exercise.name,
        sets: Array.from({ length: exercise.sets }, () => ({ weight, reps })),
      };
    });

    return {
      date,
      weekday: date.getDay(),
      completed: true,
      durationMinutes: dayWorkout.durationMinutes,
      exercises,
    };
  });
}

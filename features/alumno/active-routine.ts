export type ExerciseSummary = {
  name: string;
  sets: number;
  reps: string;
  muscleGroup: string;
  restSeconds: number;
  // Peso × reps de la última sesión, una entrada por set (mismo orden). Mock de demo — en el
  // producto real sale del histórico de sesiones del alumno para ese ejercicio.
  previousSets: { weight: number; reps: number }[];
};

export type DayWorkout = {
  title: string;
  exerciseCount: number;
  durationMinutes: number;
  difficulty: string;
  exercises: ExerciseSummary[];
} | null;

export type ActiveRoutine = {
  name: string;
  assignedBy: string;
  assignedSince: Date;
  // Convención Date.getDay(): 0 = domingo ... 6 = sábado.
  scheduleWeekdays: number[];
  workoutsByWeekday: Record<number, DayWorkout>;
};

// Mock de demo — reemplazar por una consulta real (Prisma) cuando esté el backend.
// Fuente única de la rutina activa del alumno: la usan Home, Rutina y el checklist de hoy para no
// quedar desincronizadas entre sí.
export async function getActiveRoutine(): Promise<ActiveRoutine> {
  return {
    name: "Fuerza Total",
    assignedBy: "Prof. Rodrigo Vega",
    assignedSince: new Date(2026, 0, 1),
    scheduleWeekdays: [1, 3, 5],
    workoutsByWeekday: {
      1: {
        title: "Fuerza Total",
        exerciseCount: 6,
        durationMinutes: 38,
        difficulty: "Intermedio",
        exercises: [
          {
            name: "Sentadillas",
            sets: 4,
            reps: "12",
            muscleGroup: "Cuádriceps / Glúteos",
            restSeconds: 60,
            previousSets: [
              { weight: 60, reps: 12 },
              { weight: 60, reps: 12 },
              { weight: 60, reps: 11 },
              { weight: 60, reps: 10 },
            ],
          },
          {
            name: "Press de Banca",
            sets: 3,
            reps: "10",
            muscleGroup: "Pecho / Tríceps",
            restSeconds: 90,
            previousSets: [
              { weight: 50, reps: 10 },
              { weight: 50, reps: 10 },
              { weight: 50, reps: 9 },
            ],
          },
          {
            name: "Peso Muerto",
            sets: 3,
            reps: "8",
            muscleGroup: "Isquiotibiales / Espalda",
            restSeconds: 120,
            previousSets: [
              { weight: 80, reps: 8 },
              { weight: 80, reps: 8 },
              { weight: 80, reps: 7 },
            ],
          },
          {
            name: "Dominadas",
            sets: 3,
            reps: "8",
            muscleGroup: "Espalda / Bíceps",
            restSeconds: 90,
            previousSets: [
              { weight: 0, reps: 7 },
              { weight: 0, reps: 7 },
              { weight: 0, reps: 6 },
            ],
          },
          {
            name: "Press Militar",
            sets: 3,
            reps: "10",
            muscleGroup: "Hombros / Tríceps",
            restSeconds: 60,
            previousSets: [
              { weight: 30, reps: 10 },
              { weight: 30, reps: 10 },
              { weight: 30, reps: 9 },
            ],
          },
          {
            name: "Curl de Bíceps",
            sets: 3,
            reps: "12",
            muscleGroup: "Bíceps",
            restSeconds: 60,
            previousSets: [
              { weight: 12, reps: 12 },
              { weight: 12, reps: 12 },
              { weight: 12, reps: 11 },
            ],
          },
        ],
      },
      3: {
        title: "Tren Superior",
        exerciseCount: 5,
        durationMinutes: 50,
        difficulty: "Intermedio",
        exercises: [
          {
            name: "Press de banca inclinado",
            sets: 4,
            reps: "10",
            muscleGroup: "Pecho / Hombros",
            restSeconds: 90,
            previousSets: [
              { weight: 40, reps: 10 },
              { weight: 40, reps: 10 },
              { weight: 40, reps: 10 },
              { weight: 40, reps: 9 },
            ],
          },
          {
            name: "Remo con mancuerna",
            sets: 4,
            reps: "10",
            muscleGroup: "Espalda / Bíceps",
            restSeconds: 90,
            previousSets: [
              { weight: 22, reps: 10 },
              { weight: 22, reps: 10 },
              { weight: 22, reps: 10 },
              { weight: 22, reps: 9 },
            ],
          },
          {
            name: "Press militar con mancuernas",
            sets: 3,
            reps: "10",
            muscleGroup: "Hombros / Tríceps",
            restSeconds: 60,
            previousSets: [
              { weight: 14, reps: 10 },
              { weight: 14, reps: 10 },
              { weight: 14, reps: 9 },
            ],
          },
          {
            name: "Curl de bíceps",
            sets: 3,
            reps: "12",
            muscleGroup: "Bíceps",
            restSeconds: 60,
            previousSets: [
              { weight: 12, reps: 12 },
              { weight: 12, reps: 12 },
              { weight: 12, reps: 11 },
            ],
          },
          {
            name: "Extensión de tríceps",
            sets: 3,
            reps: "12",
            muscleGroup: "Tríceps",
            restSeconds: 60,
            previousSets: [
              { weight: 15, reps: 12 },
              { weight: 15, reps: 12 },
              { weight: 15, reps: 10 },
            ],
          },
        ],
      },
      5: {
        title: "Piernas y Core",
        exerciseCount: 6,
        durationMinutes: 55,
        difficulty: "Intermedio",
        exercises: [
          {
            name: "Sentadilla búlgara",
            sets: 4,
            reps: "10",
            muscleGroup: "Cuádriceps / Glúteos",
            restSeconds: 90,
            previousSets: [
              { weight: 16, reps: 10 },
              { weight: 16, reps: 10 },
              { weight: 16, reps: 9 },
              { weight: 16, reps: 8 },
            ],
          },
          {
            name: "Prensa de piernas",
            sets: 4,
            reps: "10",
            muscleGroup: "Cuádriceps / Glúteos",
            restSeconds: 90,
            previousSets: [
              { weight: 100, reps: 10 },
              { weight: 100, reps: 10 },
              { weight: 100, reps: 10 },
              { weight: 100, reps: 9 },
            ],
          },
          {
            name: "Zancadas",
            sets: 3,
            reps: "12",
            muscleGroup: "Cuádriceps / Glúteos",
            restSeconds: 60,
            previousSets: [
              { weight: 12, reps: 12 },
              { weight: 12, reps: 12 },
              { weight: 12, reps: 11 },
            ],
          },
          {
            name: "Peso muerto rumano",
            sets: 3,
            reps: "10",
            muscleGroup: "Isquiotibiales / Espalda",
            restSeconds: 90,
            previousSets: [
              { weight: 40, reps: 10 },
              { weight: 40, reps: 10 },
              { weight: 40, reps: 9 },
            ],
          },
          {
            name: "Elevación de talones",
            sets: 3,
            reps: "15",
            muscleGroup: "Pantorrillas",
            restSeconds: 45,
            previousSets: [
              { weight: 30, reps: 15 },
              { weight: 30, reps: 15 },
              { weight: 30, reps: 14 },
            ],
          },
          {
            name: "Plancha lateral",
            sets: 3,
            reps: "30 seg",
            muscleGroup: "Core / Abdomen",
            restSeconds: 30,
            previousSets: [
              { weight: 0, reps: 30 },
              { weight: 0, reps: 30 },
              { weight: 0, reps: 25 },
            ],
          },
        ],
      },
    },
  };
}

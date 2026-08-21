export type ExerciseSummary = {
  name: string;
  sets: number;
  reps: string;
  muscleGroup: string;
  restSeconds: number;
  // Peso × reps de la última sesión, una entrada por set (mismo orden). Mock de demo — en el
  // producto real sale del histórico de sesiones del cliente para ese ejercicio.
  previousSets: { weight: number; reps: number }[];
};

export type DayWorkout = {
  title: string;
  exerciseCount: number;
  durationMinutes: number;
  exercises: ExerciseSummary[];
} | null;

export type RoutineTemplate = {
  name: string;
  difficulty: string;
  // Convención Date.getDay(): 0 = domingo ... 6 = sábado.
  scheduleWeekdays: number[];
  workoutsByWeekday: Record<number, DayWorkout>;
};

// Mock de demo — reemplazar por una consulta real (Prisma) cuando esté el backend.
// Catálogo de rutinas del profesor: fuente única tanto para el cliente (features/cliente/active-
// routine.ts resuelve cuál le corresponde) como para la pestaña Rutinas del profesor.
export async function getRoutineCatalog(): Promise<RoutineTemplate[]> {
  return [
    {
      name: "Fuerza Total",
      difficulty: "Intermedio",
      scheduleWeekdays: [1, 3, 5],
      workoutsByWeekday: {
        1: {
          title: "Fuerza Total",
          exerciseCount: 6,
          durationMinutes: 38,
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
    },
    {
      name: "Cardio y Tonificación",
      difficulty: "Principiante",
      scheduleWeekdays: [2, 4, 6],
      workoutsByWeekday: {
        2: {
          title: "Full Body Cardio",
          exerciseCount: 5,
          durationMinutes: 45,
          exercises: [
            {
              name: "Jumping Jacks",
              sets: 3,
              reps: "40",
              muscleGroup: "Cardio / Full Body",
              restSeconds: 30,
              previousSets: [
                { weight: 0, reps: 40 },
                { weight: 0, reps: 40 },
                { weight: 0, reps: 35 },
              ],
            },
            {
              name: "Burpees",
              sets: 3,
              reps: "12",
              muscleGroup: "Cardio / Full Body",
              restSeconds: 45,
              previousSets: [
                { weight: 0, reps: 12 },
                { weight: 0, reps: 12 },
                { weight: 0, reps: 10 },
              ],
            },
            {
              name: "Mountain Climbers",
              sets: 3,
              reps: "30 seg",
              muscleGroup: "Core / Cardio",
              restSeconds: 30,
              previousSets: [
                { weight: 0, reps: 30 },
                { weight: 0, reps: 30 },
                { weight: 0, reps: 25 },
              ],
            },
            {
              name: "Sentadilla con salto",
              sets: 3,
              reps: "15",
              muscleGroup: "Cuádriceps / Glúteos",
              restSeconds: 45,
              previousSets: [
                { weight: 0, reps: 15 },
                { weight: 0, reps: 15 },
                { weight: 0, reps: 12 },
              ],
            },
            {
              name: "Plancha",
              sets: 3,
              reps: "40 seg",
              muscleGroup: "Core / Abdomen",
              restSeconds: 30,
              previousSets: [
                { weight: 0, reps: 40 },
                { weight: 0, reps: 40 },
                { weight: 0, reps: 35 },
              ],
            },
          ],
        },
        4: {
          title: "Tonificación Total",
          exerciseCount: 5,
          durationMinutes: 40,
          exercises: [
            {
              name: "Cuerda (salto)",
              sets: 3,
              reps: "60 seg",
              muscleGroup: "Cardio / Full Body",
              restSeconds: 30,
              previousSets: [
                { weight: 0, reps: 60 },
                { weight: 0, reps: 60 },
                { weight: 0, reps: 50 },
              ],
            },
            {
              name: "Zancadas con salto",
              sets: 3,
              reps: "12",
              muscleGroup: "Cuádriceps / Glúteos",
              restSeconds: 45,
              previousSets: [
                { weight: 0, reps: 12 },
                { weight: 0, reps: 12 },
                { weight: 0, reps: 10 },
              ],
            },
            {
              name: "Abdominales",
              sets: 3,
              reps: "20",
              muscleGroup: "Core / Abdomen",
              restSeconds: 30,
              previousSets: [
                { weight: 0, reps: 20 },
                { weight: 0, reps: 20 },
                { weight: 0, reps: 18 },
              ],
            },
            {
              name: "Burpees",
              sets: 3,
              reps: "12",
              muscleGroup: "Cardio / Full Body",
              restSeconds: 45,
              previousSets: [
                { weight: 0, reps: 12 },
                { weight: 0, reps: 11 },
                { weight: 0, reps: 10 },
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
        6: {
          title: "Cardio Full Body",
          exerciseCount: 5,
          durationMinutes: 42,
          exercises: [
            {
              name: "Jumping Jacks",
              sets: 3,
              reps: "40",
              muscleGroup: "Cardio / Full Body",
              restSeconds: 30,
              previousSets: [
                { weight: 0, reps: 40 },
                { weight: 0, reps: 40 },
                { weight: 0, reps: 38 },
              ],
            },
            {
              name: "Sentadilla con salto",
              sets: 3,
              reps: "15",
              muscleGroup: "Cuádriceps / Glúteos",
              restSeconds: 45,
              previousSets: [
                { weight: 0, reps: 15 },
                { weight: 0, reps: 15 },
                { weight: 0, reps: 13 },
              ],
            },
            {
              name: "Mountain Climbers",
              sets: 3,
              reps: "30 seg",
              muscleGroup: "Core / Cardio",
              restSeconds: 30,
              previousSets: [
                { weight: 0, reps: 30 },
                { weight: 0, reps: 30 },
                { weight: 0, reps: 28 },
              ],
            },
            {
              name: "Abdominales bicicleta",
              sets: 3,
              reps: "20",
              muscleGroup: "Core / Abdomen",
              restSeconds: 30,
              previousSets: [
                { weight: 0, reps: 20 },
                { weight: 0, reps: 20 },
                { weight: 0, reps: 18 },
              ],
            },
            {
              name: "Plancha",
              sets: 3,
              reps: "40 seg",
              muscleGroup: "Core / Abdomen",
              restSeconds: 30,
              previousSets: [
                { weight: 0, reps: 40 },
                { weight: 0, reps: 38 },
                { weight: 0, reps: 35 },
              ],
            },
          ],
        },
      },
    },
  ];
}

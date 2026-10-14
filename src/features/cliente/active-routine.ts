import { prisma } from "@/lib/db";
import { getPreviousSets } from "./previous-sets";
import type { Cliente } from "@/generated/prisma/client";

export type ExerciseSummary = {
  name: string;
  sets: number;
  reps: string;
  muscleGroup: string;
  restSeconds: number;
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
  scheduleWeekdays: number[];
  workoutsByWeekday: Record<number, DayWorkout>;
};

export type ActiveRoutine = RoutineTemplate & {
  assignedBy: string;
  assignedSince: Date;
  memberSince: Date;
};

const DIFFICULTY_LABELS: Record<string, string> = {
  PRINCIPIANTE: "Principiante",
  INTERMEDIO: "Intermedio",
  AVANZADO: "Avanzado",
};

function formatReps(reps: number, unit: string): string {
  return unit === "SECONDS" ? `${reps} seg` : String(reps);
}

// Resuelve la rutina real asignada al cliente logueado, o `null` si todavía no tiene profesor o
// rutina asignada. Reemplaza al viejo mock (features/routines/catalog.ts + features/clients/
// roster.ts, ambos borrados) — mantiene los mismos tipos (ActiveRoutine/DayWorkout/
// ExerciseSummary) para no tocar los componentes de presentación de Home/Rutina/Perfil/Session.
export async function getActiveRoutine(cliente: Cliente): Promise<ActiveRoutine | null> {
  if (!cliente.profesorId || !cliente.routineId) {
    return null;
  }

  const routine = await prisma.routine.findUnique({
    where: { id: cliente.routineId },
    include: {
      profesor: { include: { user: true } },
      days: {
        include: {
          exercises: { include: { exercise: true }, orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!routine) {
    return null;
  }

  const scheduleWeekdays = routine.days.map((day) => day.weekday);
  const workoutsByWeekday: Record<number, DayWorkout> = {};

  for (const day of routine.days) {
    const exercises: ExerciseSummary[] = await Promise.all(
      day.exercises.map(async (routineExercise) => ({
        name: routineExercise.exercise.name,
        sets: routineExercise.sets,
        reps: formatReps(routineExercise.reps, routineExercise.unit),
        muscleGroup: routineExercise.exercise.muscleGroup ?? "General",
        restSeconds: routineExercise.restSeconds,
        previousSets: await getPreviousSets(
          cliente.id,
          routineExercise.exerciseId,
          routineExercise.sets,
          routineExercise.reps
        ),
      }))
    );

    workoutsByWeekday[day.weekday] = {
      title: day.title,
      exerciseCount: day.exercises.length,
      durationMinutes: day.durationMinutes,
      exercises,
    };
  }

  return {
    name: routine.name,
    difficulty: DIFFICULTY_LABELS[routine.difficulty] ?? routine.difficulty,
    scheduleWeekdays,
    workoutsByWeekday,
    assignedBy: routine.profesor ? `Prof. ${routine.profesor.user.name}` : "Tu gimnasio",
    assignedSince: cliente.routineAssignedAt ?? routine.createdAt,
    memberSince: cliente.memberSince,
  };
}

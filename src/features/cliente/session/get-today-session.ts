import { prisma } from "@/lib/db";
import { getActiveRoutine } from "../active-routine";
import { getPreviousSets } from "../previous-sets";
import { WEEKDAY_NAMES_ES } from "../weekday-names";
import type { Cliente } from "@/generated/prisma/client";
import type { SessionData, SetLog } from "./types";

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

// Encuentra (o crea, la primera vez que el cliente entra hoy) la TrainingSession de hoy, con sus
// SessionExercise/SessionSet anidados precargados desde la rutina real. Idempotente: recargar la
// página no duplica nada, solo recupera lo que ya existe.
export async function getTodaySession(cliente: Cliente): Promise<SessionData> {
  if (!cliente.routineId) {
    return null;
  }

  const routine = await getActiveRoutine(cliente);
  if (!routine) {
    return null;
  }

  const today = new Date();
  const dayWorkout = routine.workoutsByWeekday[today.getDay()] ?? null;
  if (!dayWorkout) {
    return null;
  }

  const routineDay = await prisma.routineDay.findUnique({
    where: { routineId_weekday: { routineId: cliente.routineId, weekday: today.getDay() } },
    include: { exercises: { orderBy: { order: "asc" } } },
  });
  if (!routineDay) {
    return null;
  }

  const todayStart = startOfDay(today);

  let session = await prisma.trainingSession.findFirst({
    where: { clienteId: cliente.id, routineDayId: routineDay.id, date: todayStart },
    include: { exercises: { include: { sets: { orderBy: { setIndex: "asc" } } } } },
  });

  if (!session) {
    const seeds = await Promise.all(
      routineDay.exercises.map((routineExercise) =>
        getPreviousSets(
          cliente.id,
          routineExercise.exerciseId,
          routineExercise.sets,
          routineExercise.reps
        )
      )
    );

    session = await prisma.trainingSession.create({
      data: {
        clienteId: cliente.id,
        routineId: cliente.routineId,
        routineDayId: routineDay.id,
        date: todayStart,
        weekday: today.getDay(),
        exercises: {
          create: routineDay.exercises.map((routineExercise, index) => ({
            routineExerciseId: routineExercise.id,
            exerciseId: routineExercise.exerciseId,
            sets: {
              create: seeds[index].map((seed, setIndex) => ({
                setIndex,
                weightKg: seed.weight,
                reps: routineExercise.reps,
                unit: routineExercise.unit,
                completed: false,
              })),
            },
          })),
        },
      },
      include: { exercises: { include: { sets: { orderBy: { setIndex: "asc" } } } } },
    });
  }

  // dayWorkout.exercises (de getActiveRoutine) y routineDay.exercises comparten el mismo orden
  // (ambos por RoutineExercise.order), se emparejan por índice; session.exercises se empareja por
  // exerciseId porque el orden de retorno de un findFirst/create no está garantizado.
  const sessionExerciseByExerciseId = new Map(
    session.exercises.map((sessionExercise) => [sessionExercise.exerciseId, sessionExercise] as const)
  );

  const exercises = dayWorkout.exercises.map((exercise, index) => {
    const routineExercise = routineDay.exercises[index];
    const sessionExercise = sessionExerciseByExerciseId.get(routineExercise.exerciseId);

    const logs: SetLog[] = (sessionExercise?.sets ?? []).map((set) => ({
      id: set.id,
      weight: set.weightKg !== null ? String(set.weightKg) : "",
      reps: set.reps !== null ? String(set.reps) : "",
      completed: set.completed,
    }));

    return { exercise, logs };
  });

  return {
    dayLabel: WEEKDAY_NAMES_ES[today.getDay()],
    title: dayWorkout.title,
    exerciseCount: dayWorkout.exerciseCount,
    durationMinutes: dayWorkout.durationMinutes,
    difficulty: routine.difficulty,
    exercises,
  };
}

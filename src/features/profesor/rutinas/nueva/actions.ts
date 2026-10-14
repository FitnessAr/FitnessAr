"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireProfesor } from "@/features/profesor/require-profesor";
import type { RoutineDayDraft } from "./types";

export type CreateRoutineResult = { ok: true } | { ok: false; error: string };

export async function createRoutineAction(input: {
  name: string;
  difficulty: "PRINCIPIANTE" | "INTERMEDIO" | "AVANZADO";
  days: RoutineDayDraft[];
  clienteIds: string[];
}): Promise<CreateRoutineResult> {
  const { user, profesor } = await requireProfesor();

  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "Ponele un nombre a la rutina." };
  }

  const daysWithExercises = input.days.filter((day) => day.exercises.length > 0);
  if (daysWithExercises.length === 0) {
    return { ok: false, error: "Agregá al menos un ejercicio a algún día." };
  }

  await prisma.$transaction(async (tx) => {
    const routine = await tx.routine.create({
      data: {
        branchId: user.branchId,
        profesorId: profesor.id,
        name,
        difficulty: input.difficulty,
        days: {
          create: daysWithExercises.map((day) => ({
            weekday: day.weekday,
            title: day.title,
            // Sin input propio en el armado todavía — estimación simple a partir de la cantidad
            // de ejercicios, no un dato crítico para la demo.
            durationMinutes: day.exercises.length * 8,
            exercises: {
              create: day.exercises.map((exercise, index) => ({
                exerciseId: exercise.exerciseId,
                order: index,
                sets: exercise.sets,
                reps: exercise.reps,
                unit: exercise.unit,
                restSeconds: exercise.restSeconds,
              })),
            },
          })),
        },
      },
    });

    for (const clienteId of input.clienteIds) {
      // Acotado al propio roster del profesor (defensa extra, no solo confiar en la UI).
      await tx.cliente.update({
        where: { id: clienteId, profesorId: profesor.id },
        data: { routineId: routine.id, routineAssignedAt: new Date() },
      });
    }
  });

  revalidatePath("/profesor/rutinas");
  return { ok: true };
}

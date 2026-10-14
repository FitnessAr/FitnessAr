import { prisma } from "@/lib/db";

export type PreviousSet = { weight: number; reps: number };

// Última sesión COMPLETADA de este cliente para este ejercicio puntual, acolchada/recortada a
// `setsCount` entradas (con `targetReps` como relleno si nunca lo hizo, o hizo menos series la
// última vez) — usado tanto para mostrar la referencia "Previa" en el checklist como para
// precargar el peso inicial de una TrainingSession recién creada.
export async function getPreviousSets(
  clienteId: string,
  exerciseId: string,
  setsCount: number,
  targetReps: number
): Promise<PreviousSet[]> {
  const lastExercise = await prisma.sessionExercise.findFirst({
    where: { exerciseId, completed: true, session: { clienteId } },
    orderBy: { session: { date: "desc" } },
    include: { sets: { orderBy: { setIndex: "asc" } } },
  });

  const previous: PreviousSet[] = (lastExercise?.sets ?? [])
    .filter((set) => set.completed && set.weightKg !== null && set.reps !== null)
    .map((set) => ({ weight: Number(set.weightKg), reps: set.reps as number }));

  return Array.from({ length: setsCount }, (_, index) => previous[index] ?? { weight: 0, reps: targetReps });
}

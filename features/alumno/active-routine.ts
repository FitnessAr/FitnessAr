import { getRoutineCatalog, type RoutineTemplate } from "@/features/routines/catalog";

export type { ExerciseSummary, DayWorkout } from "@/features/routines/catalog";

export type ActiveRoutine = RoutineTemplate & {
  assignedBy: string;
  assignedSince: Date;
};

// Resuelve cuál rutina del catálogo (features/routines/catalog.ts) tiene asignada la alumna
// logueada en esta demo. Mock — en el producto real esto sale de la asignación profesor→alumno.
export async function getActiveRoutine(): Promise<ActiveRoutine> {
  const catalog = await getRoutineCatalog();
  const routine = catalog.find((entry) => entry.name === "Fuerza Total");

  if (!routine) {
    throw new Error('Rutina "Fuerza Total" no encontrada en el catálogo');
  }

  return {
    ...routine,
    assignedBy: "Prof. Rodrigo Vega",
    assignedSince: new Date(2026, 0, 1),
  };
}

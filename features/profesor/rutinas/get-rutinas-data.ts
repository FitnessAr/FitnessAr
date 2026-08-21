import { getFirstScheduledWeekday, formatScheduleDays } from "@/features/routines/format-schedule";
import { getClientRoster } from "../roster";
import { getBranchRoutines } from "./get-branch-routines";
import type { RoutineCard, RutinasData } from "./types";

export async function getRutinasData(profesorId: string, branchId: string): Promise<RutinasData> {
  const [branchRoutines, roster] = await Promise.all([
    getBranchRoutines(branchId),
    getClientRoster(profesorId),
  ]);

  const routines: RoutineCard[] = branchRoutines.map((routine) => {
    const firstWeekday = getFirstScheduledWeekday(routine.scheduleWeekdays);
    const firstDayWorkout = routine.workoutsByWeekday[firstWeekday];
    const assignedClientNames = roster
      .filter((client) => client.routineName === routine.name)
      .map((client) => client.name);

    return {
      name: routine.name,
      difficulty: routine.difficulty,
      scheduleLabel: formatScheduleDays(routine.scheduleWeekdays),
      exerciseCount: firstDayWorkout?.exerciseCount ?? 0,
      durationMinutes: firstDayWorkout?.durationMinutes ?? 0,
      assignedClientNames,
    };
  });

  return {
    routines,
    activeRoutinesCount: routines.filter((routine) => routine.assignedClientNames.length > 0)
      .length,
  };
}

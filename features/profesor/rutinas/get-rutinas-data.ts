import { getRoutineCatalog } from "@/features/routines/catalog";
import { formatScheduleDays, getFirstScheduledWeekday } from "@/features/routines/format-schedule";
import { getStudentRoster } from "../roster";
import type { RoutineCard, RutinasData } from "./types";

export async function getRutinasData(): Promise<RutinasData> {
  const [catalog, roster] = await Promise.all([getRoutineCatalog(), getStudentRoster()]);

  const routines: RoutineCard[] = catalog.map((routine) => {
    const firstWeekday = getFirstScheduledWeekday(routine.scheduleWeekdays);
    const firstDayWorkout = routine.workoutsByWeekday[firstWeekday];
    const assignedStudentNames = roster
      .filter((student) => student.routineName === routine.name)
      .map((student) => student.name);

    return {
      name: routine.name,
      difficulty: routine.difficulty,
      scheduleLabel: formatScheduleDays(routine.scheduleWeekdays),
      exerciseCount: firstDayWorkout?.exerciseCount ?? 0,
      durationMinutes: firstDayWorkout?.durationMinutes ?? 0,
      assignedStudentNames,
    };
  });

  return {
    routines,
    activeRoutinesCount: routines.filter((routine) => routine.assignedStudentNames.length > 0)
      .length,
  };
}

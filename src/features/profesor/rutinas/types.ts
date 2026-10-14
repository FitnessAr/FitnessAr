export type RoutineCard = {
  name: string;
  difficulty: string;
  scheduleLabel: string;
  exerciseCount: number;
  durationMinutes: number;
  assignedClientNames: string[];
};

export type RutinasData = {
  routines: RoutineCard[];
  activeRoutinesCount: number;
};

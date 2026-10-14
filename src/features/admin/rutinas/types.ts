export type AdminRoutineRow = {
  id: string;
  name: string;
  difficulty: string;
  // "Sin profesor asignado" si profesorId es null (profesor borrado o nunca asignado).
  profesorName: string;
  dayCount: number;
  exerciseCount: number;
  isActive: boolean;
};

export type AdminRutinasData = {
  routines: AdminRoutineRow[];
  totalCount: number;
};

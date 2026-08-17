import type { Student } from "../roster";

export type ProfesorHomeData = {
  professorName: string;
  totalStudents: number;
  totalRoutines: number;
  activeToday: Student[];
};

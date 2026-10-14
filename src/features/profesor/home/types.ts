import type { Client } from "../roster";

export type ProfesorHomeData = {
  professorName: string;
  totalClients: number;
  totalRoutines: number;
  activeToday: Client[];
};

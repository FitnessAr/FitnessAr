import { getActiveRoutine } from "../active-routine";
import { WEEKDAY_NAMES_ES } from "../weekday-names";
import type { Cliente, User } from "@/generated/prisma/client";
import type { ClientePerfilData } from "./types";

function formatMemberSince(date: Date): string {
  const month = new Intl.DateTimeFormat("es-AR", { month: "long" }).format(date);
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${date.getFullYear()}`;
}

// Primer día (hoy inclusive, cíclico) dentro de scheduleWeekdays.
function getNextTrainingWeekday(scheduleWeekdays: number[], today: Date): number {
  for (let offset = 0; offset < 7; offset++) {
    const weekday = (today.getDay() + offset) % 7;
    if (scheduleWeekdays.includes(weekday)) {
      return weekday;
    }
  }
  return today.getDay();
}

export async function getClientePerfilData(user: User, cliente: Cliente): Promise<ClientePerfilData> {
  const routine = await getActiveRoutine(cliente);

  if (!routine) {
    return { hasProfessor: false, clientName: user.name };
  }

  const nextWeekday = getNextTrainingWeekday(routine.scheduleWeekdays, new Date());

  return {
    hasProfessor: true,
    clientName: user.name,
    assignedBy: routine.assignedBy,
    routineName: routine.name,
    memberSinceLabel: formatMemberSince(routine.memberSince),
    nextTrainingDayLabel: WEEKDAY_NAMES_ES[nextWeekday],
  };
}

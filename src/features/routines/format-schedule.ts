// Etiquetas cortas lunes a domingo, mismo orden que features/cliente/week.ts.
const DAY_LABELS_MON_FIRST = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// Convención Date.getDay() (0 = domingo ... 6 = sábado) → índice lunes-primero (0 = lunes).
function toMondayFirstIndex(weekday: number): number {
  return (weekday + 6) % 7;
}

/** `[1, 3, 5]` (convención Date.getDay()) → "Lun · Mié · Vie". */
export function formatScheduleDays(scheduleWeekdays: number[]): string {
  return [...scheduleWeekdays]
    .sort((a, b) => toMondayFirstIndex(a) - toMondayFirstIndex(b))
    .map((weekday) => DAY_LABELS_MON_FIRST[toMondayFirstIndex(weekday)])
    .join(" · ");
}

/** El primer día programado de la semana (lunes primero), ej. `[5, 1, 3]` → `1` (lunes). */
export function getFirstScheduledWeekday(scheduleWeekdays: number[]): number {
  return [...scheduleWeekdays].sort(
    (a, b) => toMondayFirstIndex(a) - toMondayFirstIndex(b)
  )[0];
}

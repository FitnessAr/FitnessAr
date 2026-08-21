export type WeekDay = {
  date: Date;
  label: string;
  isToday: boolean;
  hasWorkout: boolean;
};

const DAY_LABELS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Arma los 7 días (lunes a domingo) de la semana que contiene `referenceDate`.
 * `scheduleWeekdays` usa la convención de `Date.getDay()` (0 = domingo ... 6 = sábado).
 */
export function getCurrentWeekDays(
  scheduleWeekdays: number[],
  referenceDate: Date = new Date()
): WeekDay[] {
  const today = startOfDay(referenceDate);
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);

  return DAY_LABELS.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    return {
      date,
      label,
      isToday: isSameDay(date, today),
      hasWorkout: scheduleWeekdays.includes(date.getDay()),
    };
  });
}

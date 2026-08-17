function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/**
 * "Hoy, HH:MM" si `date` es hoy, "Ayer, HH:MM" si fue ayer, o "Hace N días" (sin hora) si es
 * más viejo que eso.
 */
export function formatLastActivity(date: Date, referenceDate: Date = new Date()): string {
  const dayDiff = Math.round(
    (startOfDay(referenceDate).getTime() - startOfDay(date).getTime()) / 86_400_000
  );

  if (dayDiff <= 1) {
    const time = new Intl.DateTimeFormat("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);

    return dayDiff === 1 ? `Ayer, ${time}` : `Hoy, ${time}`;
  }

  return `Hace ${dayDiff} días`;
}

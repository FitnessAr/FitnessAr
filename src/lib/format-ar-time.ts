export const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires";

// A diferencia de los Intl.DateTimeFormat("es-AR", ...) existentes en el repo, este fija el huso
// horario explícitamente: no depende de que el servidor corra en Argentina (ej. Vercel corre en
// UTC). Es una foto de la hora al momento de llamarla, no un reloj en vivo.
export function formatArgentinaTime(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: ARGENTINA_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

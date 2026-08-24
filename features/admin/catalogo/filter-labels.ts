// Utilidades de etiquetas para los valores crudos del catálogo global.
// La API ya devuelve los valores en español (piernas, pectorales, mancuerna...);
// acá solo se capitalizan para mostrar y se define la jerarquía categoría → músculo objetivo.

export function formatLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// Jerarquía categoría → músculos objetivo válidos, verificada contra la API viva.
// Si una categoría no está acá, el select muestra todas las opciones.
export const CATEGORY_TARGETS: Record<string, string[]> = {
  brazos: ["bíceps", "tríceps"],
  antebrazos: ["antebrazos"],
  piernas: ["glúteos", "cuádriceps", "isquiotibiales", "aductores", "abductores"],
  pantorrillas: ["pantorrillas"],
  espalda: ["espalda alta", "dorsales", "columna", "trapecios"],
  pecho: ["pectorales", "serrato anterior"],
  cintura: ["abdominales"],
  hombros: ["deltoides"],
  cardio: ["sistema cardiovascular"],
  cuello: ["elevador de la escápula"],
};

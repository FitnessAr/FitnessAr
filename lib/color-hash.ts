// Asigna una clase de color de forma determinística según el texto, sobre una paleta chica dada.
// Así cualquier valor nuevo (grupo muscular, nombre de alumno, etc.) ya tiene un color consistente
// sin mantener un mapa manual.
export function getHashColorClassName(value: string, palette: string[]): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length];
}

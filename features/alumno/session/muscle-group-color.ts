// Paleta categórica (no de marca) para los tags de grupo muscular. Se asigna por hash del texto
// para que cualquier grupo muscular nuevo que cargue un profesor ya tenga un color sin tocar código.
const PALETTE = [
  "bg-violet-500/15 text-violet-300",
  "bg-sky-500/15 text-sky-300",
  "bg-teal-500/15 text-teal-300",
  "bg-amber-500/15 text-amber-300",
  "bg-rose-500/15 text-rose-300",
  "bg-fuchsia-500/15 text-fuchsia-300",
];

export function getMuscleGroupColorClassName(muscleGroup: string): string {
  let hash = 0;
  for (let i = 0; i < muscleGroup.length; i++) {
    hash = (hash * 31 + muscleGroup.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

import { getHashColorClassName } from "@/lib/color-hash";

// Paleta categórica (no de marca) para los tags de grupo muscular.
const PALETTE = [
  "bg-violet-500/15 text-violet-300",
  "bg-sky-500/15 text-sky-300",
  "bg-teal-500/15 text-teal-300",
  "bg-amber-500/15 text-amber-300",
  "bg-rose-500/15 text-rose-300",
  "bg-fuchsia-500/15 text-fuchsia-300",
];

export function getMuscleGroupColorClassName(muscleGroup: string): string {
  return getHashColorClassName(muscleGroup, PALETTE);
}

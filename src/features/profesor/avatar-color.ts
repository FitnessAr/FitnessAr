import { getHashColorClassName } from "@/lib/color-hash";

// Paleta categórica para diferenciar avatares en listas de clientes (no es color de marca).
const PALETTE = [
  "bg-violet-500/20 text-violet-200",
  "bg-sky-500/20 text-sky-200",
  "bg-teal-500/20 text-teal-200",
  "bg-amber-500/20 text-amber-200",
  "bg-rose-500/20 text-rose-200",
  "bg-fuchsia-500/20 text-fuchsia-200",
];

export function getAvatarColorClassName(name: string): string {
  return getHashColorClassName(name, PALETTE);
}

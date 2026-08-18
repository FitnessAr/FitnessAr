import Link from "next/link";
import { Plus } from "lucide-react";
import type { RutinasData } from "./types";
import { RoutineCard } from "./routine-card";

export function RutinasScreen({ data }: { data: RutinasData }) {
  const { routines, activeRoutinesCount } = data;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 pb-28 pt-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Rutinas
        </p>
        <h1 className="text-3xl font-black uppercase leading-tight text-ink">
          {activeRoutinesCount} activas
        </h1>
      </div>

      <div className="flex flex-col gap-3">
        {routines.map((routine) => (
          <RoutineCard key={routine.name} routine={routine} />
        ))}
      </div>

      <Link
        href="/profesor/rutinas/nueva"
        className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-brand text-base font-extrabold uppercase tracking-wide text-brand-foreground transition-opacity active:opacity-80"
      >
        <Plus className="h-5 w-5" />
        Nueva rutina
      </Link>
    </div>
  );
}

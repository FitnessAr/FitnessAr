"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { ToggleSwitch } from "./toggle-switch";
import type { CatalogExercise } from "./types";

// Card del catálogo (vista grilla): gif + nombre + músculo principal + equipo + interruptor.
export function EjercicioCard({
  exercise,
  included,
  onToggle,
}: {
  exercise: CatalogExercise;
  included: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border bg-surface transition-colors ${
        included ? "border-brand/60" : "border-border"
      }`}
    >
      <Link
        href={`/admin/ejercicios/${exercise.id}`}
        aria-label={`Ver detalle de ${exercise.name}`}
        className="relative block aspect-square w-full overflow-hidden bg-surface-elevated"
      >
        {exercise.gifUrl ? (
          <img
            src={exercise.gifUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xs text-ink-muted">
            Sin animación
          </span>
        )}
        {included && (
          <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-brand-foreground">
            <Check className="h-4 w-4" strokeWidth={3} />
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link
          href={`/admin/ejercicios/${exercise.id}`}
          className="line-clamp-2 min-h-[2.4rem] text-sm font-bold leading-tight text-ink"
        >
          {exercise.name}
        </Link>
        <p className="truncate text-xs text-ink-muted">
          {exercise.target ?? exercise.muscleGroup ?? "—"}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
          <span className="truncate rounded-full bg-surface-elevated px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
            {exercise.equipment ?? "sin equipo"}
          </span>
          <ToggleSwitch
            checked={included}
            onChange={onToggle}
            ariaLabel={
              included
                ? `Quitar ${exercise.name} del catálogo`
                : `Incluir ${exercise.name} en el catálogo`
            }
          />
        </div>
      </div>
    </div>
  );
}

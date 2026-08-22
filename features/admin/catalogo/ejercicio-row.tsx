"use client";

import Link from "next/link";
import { ToggleSwitch } from "./toggle-switch";
import type { CatalogExercise } from "./types";

// Fila del catálogo (vista lista): miniatura + nombre + músculo/equipo + interruptor.
export function EjercicioRow({
  exercise,
  included,
  pending,
  onToggle,
}: {
  exercise: CatalogExercise;
  included: boolean;
  pending: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-2.5">
      <Link
        href={`/admin/ejercicios/${exercise.id}`}
        aria-label={`Ver detalle de ${exercise.name}`}
        className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-elevated"
      >
        {exercise.gifUrl ? (
          <img
            src={exercise.gifUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[10px] text-ink-muted">
            —
          </span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={`/admin/ejercicios/${exercise.id}`}
          className="block truncate text-sm font-bold text-ink"
        >
          {exercise.name}
        </Link>
        <p className="truncate text-xs text-ink-muted">
          {exercise.target ?? exercise.muscleGroup ?? "—"}
          {exercise.equipment ? ` · ${exercise.equipment}` : ""}
        </p>
      </div>

      {included && (
        <span className="shrink-0 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-foreground">
          Incluido
        </span>
      )}
      <ToggleSwitch
        checked={included}
        disabled={pending}
        onChange={onToggle}
        ariaLabel={
          included
            ? `Quitar ${exercise.name} del catálogo`
            : `Incluir ${exercise.name} en el catálogo`
        }
      />
    </div>
  );
}

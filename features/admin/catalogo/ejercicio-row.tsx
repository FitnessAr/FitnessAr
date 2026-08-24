"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { ToggleSwitch } from "./toggle-switch";
import { formatLabel } from "./filter-labels";
import type { CatalogExercise } from "./types";

// Fila del catálogo (vista lista): miniatura + nombre + músculo/equipo + interruptor.
// Los ejercicios propios (isCustom) muestran eliminar en vez del interruptor (ver ejercicio-card).
export function EjercicioRow({
  exercise,
  included,
  onToggle,
  onDelete,
}: {
  exercise: CatalogExercise;
  included: boolean;
  onToggle: () => void;
  onDelete?: () => void;
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
          {exercise.target
            ? formatLabel(exercise.target)
            : exercise.muscleGroup
              ? formatLabel(exercise.muscleGroup)
              : "—"}
          {exercise.equipment ? ` · ${formatLabel(exercise.equipment)}` : ""}
        </p>
      </div>

      {included && !exercise.isCustom && (
        <span className="shrink-0 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-foreground">
          Incluido
        </span>
      )}
      {exercise.isCustom && onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Eliminar ${exercise.name}`}
          title="Eliminar ejercicio"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-ink-muted transition-colors hover:text-danger"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : (
        <ToggleSwitch
          checked={included}
          onChange={onToggle}
          ariaLabel={
            included
              ? `Quitar ${exercise.name} del catálogo`
              : `Incluir ${exercise.name} en el catálogo`
          }
        />
      )}
    </div>
  );
}

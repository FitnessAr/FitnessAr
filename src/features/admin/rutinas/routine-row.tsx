"use client";

import { Dumbbell, Trash2 } from "lucide-react";
import { ToggleSwitch } from "@/features/admin/catalogo/toggle-switch";
import type { AdminRoutineRow } from "./types";

export function RoutineRow({
  routine,
  onToggle,
  onDelete,
}: {
  routine: AdminRoutineRow;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-2.5">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface-elevated text-ink-muted">
        <Dumbbell className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-ink">
          {routine.name}
          {!routine.isActive && (
            <span className="ml-1.5 text-xs font-semibold text-ink-muted">· Inactiva</span>
          )}
        </p>
        <p className="truncate text-xs text-ink-muted">
          {routine.profesorName} · {routine.difficulty} · {routine.dayCount} días ·{" "}
          {routine.exerciseCount} ejercicios
        </p>
      </div>

      <div className="flex items-center gap-2">
        <ToggleSwitch
          checked={routine.isActive}
          onChange={onToggle}
          ariaLabel={routine.isActive ? `Desactivar ${routine.name}` : `Activar ${routine.name}`}
        />
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Eliminar ${routine.name}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-ink-muted transition-colors hover:text-danger"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

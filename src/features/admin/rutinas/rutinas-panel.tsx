"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RoutineRow } from "./routine-row";
import { setRoutineActiveAction, deleteRoutineAction } from "./actions";
import type { AdminRoutineRow, AdminRutinasData } from "./types";

export function RutinasPanel({ data }: { data: AdminRutinasData }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function handleToggle(routine: AdminRoutineRow) {
    startTransition(async () => {
      const result = await setRoutineActiveAction(routine.id, !routine.isActive);
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleDelete(routine: AdminRoutineRow) {
    if (
      !window.confirm(
        `¿Eliminar PERMANENTEMENTE la rutina "${routine.name}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await deleteRoutineAction(routine.id);
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-ink-muted">{data.totalCount} rutinas en tu sucursal</p>

      {data.routines.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {data.routines.map((routine) => (
            <RoutineRow
              key={routine.id}
              routine={routine}
              onToggle={() => handleToggle(routine)}
              onDelete={() => handleDelete(routine)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border py-12 text-center">
          <p className="text-sm font-bold text-ink">No hay rutinas creadas en tu sucursal todavía.</p>
        </div>
      )}
    </div>
  );
}

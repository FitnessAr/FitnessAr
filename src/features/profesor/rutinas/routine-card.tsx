import { Clock, Dumbbell } from "lucide-react";
import { getInitials } from "@/lib/get-initials";
import { getAvatarColorClassName } from "../avatar-color";
import type { RoutineCard as RoutineCardData } from "./types";

const MAX_VISIBLE_AVATARS = 3;

export function RoutineCard({ routine }: { routine: RoutineCardData }) {
  const visibleClients = routine.assignedClientNames.slice(0, MAX_VISIBLE_AVATARS);
  const overflowCount = routine.assignedClientNames.length - visibleClients.length;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-extrabold text-ink">{routine.name}</h2>
        <span className="shrink-0 rounded-full bg-brand/15 px-3 py-1 text-xs font-bold text-brand">
          {routine.difficulty}
        </span>
      </div>

      <p className="text-xs text-ink-muted">{routine.scheduleLabel}</p>

      <div className="flex items-center gap-4 text-sm text-ink-muted">
        <span className="flex items-center gap-1.5">
          <Dumbbell className="h-4 w-4" /> {routine.exerciseCount} ejercicios
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" /> {routine.durationMinutes} min
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center -space-x-2">
          {visibleClients.map((name) => (
            <span
              key={name}
              className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface text-[10px] font-bold ${getAvatarColorClassName(
                name
              )}`}
            >
              {getInitials(name)}
            </span>
          ))}
          {overflowCount > 0 && (
            <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-surface-elevated text-[10px] font-bold text-ink-muted">
              +{overflowCount}
            </span>
          )}
        </div>
        <p className="text-xs text-ink-muted">
          {routine.assignedClientNames.length} clientes asignados
        </p>
      </div>
    </div>
  );
}

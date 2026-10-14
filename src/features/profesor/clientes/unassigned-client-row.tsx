import { UserPlus } from "lucide-react";
import { getInitials } from "@/lib/get-initials";
import { getAvatarColorClassName } from "../avatar-color";
import type { UnassignedClient } from "./get-unassigned-clients";

export function UnassignedClientRow({
  client,
  onClaim,
  disabled,
}: {
  client: UnassignedClient;
  onClaim: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-4 py-3">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${getAvatarColorClassName(
          client.name
        )}`}
      >
        {getInitials(client.name)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-ink">{client.name}</p>
        <p className="truncate text-xs text-ink-muted">DNI {client.loginId ?? "—"}</p>
      </div>

      <button
        type="button"
        onClick={onClaim}
        disabled={disabled}
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-brand-foreground transition-opacity disabled:opacity-40"
      >
        <UserPlus className="h-3.5 w-3.5" />
        Agregar
      </button>
    </div>
  );
}

import { Activity } from "lucide-react";
import { getInitials } from "@/lib/get-initials";
import type { Client } from "../roster";
import { getAvatarColorClassName } from "../avatar-color";
import { formatLastActivity } from "../format-last-activity";

export function ActiveClientRow({ client }: { client: Client }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${getAvatarColorClassName(
          client.name
        )}`}
      >
        {getInitials(client.name)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-ink">{client.name}</p>
        <p className="truncate text-xs text-ink-muted">{client.routineName}</p>
      </div>

      <div className="shrink-0 text-right">
        <span className="flex items-center justify-end gap-1 text-sm font-bold text-brand">
          <Activity className="h-3.5 w-3.5" />
          {client.setsCompletedToday}
        </span>
        <span className="text-xs text-ink-muted">
          {formatLastActivity(client.lastActivityAt)}
        </span>
      </div>
    </div>
  );
}

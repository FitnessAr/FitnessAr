import { Flame } from "lucide-react";
import { getInitials } from "@/lib/get-initials";
import type { Student } from "../roster";
import { getAvatarColorClassName } from "../avatar-color";
import { formatLastActivity } from "../format-last-activity";

export function StudentRow({ student }: { student: Student }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${getAvatarColorClassName(
          student.name
        )}`}
      >
        {getInitials(student.name)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-ink">{student.name}</p>
        <p className="truncate text-xs text-ink-muted">{student.routineName}</p>
      </div>

      <div className="shrink-0 text-right">
        <span className="flex items-center justify-end gap-1 text-sm font-bold text-brand">
          <Flame className="h-3.5 w-3.5" />
          {student.streakDays}d
        </span>
        <span className="text-xs text-ink-muted">
          {formatLastActivity(student.lastActivityAt)}
        </span>
      </div>
    </div>
  );
}

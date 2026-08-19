import { Check } from "lucide-react";
import { getInitials } from "@/lib/get-initials";
import { getAvatarColorClassName } from "../../avatar-color";
import type { Student } from "../../roster";

export function AssignStudentRow({
  student,
  selected,
  onToggle,
}: {
  student: Student;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
        selected ? "border-brand/40 bg-brand/5" : "border-border bg-surface"
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${getAvatarColorClassName(
          student.name
        )}`}
      >
        {getInitials(student.name)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-ink">{student.name}</p>
        <p className="truncate text-xs text-ink-muted">
          {student.routineName ?? "Sin rutina asignada"}
        </p>
      </div>

      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
          selected ? "bg-brand" : "border border-border"
        }`}
      >
        {selected && <Check className="h-4 w-4 text-brand-foreground" />}
      </span>
    </button>
  );
}

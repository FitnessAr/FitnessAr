import { Check } from "lucide-react";
import type { WeekDay } from "../week";

export function WeeklyActivityRow({ days }: { days: (WeekDay & { completed: boolean })[] }) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => (
        <div key={day.date.toISOString()} className="flex flex-col items-center gap-2">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              day.completed ? "bg-brand text-brand-foreground" : "bg-surface-elevated"
            }`}
          >
            {day.completed && <Check className="h-5 w-5" />}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
            {day.label}
          </span>
        </div>
      ))}
    </div>
  );
}

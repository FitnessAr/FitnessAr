import type { WeekDay } from "./types";

export function WeekCalendar({ week }: { week: WeekDay[] }) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {week.map((day) => (
        <div
          key={day.date.toISOString()}
          className="flex flex-col items-center gap-1.5"
        >
          <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
            {day.label}
          </span>
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              day.isToday ? "bg-brand" : "bg-surface"
            }`}
          >
            {day.isToday ? (
              <span className="h-2 w-2 rounded-full bg-brand-foreground" />
            ) : day.hasWorkout ? (
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            ) : null}
          </span>
        </div>
      ))}
    </div>
  );
}

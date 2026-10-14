import type { PersonalRecord } from "./types";

export function RecordsList({ records }: { records: PersonalRecord[] }) {
  if (records.length === 0) {
    return (
      <p className="text-sm text-ink-muted">Todavía no hay entrenamientos registrados.</p>
    );
  }

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface px-4">
      {records.map((record, index) => (
        <div
          key={record.exerciseName}
          className={`flex items-center justify-between py-3 ${
            index < records.length - 1 ? "border-b border-border" : ""
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-ink">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
            {record.exerciseName}
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <span className="text-sm font-bold text-ink">{record.weightKg} kg</span>
            {record.deltaKg !== null && (
              <span className="rounded-full bg-brand/15 px-2 py-0.5 text-xs font-bold text-brand">
                +{record.deltaKg} kg
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

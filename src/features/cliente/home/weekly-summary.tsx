import { CheckCircle2, Clock, Flame } from "lucide-react";
import type { WeeklySummary as WeeklySummaryData } from "./types";

export function WeeklySummary({ summary }: { summary: WeeklySummaryData }) {
  const tiles = [
    {
      key: "sessions",
      icon: CheckCircle2,
      value: `${summary.sessionsCompleted}/${summary.sessionsTotal}`,
      label: "Sesiones",
      colorClassName: "text-brand",
    },
    {
      key: "minutes",
      icon: Clock,
      value: `${summary.minutes}`,
      label: "Minutos",
      colorClassName: "text-info",
    },
    {
      key: "streak",
      icon: Flame,
      value: `${summary.streakDays} días`,
      label: "Racha",
      colorClassName: "text-flame",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {tiles.map((tile) => (
        <div
          key={tile.key}
          className="flex flex-col items-center gap-0 rounded-2xl border border-border bg-surface px-2 py-2 text-center"
        >
          <tile.icon className={`h-5 w-5 ${tile.colorClassName}`} />
          <span className="text-xl font-black text-ink">{tile.value}</span>
          <span className="text-xs text-ink-muted">{tile.label}</span>
        </div>
      ))}
    </div>
  );
}

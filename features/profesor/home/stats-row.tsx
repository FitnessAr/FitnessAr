import { Activity, ClipboardList, Users } from "lucide-react";

export function StatsRow({
  totalStudents,
  totalRoutines,
  activeTodayCount,
}: {
  totalStudents: number;
  totalRoutines: number;
  activeTodayCount: number;
}) {
  const tiles = [
    {
      key: "students",
      icon: Users,
      value: totalStudents,
      label: "Alumnos",
      colorClassName: "text-ink-muted",
    },
    {
      key: "routines",
      icon: ClipboardList,
      value: totalRoutines,
      label: "Rutinas",
      colorClassName: "text-ink-muted",
    },
    {
      key: "active",
      icon: Activity,
      value: activeTodayCount,
      label: "Activos hoy",
      colorClassName: "text-brand",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {tiles.map((tile) => (
        <div
          key={tile.key}
          className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-surface px-2 py-4 text-center"
        >
          <tile.icon className="h-5 w-5 text-ink-muted" />
          <span className={`text-xl font-black ${tile.colorClassName}`}>{tile.value}</span>
          <span className="text-xs text-ink-muted">{tile.label}</span>
        </div>
      ))}
    </div>
  );
}

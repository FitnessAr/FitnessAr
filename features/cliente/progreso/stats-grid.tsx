import { Activity, Clock, Dumbbell, Flame } from "lucide-react";
import type { ProgresoData } from "./types";

type TodayExercises = Extract<ProgresoData, { hasProfessor: true }>["todayExercises"];

export function StatsGrid({
  trainingsThisMonth,
  currentStreak,
  totalMinutesThisMonth,
  todayExercises,
}: {
  trainingsThisMonth: number;
  currentStreak: number;
  totalMinutesThisMonth: number;
  todayExercises: TodayExercises;
}) {
  const tiles = [
    {
      key: "trainings",
      icon: Dumbbell,
      iconClassName: "bg-brand/15 text-brand",
      value: trainingsThisMonth,
      label: "Entrenamientos",
      sublabel: "este mes",
    },
    {
      key: "streak",
      icon: Flame,
      iconClassName: "bg-flame/15 text-flame",
      value: currentStreak,
      label: "Racha actual",
      sublabel: "días seguidos",
    },
    {
      key: "minutes",
      icon: Clock,
      iconClassName: "bg-info/15 text-info",
      value: totalMinutesThisMonth,
      label: "Tiempo total",
      sublabel: "minutos este mes",
    },
    {
      key: "today",
      icon: Activity,
      iconClassName: "bg-surface-elevated text-ink-muted",
      value: todayExercises.hasWorkout
        ? `${todayExercises.completed}/${todayExercises.total}`
        : "—",
      label: "Ejercicios hoy",
      sublabel: todayExercises.hasWorkout ? "completados" : "día de descanso",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {tiles.map((tile) => (
        <div
          key={tile.key}
          className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4"
        >
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${tile.iconClassName}`}
          >
            <tile.icon className="h-4 w-4" />
          </span>
          <div>
            <p className="text-2xl font-black text-ink">{tile.value}</p>
            <p className="text-sm font-semibold text-ink">{tile.label}</p>
            <p className="text-xs text-ink-muted">{tile.sublabel}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

import { ClipboardList, Dumbbell, ShieldCheck, Users, UserCheck } from "lucide-react";
import { getInitials } from "@/lib/get-initials";
import type { DashboardData } from "./get-dashboard-data";

export function HomeScreen({
  adminName,
  data,
}: {
  adminName: string;
  data: DashboardData;
}) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 pt-8 lg:max-w-2xl">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm text-ink-muted">Hola, {adminName}</p>
          <div className="mt-1 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-brand" />
            <h1 className="text-2xl font-black uppercase leading-tight text-ink">
              Panel de administración
            </h1>
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            Gestioná usuarios y ejercicios de la aplicación.
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-sm font-bold text-brand">
          {getInitials(adminName)}
        </span>
      </header>

      {/* Hero card — Clientes */}
      <div className="flex items-center gap-5 rounded-2xl border border-border bg-surface px-6 py-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand/15">
          <Users className="h-7 w-7 text-brand" />
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-black text-ink">{data.clientes}</span>
          <span className="text-sm text-ink-muted">Clientes</span>
        </div>
      </div>

      {/* Secondary cards — Profesores, Ejercicios, Rutinas */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: UserCheck,
            value: data.profesores,
            label: "Profesores",
          },
          {
            icon: Dumbbell,
            value: data.ejercicios,
            label: "Ejercicios",
          },
          {
            icon: ClipboardList,
            value: data.rutinas,
            label: "Rutinas",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-surface px-2 py-4 text-center"
          >
            <card.icon className="h-5 w-5 text-ink-muted" />
            <span className="text-xl font-black text-ink">{card.value}</span>
            <span className="text-xs text-ink-muted">{card.label}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

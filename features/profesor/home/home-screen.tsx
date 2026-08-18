import Link from "next/link";
import { Plus, UserPlus } from "lucide-react";
import { getInitials } from "@/lib/get-initials";
import type { ProfesorHomeData } from "./types";
import { StatsRow } from "./stats-row";
import { ActiveStudentRow } from "./active-student-row";

export function HomeScreen({ data }: { data: ProfesorHomeData }) {
  const { professorName, totalStudents, totalRoutines, activeToday } = data;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-8 px-6 pb-28 pt-8">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm text-ink-muted">Bienvenido,</p>
          <p className="text-3xl font-black text-ink">{professorName}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-sm font-bold text-brand">
          {getInitials(professorName)}
        </span>
      </header>

      <StatsRow
        totalStudents={totalStudents}
        totalRoutines={totalRoutines}
        activeTodayCount={activeToday.length}
      />

      <section className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Activos hoy
        </p>
        <div className="flex flex-col gap-2">
          {activeToday.map((student) => (
            <ActiveStudentRow key={student.name} student={student} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Acciones rápidas
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/profesor/rutinas/nueva"
            className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-brand text-sm font-extrabold uppercase tracking-wide text-brand-foreground transition-opacity active:opacity-80"
          >
            <Plus className="h-4 w-4" />
            Nueva rutina
          </Link>
          <Link
            href="/profesor/alumnos"
            className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-border bg-surface text-sm font-extrabold uppercase tracking-wide text-ink"
          >
            <UserPlus className="h-4 w-4" />
            Nuevo alumno
          </Link>
        </div>
      </section>
    </div>
  );
}

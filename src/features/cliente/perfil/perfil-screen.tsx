import { getInitials } from "@/lib/get-initials";
import { LogoutLink } from "@/features/auth/logout-link";
import { NoProfessorMessage } from "../no-professor-message";
import type { ClientePerfilData } from "./types";

export function PerfilScreen({ data }: { data: ClientePerfilData }) {
  if (!data.hasProfessor) {
    return <NoProfessorMessage label="Perfil" />;
  }

  const { clientName, assignedBy, routineName, memberSinceLabel, nextTrainingDayLabel } = data;

  const details = [
    { label: "Profesor asignado", value: assignedBy },
    { label: "Rutina activa", value: routineName },
    { label: "Miembro desde", value: memberSinceLabel },
    { label: "Próximo entrenamiento", value: nextTrainingDayLabel },
  ];

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 pb-28 pt-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-2xl font-black text-brand">
          {getInitials(clientName)}
        </span>
        <p className="text-xl font-black text-ink">{clientName}</p>
      </div>

      <div className="flex flex-col rounded-2xl border border-border bg-surface px-4">
        {details.map((detail, index) => (
          <div
            key={detail.label}
            className={`flex items-center justify-between py-4 ${
              index < details.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <span className="text-sm text-ink-muted">{detail.label}</span>
            <span className="text-sm font-semibold text-ink">{detail.value}</span>
          </div>
        ))}
      </div>

      <LogoutLink className="flex min-h-14 items-center justify-center rounded-2xl border border-danger/40 text-sm font-extrabold uppercase tracking-wide text-danger transition-opacity active:opacity-80">
        Cerrar sesión
      </LogoutLink>
    </div>
  );
}

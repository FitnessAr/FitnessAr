import { LogoutLink } from "@/features/auth/logout-link";
import type { UsuarioTabData } from "./types";

export function UsuarioPanel({ data }: { data: UsuarioTabData }) {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Mi cuenta
        </p>
        <p className="mt-1 text-lg font-extrabold text-ink">{data.admin.name}</p>
        <p className="text-xs text-ink-muted">DNI {data.admin.loginId} · Administrador</p>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Profesores activos · {data.horaActualAR} (ARG)
        </p>
        {data.profesoresActivos.length > 0 ? (
          <div className="mt-2 flex flex-col gap-2">
            {data.profesoresActivos.map((profesor) => (
              <div key={profesor.id} className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-bold text-ink">{profesor.name}</p>
                <p className="shrink-0 text-xs text-ink-muted">
                  {profesor.schedule ?? "Sin horario"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-ink-muted">No hay profesores activos en tu sucursal.</p>
        )}
      </section>

      <LogoutLink className="text-sm font-semibold text-brand">Cerrar sesión</LogoutLink>
    </div>
  );
}

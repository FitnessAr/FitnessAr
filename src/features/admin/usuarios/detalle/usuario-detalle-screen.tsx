import { getInitials } from "@/lib/get-initials";
import { getAvatarColorClassName } from "@/features/profesor/avatar-color";
import type { AdminUserRow } from "../types";

const ROLE_LABELS: Record<AdminUserRow["role"], string> = {
  ADMIN: "Administrador",
  PROFESOR: "Profesor",
  CLIENTE: "Cliente",
};

export function UsuarioDetalleScreen({
  user,
  isSelf,
}: {
  user: AdminUserRow;
  isSelf: boolean;
}) {
  const datos = [
    { label: "DNI", value: user.loginId ?? "—" },
    { label: "Rol", value: ROLE_LABELS[user.role] },
    {
      label: "Estado",
      value: user.isActive ? "Activo" : "Inactivo",
      className: user.isActive ? "text-brand" : "text-danger",
    },
  ];

  return (
    <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start lg:gap-x-10">
      <div className="flex flex-col gap-5 lg:sticky lg:top-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-elevated">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URLs
            <img
              src={user.image}
              alt={user.name}
              loading="lazy"
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div
              className={`flex aspect-square w-full items-center justify-center text-4xl font-bold ${getAvatarColorClassName(
                user.name
              )}`}
            >
              {getInitials(user.name)}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 text-center lg:items-start lg:text-left">
          <h1 className="text-xl font-black uppercase leading-tight text-ink lg:text-2xl">
            {user.name}
            {isSelf && (
              <span className="ml-2 text-sm font-semibold text-ink-muted">(Vos)</span>
            )}
          </h1>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
              user.role === "ADMIN"
                ? "bg-brand/15 text-brand"
                : "bg-surface-elevated text-ink-muted"
            }`}
          >
            {ROLE_LABELS[user.role]}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col rounded-2xl border border-border bg-surface px-4">
          {datos.map((row, index) => (
            <div
              key={row.label}
              className={`flex items-center justify-between py-3.5 ${
                index < datos.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="text-sm text-ink-muted">{row.label}</span>
              <span
                className={`text-sm font-semibold ${row.className ?? "text-ink"}`}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {user.bio && (
          <section className="flex flex-col gap-2.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
              Descripción
            </p>
            <p className="text-sm leading-relaxed text-ink">{user.bio}</p>
          </section>
        )}
      </div>
    </div>
  );
}

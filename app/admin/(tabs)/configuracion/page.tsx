import { requireAdmin } from "@/features/admin/require-admin";
import { LogoutLink } from "@/features/auth/logout-link";

export default async function ConfiguracionPage() {
  await requireAdmin();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 pb-24 text-center">
      <h1 className="text-2xl font-extrabold uppercase tracking-tight text-ink">
        Configuración
      </h1>
      <p className="text-sm text-ink-muted">Próximamente.</p>
      <LogoutLink className="text-sm font-semibold text-brand">
        Cerrar sesión
      </LogoutLink>
    </div>
  );
}

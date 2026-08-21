import { requireAdmin } from "@/features/admin/require-admin";

export default async function EjerciciosPage() {
  await requireAdmin();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-2 px-6 pb-24 text-center">
      <h1 className="text-2xl font-extrabold uppercase tracking-tight text-ink">
        Ejercicios
      </h1>
      <p className="text-sm text-ink-muted">Próximamente.</p>
    </div>
  );
}

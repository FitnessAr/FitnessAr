import Link from "next/link";

export default function PerfilPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 pb-24 text-center">
      <h1 className="text-2xl font-extrabold uppercase tracking-tight text-ink">
        Perfil
      </h1>
      <p className="text-sm text-ink-muted">Próximamente.</p>
      <Link href="/" className="text-sm font-semibold text-brand">
        Cerrar sesión
      </Link>
    </div>
  );
}

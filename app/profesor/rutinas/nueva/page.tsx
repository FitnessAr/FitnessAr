import Link from "next/link";

export default function NuevaRutinaPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <h1 className="text-2xl font-extrabold uppercase tracking-tight text-ink">
        Nueva rutina
      </h1>
      <p className="text-sm text-ink-muted">Próximamente.</p>
      <Link href="/profesor/rutinas" className="text-sm font-semibold text-brand">
        Volver a rutinas
      </Link>
    </div>
  );
}

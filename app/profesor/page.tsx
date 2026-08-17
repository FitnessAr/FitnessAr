import Link from "next/link";

export default function ProfesorPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <h1 className="text-2xl font-extrabold uppercase tracking-tight text-ink">
        Panel del profesor
      </h1>
      <p className="text-sm text-ink-muted">
        Acá va a vivir la búsqueda de alumnos y la asignación de rutinas — próximamente.
      </p>
      <Link href="/" className="text-sm font-semibold text-brand">
        Cerrar sesión
      </Link>
    </div>
  );
}

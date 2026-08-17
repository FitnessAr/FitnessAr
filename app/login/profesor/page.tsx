import Link from "next/link";

export default function LoginProfesorPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <h1 className="text-2xl font-extrabold uppercase tracking-tight text-ink">
        Login Profesor
      </h1>
      <p className="text-sm text-ink-muted">
        Ingreso con email y contraseña — próximamente.
      </p>
      <Link href="/" className="text-sm font-semibold text-brand">
        Volver
      </Link>
    </div>
  );
}

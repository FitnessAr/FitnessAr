import Link from "next/link";
import { ShieldCheck, Dumbbell, Users } from "lucide-react";
import { getInitials } from "@/lib/get-initials";

export function HomeScreen({ adminName }: { adminName: string }) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-8 px-6 pb-28 pt-8">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm text-ink-muted">Hola, {adminName}</p>
          <div className="mt-1 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-brand" />
            <h1 className="text-2xl font-black uppercase leading-tight text-ink">
              Panel de administración
            </h1>
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            Gestioná usuarios y ejercicios de la aplicación.
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-sm font-bold text-brand">
          {getInitials(adminName)}
        </span>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/admin/usuarios"
          className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-6 text-center"
        >
          <Users className="h-6 w-6 text-brand" />
          <span className="text-sm font-extrabold uppercase tracking-wide text-ink">
            Usuarios
          </span>
        </Link>
        <Link
          href="/admin/ejercicios"
          className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-6 text-center"
        >
          <Dumbbell className="h-6 w-6 text-brand" />
          <span className="text-sm font-extrabold uppercase tracking-wide text-ink">
            Ejercicios
          </span>
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";

// Mensaje compacto reutilizado por cualquier pestaña del alumno que no tenga nada que mostrar sin
// profesor asignado (Rutina, Progreso) — la pantalla completa con los pasos a seguir vive en Home
// (features/alumno/home/no-professor-assigned.tsx).
export function NoProfessorMessage({ label }: { label: string }) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-2 px-6 pb-28 pt-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">{label}</p>
      <h1 className="text-2xl font-black uppercase leading-tight text-ink">
        Todavía no tenés un profesor asignado.
      </h1>
      <Link href="/alumno" className="mt-2 text-sm font-semibold text-brand">
        Volver a Inicio
      </Link>
    </div>
  );
}

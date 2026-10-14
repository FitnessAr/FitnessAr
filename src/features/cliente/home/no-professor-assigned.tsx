import { ClipboardList } from "lucide-react";

export function NoProfessorAssigned() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <span className="flex h-24 w-24 items-center justify-center rounded-full bg-brand/10 text-brand">
        <ClipboardList className="h-10 w-10" />
      </span>

      <div>
        <p className="text-xl font-black text-ink">Aún no tenés</p>
        <p className="text-xl font-black text-brand">entrenamientos asignados</p>
        <p className="mt-3 text-sm text-ink-muted">
          Un profesor de tu gimnasio tiene que asignarte antes de que puedas ver tus
          entrenamientos acá.
        </p>
      </div>

      <div className="w-full rounded-2xl border border-border bg-surface p-4 text-left">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand">
          ¿Qué tenés que hacer?
        </p>
        <p className="text-sm text-ink-muted">
          Si ya hablaste con un profesor, pedile que te busque por tu DNI desde su panel — en
          cuanto te agregue, tus entrenamientos van a aparecer acá automáticamente.
        </p>
      </div>
    </div>
  );
}

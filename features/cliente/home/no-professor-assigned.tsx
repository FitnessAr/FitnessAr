import { ClipboardList, UserPlus } from "lucide-react";

const STEPS = [
  {
    title: "Unite a un profesor",
    description: "Buscá tu profesor o pedile el código para unirte.",
  },
  {
    title: "Esperá la aprobación",
    description: "El profesor revisará tu solicitud y te asignará rutinas.",
  },
  {
    title: "Comenzá a entrenar",
    description: "Una vez asignado, vas a poder ver tus entrenamientos aquí.",
  },
];

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
          Para comenzar a entrenar, necesitás estar asignado a un profesor del gimnasio.
        </p>
      </div>

      <div className="w-full rounded-2xl border border-border bg-surface p-4 text-left">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-brand">
          ¿Qué tenés que hacer?
        </p>
        <div className="flex flex-col gap-4">
          {STEPS.map((step, index) => (
            <div key={step.title} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-extrabold text-brand-foreground">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-bold text-ink">{step.title}</p>
                <p className="text-xs text-ink-muted">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled
        className="flex min-h-14 w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-brand text-sm font-extrabold uppercase tracking-wide text-brand-foreground opacity-50"
      >
        <UserPlus className="h-4 w-4" />
        Unirme a un profesor
      </button>
    </div>
  );
}

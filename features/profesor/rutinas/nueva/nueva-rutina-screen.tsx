"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import type { Client } from "../../roster";
import { AssignClientRow } from "./assign-client-row";

// Convención Date.getDay() (0 = domingo ... 6 = sábado), orden lunes-primero para mostrar.
const WEEKDAYS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
  { value: 0, label: "Dom" },
];

export function NuevaRutinaScreen({ roster }: { roster: Client[] }) {
  const [name, setName] = useState("");
  const [selectedWeekdays, setSelectedWeekdays] = useState<Set<number>>(new Set());
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());

  function toggleWeekday(value: number) {
    setSelectedWeekdays((current) => {
      const next = new Set(current);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }

  function toggleClient(clientName: string) {
    setSelectedClients((current) => {
      const next = new Set(current);
      if (next.has(clientName)) {
        next.delete(clientName);
      } else {
        next.add(clientName);
      }
      return next;
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-8 px-6 pb-28 pt-8">
      <div className="flex items-start justify-between gap-3">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nombre de la rutina"
          className="min-w-0 flex-1 bg-transparent text-2xl font-black uppercase leading-tight text-ink placeholder:text-ink-muted focus:outline-none"
        />
        <Link
          href="/profesor/rutinas"
          aria-label="Cerrar"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-ink-muted"
        >
          <X className="h-4 w-4" />
        </Link>
      </div>

      <section className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Días de entrenamiento
        </p>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((day) => {
            const isSelected = selectedWeekdays.has(day.value);
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleWeekday(day.value)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                  isSelected
                    ? "bg-brand text-brand-foreground"
                    : "bg-surface-elevated text-ink-muted"
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Ejercicios (0)
        </p>
        <p className="text-sm text-ink-muted">Todavía no agregaste ejercicios.</p>
        <button
          type="button"
          disabled
          className="flex min-h-14 cursor-not-allowed items-center justify-center gap-2 rounded-2xl border border-border text-sm font-extrabold uppercase tracking-wide text-ink-muted opacity-50"
        >
          <Plus className="h-4 w-4" />
          Agregar ejercicio
        </button>
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Asignar clientes
        </p>
        <div className="flex flex-col gap-2">
          {roster.map((client) => (
            <AssignClientRow
              key={client.name}
              client={client}
              selected={selectedClients.has(client.name)}
              onToggle={() => toggleClient(client.name)}
            />
          ))}
        </div>
      </section>

      <Link
        href="/profesor/rutinas"
        className="flex min-h-14 items-center justify-center rounded-2xl bg-brand text-base font-extrabold uppercase tracking-wide text-brand-foreground transition-opacity active:opacity-80"
      >
        Guardar rutina
      </Link>
    </div>
  );
}

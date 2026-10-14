"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import type { Client } from "../../roster";
import type { BranchExercise } from "@/features/routines/get-branch-exercises";
import { AssignClientRow } from "./assign-client-row";
import { createRoutineAction } from "./actions";
import type { RoutineExerciseDraft } from "./types";

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

const DIFFICULTY_OPTIONS = [
  { value: "PRINCIPIANTE", label: "Principiante" },
  { value: "INTERMEDIO", label: "Intermedio" },
  { value: "AVANZADO", label: "Avanzado" },
] as const;

export function NuevaRutinaScreen({
  roster,
  branchExercises,
}: {
  roster: Client[];
  branchExercises: BranchExercise[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] =
    useState<(typeof DIFFICULTY_OPTIONS)[number]["value"]>("INTERMEDIO");
  const [selectedWeekdays, setSelectedWeekdays] = useState<Set<number>>(new Set());
  const [exercisesByDay, setExercisesByDay] = useState<Record<number, RoutineExerciseDraft[]>>({});
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

  function toggleClient(clientId: string) {
    setSelectedClients((current) => {
      const next = new Set(current);
      if (next.has(clientId)) {
        next.delete(clientId);
      } else {
        next.add(clientId);
      }
      return next;
    });
  }

  function addExercise(weekday: number, exercise: BranchExercise) {
    setExercisesByDay((current) => {
      const existing = current[weekday] ?? [];
      if (existing.some((entry) => entry.exerciseId === exercise.id)) {
        return current;
      }
      return {
        ...current,
        [weekday]: [
          ...existing,
          {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            sets: 3,
            reps: 10,
            unit: "REPS",
            restSeconds: 60,
          },
        ],
      };
    });
  }

  function removeExercise(weekday: number, exerciseId: string) {
    setExercisesByDay((current) => ({
      ...current,
      [weekday]: (current[weekday] ?? []).filter((entry) => entry.exerciseId !== exerciseId),
    }));
  }

  function updateExercise(
    weekday: number,
    exerciseId: string,
    patch: Partial<RoutineExerciseDraft>
  ) {
    setExercisesByDay((current) => ({
      ...current,
      [weekday]: (current[weekday] ?? []).map((entry) =>
        entry.exerciseId === exerciseId ? { ...entry, ...patch } : entry
      ),
    }));
  }

  function handleSave() {
    setError(null);

    const days = WEEKDAYS.filter((day) => selectedWeekdays.has(day.value)).map((day) => ({
      weekday: day.value,
      title: name.trim() || "Entrenamiento",
      exercises: exercisesByDay[day.value] ?? [],
    }));

    startTransition(async () => {
      const result = await createRoutineAction({
        name,
        difficulty,
        days,
        clienteIds: [...selectedClients],
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push("/profesor/rutinas");
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
          Dificultad
        </p>
        <div className="flex flex-wrap gap-2">
          {DIFFICULTY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setDifficulty(option.value)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                difficulty === option.value
                  ? "bg-brand text-brand-foreground"
                  : "bg-surface-elevated text-ink-muted"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

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

      {WEEKDAYS.filter((day) => selectedWeekdays.has(day.value)).map((day) => {
        const exercises = exercisesByDay[day.value] ?? [];
        const availableExercises = branchExercises.filter(
          (exercise) => !exercises.some((entry) => entry.exerciseId === exercise.id)
        );

        return (
          <section key={day.value} className="flex flex-col gap-3 rounded-2xl border border-border p-3">
            <p className="text-xs font-bold uppercase tracking-widest text-ink-muted">
              {day.label} · Ejercicios ({exercises.length})
            </p>

            {exercises.length === 0 && (
              <p className="text-sm text-ink-muted">Todavía no agregaste ejercicios.</p>
            )}

            {exercises.map((exercise) => (
              <div
                key={exercise.exerciseId}
                className="flex items-center gap-2 rounded-xl bg-surface-elevated px-3 py-2"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
                  {exercise.exerciseName}
                </span>
                <input
                  type="number"
                  min={1}
                  value={exercise.sets}
                  onChange={(event) =>
                    updateExercise(day.value, exercise.exerciseId, {
                      sets: Number(event.target.value) || 1,
                    })
                  }
                  aria-label={`Series de ${exercise.exerciseName}`}
                  className="w-12 rounded-lg border border-border bg-surface px-1.5 py-1 text-center text-xs font-bold text-ink"
                />
                <span className="text-xs text-ink-muted">x</span>
                <input
                  type="number"
                  min={1}
                  value={exercise.reps}
                  onChange={(event) =>
                    updateExercise(day.value, exercise.exerciseId, {
                      reps: Number(event.target.value) || 1,
                    })
                  }
                  aria-label={`Repeticiones de ${exercise.exerciseName}`}
                  className="w-12 rounded-lg border border-border bg-surface px-1.5 py-1 text-center text-xs font-bold text-ink"
                />
                <input
                  type="number"
                  min={0}
                  value={exercise.restSeconds}
                  onChange={(event) =>
                    updateExercise(day.value, exercise.exerciseId, {
                      restSeconds: Number(event.target.value) || 0,
                    })
                  }
                  aria-label={`Descanso en segundos de ${exercise.exerciseName}`}
                  title="Descanso (seg)"
                  className="w-14 rounded-lg border border-border bg-surface px-1.5 py-1 text-center text-xs font-bold text-ink"
                />
                <button
                  type="button"
                  onClick={() => removeExercise(day.value, exercise.exerciseId)}
                  aria-label={`Quitar ${exercise.exerciseName}`}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-muted hover:text-danger"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            <select
              value=""
              onChange={(event) => {
                const exercise = branchExercises.find((entry) => entry.id === event.target.value);
                if (exercise) addExercise(day.value, exercise);
              }}
              aria-label={`Agregar ejercicio a ${day.label}`}
              className="min-h-12 w-full appearance-none truncate rounded-2xl border border-border bg-surface px-4 text-sm font-bold text-ink-muted focus:border-brand focus:outline-none"
            >
              <option value="">+ Agregar ejercicio</option>
              {availableExercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </select>
          </section>
        );
      })}

      <section className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Asignar clientes
        </p>
        <div className="flex flex-col gap-2">
          {roster.map((client) => (
            <AssignClientRow
              key={client.id}
              client={client}
              selected={selectedClients.has(client.id)}
              onToggle={() => toggleClient(client.id)}
            />
          ))}
        </div>
      </section>

      {error && <p className="text-sm font-semibold text-danger">{error}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="flex min-h-14 items-center justify-center rounded-2xl bg-brand text-base font-extrabold uppercase tracking-wide text-brand-foreground transition-opacity active:opacity-80 disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Guardar rutina"}
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Dumbbell, Zap } from "lucide-react";
import type { ExerciseSummary } from "../active-routine";
import type { SessionData, SetLog } from "./types";
import { ExerciseLogCard } from "./exercise-log-card";
import { CompletionToast } from "./completion-toast";
import { RestTimer } from "./rest-timer";

type ActiveRest = {
  exerciseIndex: number;
  setIndex: number;
  exerciseName: string;
  setNumber: number;
  restSeconds: number;
};

function parseTargetReps(reps: string): string {
  const numeric = parseInt(reps, 10);
  return Number.isNaN(numeric) ? reps : String(numeric);
}

function buildInitialLogs(exercise: ExerciseSummary): SetLog[] {
  return exercise.previousSets.map((previous) => ({
    weight: String(previous.weight),
    reps: parseTargetReps(exercise.reps),
    completed: false,
  }));
}

export function SessionScreen({ session }: { session: SessionData }) {
  const [logsByExercise, setLogsByExercise] = useState<SetLog[][]>(() =>
    session ? session.exercises.map(buildInitialLogs) : []
  );
  const [celebrationId, setCelebrationId] = useState(0);
  const [activeRest, setActiveRest] = useState<ActiveRest | null>(null);
  const [isResting, setIsResting] = useState(false);

  if (!session) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <p className="text-lg font-bold text-ink">Hoy es día de descanso</p>
        <p className="text-sm text-ink-muted">No hay entrenamiento para completar hoy.</p>
        <Link href="/alumno/rutina" className="text-sm font-semibold text-brand">
          Volver a mi rutina
        </Link>
      </div>
    );
  }

  // Alias no-nulo: TypeScript no retiene el narrowing de `session` (parámetro) dentro de las
  // funciones anidadas más abajo, aunque nunca se reasigna.
  const workout = session;

  const totalSets = logsByExercise.reduce((sum, logs) => sum + logs.length, 0);
  const completedSets = logsByExercise.reduce(
    (sum, logs) => sum + logs.filter((log) => log.completed).length,
    0
  );
  const percent = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  function updateSet(exerciseIndex: number, setIndex: number, patch: Partial<SetLog>) {
    setLogsByExercise((current) =>
      current.map((logs, i) =>
        i === exerciseIndex
          ? logs.map((log, j) => (j === setIndex ? { ...log, ...patch } : log))
          : logs
      )
    );
  }

  function toggleSetCompleted(exerciseIndex: number, setIndex: number) {
    const willComplete = !logsByExercise[exerciseIndex][setIndex].completed;
    const nextCompletedCount = willComplete ? completedSets + 1 : completedSets - 1;

    updateSet(exerciseIndex, setIndex, { completed: willComplete });

    if (nextCompletedCount === totalSets) {
      setCelebrationId((id) => id + 1);
    }

    const exercise = workout.exercises[exerciseIndex];
    const isLastSetOfExercise = setIndex === exercise.previousSets.length - 1;
    const isActiveRestRow =
      activeRest?.exerciseIndex === exerciseIndex && activeRest?.setIndex === setIndex;

    if (!willComplete && isActiveRestRow) {
      // El usuario deshace la serie que disparó el descanso actual (se equivocó): se cancela.
      setActiveRest(null);
      setIsResting(false);
    }

    if (willComplete && !isLastSetOfExercise) {
      setActiveRest({
        exerciseIndex,
        setIndex,
        exerciseName: exercise.name,
        setNumber: setIndex + 1,
        restSeconds: exercise.restSeconds,
      });
      setIsResting(true);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6 pb-28 pt-6">
        <div className="relative flex items-center justify-center">
          <Link
            href="/alumno/rutina"
            className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full bg-surface-elevated text-ink"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Hoy · {workout.dayLabel}
          </p>
        </div>

        <div>
          <h1 className="text-3xl font-black uppercase leading-tight text-ink">
            {workout.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
            <span className="flex items-center gap-1.5">
              <Dumbbell className="h-4 w-4" /> {workout.exerciseCount} ejercicios
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> ~{workout.durationMinutes} min
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4" /> {workout.difficulty}
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-muted">
              {completedSets} / {totalSets} series completadas
            </span>
            <span className="font-bold text-brand">{percent}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-elevated">
            <div
              className="h-full rounded-full bg-brand transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {activeRest && (
          <RestTimer
            key={`${activeRest.exerciseIndex}-${activeRest.setIndex}`}
            seconds={activeRest.restSeconds}
            label={`${activeRest.exerciseName} · serie ${activeRest.setNumber}`}
            onFinish={() => setIsResting(false)}
          />
        )}

        <div className="flex flex-col gap-4">
          {workout.exercises.map((exercise, exerciseIndex) => (
            <ExerciseLogCard
              key={exercise.name}
              exercise={exercise}
              logs={logsByExercise[exerciseIndex]}
              isResting={isResting}
              activeSetIndex={
                activeRest?.exerciseIndex === exerciseIndex ? activeRest.setIndex : null
              }
              onChangeWeight={(setIndex, value) =>
                updateSet(exerciseIndex, setIndex, { weight: value })
              }
              onChangeReps={(setIndex, value) =>
                updateSet(exerciseIndex, setIndex, { reps: value })
              }
              onToggleCompleted={(setIndex) => toggleSetCompleted(exerciseIndex, setIndex)}
            />
          ))}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background px-6 py-4">
        <Link
          href="/alumno/rutina"
          className="mx-auto flex min-h-14 w-full max-w-sm items-center justify-center rounded-2xl border border-border bg-surface text-base font-extrabold uppercase tracking-wide text-ink"
        >
          Guardar y salir
        </Link>
      </div>

      {celebrationId > 0 && <CompletionToast key={celebrationId} />}
    </div>
  );
}

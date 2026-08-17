"use client";

import { useState } from "react";
import type { Student } from "../roster";
import { StudentRow } from "./student-row";

export function AlumnosScreen({ students }: { students: Student[] }) {
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? students.filter((student) => student.name.toLowerCase().includes(normalizedQuery))
    : students;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 pb-28 pt-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Alumnos
        </p>
        <h1 className="text-3xl font-black uppercase leading-tight text-ink">
          {students.length} registrados
        </h1>
      </div>

      <input
        type="text"
        placeholder="Buscar alumno..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none"
      />

      <div className="flex flex-col gap-3">
        {filtered.map((student) => (
          <StudentRow key={student.name} student={student} />
        ))}
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-ink-muted">
            No se encontraron alumnos.
          </p>
        )}
      </div>
    </div>
  );
}

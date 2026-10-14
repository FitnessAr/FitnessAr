"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { createUserAction } from "./actions";
import { MediaPicker } from "@/features/admin/catalogo/media-picker";

export function NuevaCuentaScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "PROFESOR">("PROFESOR");
  const [schedule, setSchedule] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("loginId", loginId);
    formData.set("password", password);
    formData.set("confirmPassword", confirmPassword);
    formData.set("role", role);
    formData.set("schedule", schedule);
    if (image) formData.set("image", image);
    if (bio.trim()) formData.set("bio", bio.trim());

    const result = await createUserAction(formData);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push("/admin/usuarios");
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-8 px-6 pt-8 lg:max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black uppercase leading-tight text-ink">Nuevo usuario</h1>
        <Link
          href="/admin/usuarios"
          aria-label="Cerrar"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-elevated text-ink-muted"
        >
          <X className="h-4 w-4" />
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[200px_1fr] lg:items-start lg:gap-6">
          <MediaPicker value={image} onChange={setImage} />

          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
                Nombre
              </span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm text-ink focus:border-brand focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
                DNI
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="username"
                placeholder="Sin puntos ni comas"
                value={loginId}
                onChange={(event) => setLoginId(event.target.value.replace(/\D/g, ""))}
                required
                className="rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none"
              />
            </label>
          </div>
        </div>

        <section className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Rol</p>
          <div className="flex gap-2">
            {(["PROFESOR", "ADMIN"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={`flex-1 rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${
                  role === value
                    ? "bg-brand text-brand-foreground"
                    : "bg-surface-elevated text-ink-muted"
                }`}
              >
                {value === "PROFESOR" ? "Profesor" : "Administrador"}
              </button>
            ))}
          </div>
        </section>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Contraseña
          </span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            className="rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm text-ink focus:border-brand focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Confirmar contraseña
          </span>
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={6}
            className="rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm text-ink focus:border-brand focus:outline-none"
          />
        </label>

        {role === "PROFESOR" && (
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
              Horario (opcional)
            </span>
            <input
              type="text"
              value={schedule}
              onChange={(event) => setSchedule(event.target.value)}
              placeholder="Ej. Lun–Vie, 09:00–18:00"
              className="rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none"
            />
          </label>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Descripción (opcional)
          </span>
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Breve descripción del usuario"
            rows={3}
            className="resize-none rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none"
          />
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 min-h-14 rounded-2xl bg-brand text-base font-extrabold uppercase tracking-wide text-brand-foreground transition-opacity active:opacity-80 disabled:opacity-60"
        >
          {isSubmitting ? "Creando…" : "Crear usuario"}
        </button>
      </form>
    </div>
  );
}

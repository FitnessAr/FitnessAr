"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Loader2, X } from "lucide-react";
import { updateUserProfileAction, updateUserPasswordAction } from "./actions";
import { MediaPicker } from "@/features/admin/catalogo/media-picker";
import type { AdminUserRow } from "./types";

const ROLE_LABELS: Record<AdminUserRow["role"], string> = {
  ADMIN: "Administrador",
  PROFESOR: "Profesor",
  CLIENTE: "Cliente",
};

export function EditarUsuarioScreen({ user }: { user: AdminUserRow }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState<"ADMIN" | "PROFESOR" | "CLIENTE">(user.role);
  const [image, setImage] = useState<string | null>(user.image);
  const [bio, setBio] = useState(user.bio ?? "");
  const [schedule, setSchedule] = useState(user.schedule ?? "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password section
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  async function handleSubmitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("role", role);
    if (image) formData.set("image", image);
    if (bio.trim()) formData.set("bio", bio.trim());
    formData.set("schedule", schedule);

    const result = await updateUserProfileAction(user.id, formData);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push(`/admin/usuarios/${user.id}`);
  }

  async function handleSubmitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (password !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }

    setIsSavingPassword(true);

    const formData = new FormData();
    formData.set("password", password);
    formData.set("confirmPassword", confirmPassword);

    const result = await updateUserPasswordAction(user.id, formData);
    setIsSavingPassword(false);

    if (!result.ok) {
      setPasswordError(result.error);
      return;
    }

    setPasswordSuccess(true);
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-8 px-6 pt-8 lg:max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            {ROLE_LABELS[user.role]}
          </p>
          <h1 className="text-2xl font-black uppercase leading-tight text-ink">{user.name}</h1>
        </div>
        <Link
          href={`/admin/usuarios/${user.id}`}
          aria-label="Cerrar"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-ink-muted"
        >
          <X className="h-4 w-4" />
        </Link>
      </div>

      <form onSubmit={handleSubmitProfile} className="flex flex-col gap-4">
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
                value={user.loginId ?? "—"}
                readOnly
                disabled
                className="rounded-2xl border border-border bg-surface-elevated px-4 py-3.5 text-sm text-ink-muted"
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
                {ROLE_LABELS[value]}
              </button>
            ))}
          </div>
        </section>

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
          className="mt-2 flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-brand text-base font-extrabold uppercase tracking-wide text-brand-foreground transition-opacity active:opacity-80 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
          {isSubmitting ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>

      {/* ── Sección colapsable: restablecer contraseña ── */}
      <div className="rounded-2xl border border-border bg-surface">
        <button
          type="button"
          onClick={() => setPasswordOpen(!passwordOpen)}
          className="flex w-full items-center justify-between px-4 py-4 text-left"
        >
          <div>
            <p className="text-sm font-bold text-ink">Restablecer contraseña</p>
            <p className="text-xs text-ink-muted">
              Generá una nueva contraseña para {user.name.split(" ")[0]}
            </p>
          </div>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-ink-muted transition-transform duration-200 ${
              passwordOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {passwordOpen && (
          <form
            onSubmit={handleSubmitPassword}
            className="flex flex-col gap-4 border-t border-border px-4 pb-4 pt-4"
          >
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
                Nueva contraseña
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

            {passwordError && <p className="text-sm text-danger">{passwordError}</p>}
            {passwordSuccess && (
              <p className="text-sm font-semibold text-brand">Contraseña actualizada.</p>
            )}

            <button
              type="submit"
              disabled={isSavingPassword}
              className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-surface-elevated text-xs font-extrabold uppercase tracking-wide text-ink transition-opacity active:opacity-80 disabled:opacity-60"
            >
              {isSavingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSavingPassword ? "Guardando…" : "Actualizar contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

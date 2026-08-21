"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { authenticateRealUser } from "./authenticate-real-user";

export function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    const result = await authenticateRealUser(identifier, password);
    setIsSubmitting(false);

    if (result.ok) {
      setError("");
      router.push(result.redirectTo);
      return;
    }

    setError(result.error);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 focus-within:border-brand">
        <User className="h-5 w-5 shrink-0 text-ink-muted" />
        <input
          type="text"
          inputMode="numeric"
          autoComplete="username"
          placeholder="DNI, sin puntos ni comas"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value.replace(/\D/g, ""))}
          className="w-full bg-transparent text-base text-ink placeholder:text-ink-muted focus:outline-none"
        />
      </label>

      <label className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 focus-within:border-brand">
        <Lock className="h-5 w-5 shrink-0 text-ink-muted" />
        <input
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Contraseña"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full bg-transparent text-base text-ink placeholder:text-ink-muted focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="shrink-0 text-ink-muted"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </label>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 min-h-14 rounded-2xl bg-brand text-base font-extrabold uppercase tracking-wide text-brand-foreground transition-opacity active:opacity-80 disabled:opacity-60"
      >
        {isSubmitting ? "Ingresando…" : "Ingresar"}
      </button>

      <Link
        href="/registro"
        className="flex min-h-14 items-center justify-center rounded-2xl text-sm font-extrabold uppercase tracking-wide text-brand transition-opacity active:opacity-70"
      >
        ¿No tenés una cuenta? Registrate
      </Link>
    </form>
  );
}

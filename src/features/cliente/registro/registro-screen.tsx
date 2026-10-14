"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Eye, EyeOff, IdCard, Lock, ShieldCheck, User } from "lucide-react";
import { brand } from "@/lib/config/brand";
import { registerClienteAction } from "./actions";

export function RegistroScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

    const result = await registerClienteAction(formData);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push(result.redirectTo);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col px-6 py-8">
        <Link
          href="/"
          aria-label="Volver"
          className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-ink"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="relative mb-5 h-14 w-14 overflow-hidden rounded-2xl bg-surface-elevated">
          <Image
            src={brand.logoSrc}
            alt={brand.logoAlt}
            fill
            className="object-contain p-2"
            priority
          />
        </div>

        <h1 className="text-4xl font-black uppercase tracking-tight text-ink">
          {brand.wordmarkBase}
          <span className="text-brand">{brand.wordmarkAccent}</span>
        </h1>

        <p className="mt-2 text-base text-ink">Creá tu cuenta para comenzar a entrenar.</p>

        <p className="mb-3 mt-10 text-xs font-semibold uppercase tracking-widest text-brand">
          Crear cuenta
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">Nombre</span>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 focus-within:border-brand">
              <User className="h-5 w-5 shrink-0 text-ink-muted" />
              <input
                type="text"
                autoComplete="name"
                placeholder="Tu nombre y apellido"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="w-full bg-transparent text-base text-ink placeholder:text-ink-muted focus:outline-none"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">DNI</span>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 focus-within:border-brand">
              <IdCard className="h-5 w-5 shrink-0 text-ink-muted" />
              <input
                type="text"
                inputMode="numeric"
                autoComplete="username"
                placeholder="Tu DNI, sin puntos ni comas"
                value={loginId}
                onChange={(event) => setLoginId(event.target.value.replace(/\D/g, ""))}
                required
                className="w-full bg-transparent text-base text-ink placeholder:text-ink-muted focus:outline-none"
              />
            </div>
            <p className="text-xs text-ink-muted">Sin puntos ni comas.</p>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">Contraseña</span>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 focus-within:border-brand">
              <Lock className="h-5 w-5 shrink-0 text-ink-muted" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Creá tu contraseña"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                className="w-full bg-transparent text-base text-ink placeholder:text-ink-muted focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="shrink-0 text-ink-muted"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-xs text-ink-muted">Mínimo 8 caracteres.</p>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">Confirmar contraseña</span>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 focus-within:border-brand">
              <Lock className="h-5 w-5 shrink-0 text-ink-muted" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Volvé a escribir tu contraseña"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={8}
                className="w-full bg-transparent text-base text-ink placeholder:text-ink-muted focus:outline-none"
              />
            </div>
            <p className="text-xs text-ink-muted">Debe coincidir con la contraseña.</p>
          </label>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 min-h-14 rounded-2xl bg-brand text-base font-extrabold uppercase tracking-wide text-brand-foreground transition-opacity active:opacity-80 disabled:opacity-60"
          >
            {isSubmitting ? "Creando…" : "Crear cuenta"}
          </button>
        </form>

        <div className="my-8 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
          <span className="h-px flex-1 bg-border" />
        </div>

        <p className="text-center text-sm text-ink-muted">
          ¿Ya tenés cuenta?{" "}
          <Link href="/" className="font-bold text-brand">
            Iniciar sesión
          </Link>
        </p>

        <div className="mt-8 flex items-start gap-3 rounded-2xl bg-surface-elevated px-4 py-3.5">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <p className="text-xs text-ink-muted">
            <span className="font-semibold text-ink">Tu información está protegida.</span> No
            compartimos tus datos con terceros.
          </p>
        </div>
      </div>
    </div>
  );
}

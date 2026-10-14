import Image from "next/image";
import { brand } from "@/lib/config/brand";
import { LoginForm } from "./login-form";

export function LoginScreen() {
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12">
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

        <p className="mt-2 text-base text-ink">{brand.tagline}</p>
        <p className="text-sm text-brand">{brand.subtitle}</p>

        <p className="mb-3 mt-10 text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Ingresá a tu cuenta
        </p>

        <LoginForm />

        <p className="mt-10 text-center text-xs text-ink-muted">
          Demo interactiva · {brand.name} © {year}
        </p>
      </div>
    </div>
  );
}

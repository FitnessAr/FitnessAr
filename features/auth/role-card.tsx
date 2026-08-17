import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

type RoleCardProps = {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  variant?: "primary" | "secondary";
};

export function RoleCard({
  href,
  icon: Icon,
  title,
  description,
  variant = "secondary",
}: RoleCardProps) {
  const isPrimary = variant === "primary";

  return (
    <Link
      href={href}
      className={`flex min-h-16 items-center gap-4 rounded-2xl border px-4 py-4 transition-opacity active:opacity-80 ${
        isPrimary
          ? "border-transparent bg-brand"
          : "border-border bg-surface"
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          isPrimary ? "bg-black/10" : "bg-surface-elevated"
        }`}
      >
        <Icon
          className={`h-6 w-6 ${isPrimary ? "text-brand-foreground" : "text-brand"}`}
          strokeWidth={2}
        />
      </span>

      <span className="flex-1">
        <span
          className={`block text-base font-extrabold uppercase tracking-wide ${
            isPrimary ? "text-brand-foreground" : "text-ink"
          }`}
        >
          {title}
        </span>
        <span
          className={`block text-sm ${
            isPrimary ? "text-brand-foreground/70" : "text-ink-muted"
          }`}
        >
          {description}
        </span>
      </span>

      <ChevronRight
        className={`h-5 w-5 shrink-0 ${
          isPrimary ? "text-brand-foreground/70" : "text-ink-muted"
        }`}
      />
    </Link>
  );
}

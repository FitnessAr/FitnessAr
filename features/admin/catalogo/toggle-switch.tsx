"use client";

// Interruptor idéntico al de la fila de usuario (features/admin/usuarios/user-row.tsx):
// mismo tamaño, mismos colores y misma semántica role="switch".
export function ToggleSwitch({
  checked,
  disabled,
  onChange,
  ariaLabel,
  title,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  ariaLabel: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      title={title}
      onClick={onChange}
      disabled={disabled}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-40 ${
        checked ? "bg-brand" : "bg-surface-elevated"
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

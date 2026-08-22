"use client";

// Toast liviano de avisos (errores de toggle del catálogo por ahora): stack fijo sobre la
// bottom-nav, auto-dismiss a los ~4s y cierre manual. aria-live para lectores de pantalla.
import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export type ToastItem = { id: number; message: string };

const AUTO_DISMISS_MS = 4000;

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const nextIdRef = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (message: string) => {
      const id = nextIdRef.current;
      nextIdRef.current += 1;
      setToasts((prev) => [...prev.slice(-3), { id, message }]);
      timersRef.current.set(
        id,
        setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
      );
    },
    [dismiss]
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
    };
  }, []);

  return { toasts, pushToast: push, dismissToast: dismiss };
}

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-24 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="flex items-start justify-between gap-3 rounded-2xl border border-danger/40 bg-surface px-4 py-3 shadow-lg shadow-black/40"
        >
          <p className="text-xs font-semibold leading-relaxed text-danger">
            {toast.message}
          </p>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Cerrar aviso"
            className="shrink-0 text-ink-muted transition-colors hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

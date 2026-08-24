"use client";

// Selector de imagen para ejercicios propios: acepta un GIF animado o una imagen estática
// (PNG/JPG/WebP) y la sube directo a Supabase Storage vía /api/ejercicios/media.
// Sin conversión client-side: el archivo elegido es el que viaja al server.
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

const MAX_BYTES = 10 * 1024 * 1024; // techo del archivo subido (revalidado server-side)

type Phase =
  | { kind: "idle" }
  | { kind: "uploading" }
  | { kind: "done"; url: string };

export function MediaPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const [phase, setPhase] = useState<Phase>(value ? { kind: "done", url: value } : { kind: "idle" });
  const [error, setError] = useState<string | null>(null);
  // Preview local mientras sube: objectURL del archivo elegido.
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleFile(file: File) {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Elegí una imagen o un GIF animado.");
      return;
    }
    if (file.size <= 0 || file.size > MAX_BYTES) {
      setError("El archivo supera el máximo de 10MB.");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      setPhase({ kind: "uploading" });
      const formData = new FormData();
      formData.set("file", file, file.name || "imagen");
      const response = await fetch("/api/ejercicios/media", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as { ok: boolean; url?: string; error?: string };
      if (!response.ok || !result.ok || !result.url) {
        throw new Error(result.error ?? "No se pudo subir la imagen.");
      }
      setPhase({ kind: "done", url: result.url });
      onChange(result.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Algo falló. Probá de nuevo.");
      setPhase(value ? { kind: "done", url: value } : { kind: "idle" });
    }
  }

  function clear() {
    onChange(null);
    setPhase({ kind: "idle" });
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const busy = phase.kind === "uploading";
  const shownImage = phase.kind === "done" ? phase.url : previewUrl;

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/gif,image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      {shownImage ? (
        <div className="relative overflow-hidden rounded-2xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shownImage} alt="Imagen del ejercicio" className="h-40 w-full bg-surface-elevated object-contain" />
          {!busy && (
            <button
              type="button"
              onClick={clear}
              aria-label="Quitar imagen"
              title="Quitar imagen"
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-ink-muted transition-colors hover:text-danger"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex min-h-28 flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border bg-surface px-4 py-6 text-ink-muted transition-colors hover:border-brand/60 disabled:opacity-60"
        >
          <ImagePlus className="h-6 w-6" />
          <span className="text-xs font-bold uppercase tracking-wide">
            Agregar imagen
          </span>
          <span className="text-[11px] text-ink-muted">
            GIF animado o imagen hasta 10MB
          </span>
        </button>
      )}

      {busy && (
        <p className="flex items-center gap-2 text-xs font-semibold text-brand">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Subiendo imagen…
        </p>
      )}
      {error && <p className="text-xs font-semibold text-danger">{error}</p>}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { FoldText } from "@/components/fold-text/fold-text";

export function CompletionToast() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const showFrame = requestAnimationFrame(() => setVisible(true));
    const fadeTimer = setTimeout(() => setFading(true), 2600);

    return () => {
      cancelAnimationFrame(showFrame);
      clearTimeout(fadeTimer);
    };
  }, []);

  const isShown = visible && !fading;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm transition-opacity duration-500 ${
        isShown ? "opacity-100" : "opacity-0"
      } ${fading ? "pointer-events-none" : ""}`}
    >
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-surface-elevated px-8 py-10 text-center shadow-2xl">
        <Trophy className="h-10 w-10 text-brand" />
        <FoldText
          text="¡Entrenamiento completado!"
          splitBy="char"
          hinge="top"
          trigger="mount"
          duration={0.5}
          stagger={0.02}
          ease="power3.out"
          perspective={500}
          creaseShading={0.5}
          fontSize="clamp(1.25rem, 6vw, 1.75rem)"
          fontWeight={800}
          color="var(--brand)"
        />
      </div>
    </div>
  );
}

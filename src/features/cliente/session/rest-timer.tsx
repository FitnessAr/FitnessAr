"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Counter } from "@/components/counter/counter";

export function RestTimer({
  seconds,
  label,
  onFinish,
}: {
  seconds: number;
  label: string;
  onFinish?: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          clearInterval(interval);
          onFinishRef.current?.();
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const done = remaining <= 0;
  const minutes = Math.floor(remaining / 60);
  const secondsPart = remaining % 60;

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      className={`flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl border ${
        done
          ? "gap-1.5 border-brand/40 bg-brand/10 px-4 py-2"
          : "gap-2 border-border bg-surface-elevated px-6 py-5"
      }`}
    >
      {done ? (
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-brand" />
          <span className="text-sm font-bold text-brand">Descanso listo</span>
        </div>
      ) : (
        <>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted">
            Descanso · {label}
          </span>
          <div className="flex items-center gap-1.5">
            <Counter
              value={minutes}
              places={[1]}
              fontSize={44}
              fontWeight={800}
              padding={0}
              gap={0}
              horizontalPadding={0}
              textColor="var(--ink)"
              gradientFrom="var(--surface-elevated)"
              gradientHeight={8}
            />
            <span className="text-3xl font-black text-ink">:</span>
            <Counter
              value={secondsPart}
              places={[10, 1]}
              fontSize={44}
              fontWeight={800}
              padding={0}
              gap={2}
              horizontalPadding={0}
              textColor="var(--ink)"
              gradientFrom="var(--surface-elevated)"
              gradientHeight={8}
            />
          </div>
        </>
      )}
    </motion.div>
  );
}

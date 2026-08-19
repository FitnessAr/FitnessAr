"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { SESSION_COOKIE_NAME } from "./session-cookie";

export function LogoutLink({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <Link
      href="/"
      className={className}
      onClick={() => {
        document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0`;
      }}
    >
      {children}
    </Link>
  );
}

"use client";

import type { ReactNode } from "react";

export function Header({ actions }: { actions?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex h-12 w-full max-w-[1280px] items-center justify-between gap-4 px-5">
        <a href="/" className="font-serif text-[19px] lowercase tracking-tight">
          freeploggenerator
        </a>
        <div className="flex items-center gap-2.5">{actions}</div>
      </div>
    </header>
  );
}

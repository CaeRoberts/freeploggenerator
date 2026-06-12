"use client";

import { useEffect, useState } from "react";
import { Preview } from "./Preview";
import { usePlogStore } from "@/lib/store";
import { clearHash, configFromHash } from "@/lib/share";

export function Builder() {
  const [mounted, setMounted] = useState(false);
  const setConfig = usePlogStore((s) => s.setConfig);

  useEffect(() => {
    const shared = configFromHash();
    if (shared) {
      setConfig(shared);
      clearHash();
    }
    setMounted(true);
  }, [setConfig]);

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-[13px] text-ink-faint">
        Loading your PLOG…
      </div>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-5 py-6 lg:flex-row lg:gap-10">
      <aside className="order-2 w-full shrink-0 lg:order-1 lg:w-[360px]">
        <div className="panel-scroll lg:sticky lg:top-16 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto lg:pr-2">
          {/* section editor lands here */}
          <p className="text-[13px] text-ink-faint">Editor panel coming up.</p>
        </div>
      </aside>
      <section className="order-1 min-w-0 flex-1 lg:order-2">
        <div className="lg:sticky lg:top-16 lg:h-[calc(100vh-5rem)]">
          <Preview />
        </div>
      </section>
    </main>
  );
}

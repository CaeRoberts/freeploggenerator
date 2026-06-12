import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-baseline justify-between gap-3 px-5 py-6">
        <p className="text-[12px] text-ink-faint">
          <span className="font-serif text-[14px] lowercase text-ink">
            freeflyingplog
          </span>{" "}
          — free kneeboard PLOGs, no sign-up.
        </p>
        <nav className="flex gap-5 text-[12px] text-ink-soft">
          <Link href="/guide" className="hover:text-ink">
            What is a PLOG?
          </Link>
          <Link href="/privacy" className="hover:text-ink">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}

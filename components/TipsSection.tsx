"use client";

import { useState } from "react";
import {
  TIP_PROVIDER,
  TIP_URL,
  type Tipper,
  availableYears,
  featuredTippers,
  formatTip,
  monogram,
  rankedTippers,
  tipYear,
} from "@/lib/tips";

function TipButton({ block }: { block?: boolean }) {
  return (
    <a
      href={TIP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center bg-navy px-4 py-2.5 text-[13px] tracking-wide text-paper hover:bg-navy-deep ${
        block ? "w-full" : ""
      }`}
    >
      Leave a tip
    </a>
  );
}

function LogoWall({ tippers }: { tippers: Tipper[] }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.18em] text-ink-faint">
        Headline supporters
      </p>
      <ul className="mt-3 flex flex-wrap gap-3">
        {tippers.map((t, i) => {
          const inner = (
            <div className="flex h-20 w-40 flex-col items-center justify-center gap-1 border border-hairline bg-paper-deep/40 p-2">
              {t.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={t.logo}
                  alt={`${t.name} logo`}
                  className="max-h-10 max-w-[120px] object-contain"
                />
              ) : (
                <span className="font-serif text-[20px] text-ink">
                  {monogram(t.name)}
                </span>
              )}
              <span className="text-[10px] text-ink-soft">{t.name}</span>
            </div>
          );
          return (
            <li key={`${t.name}-${i}`}>
              {t.url ? (
                <a
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:opacity-80"
                >
                  {inner}
                </a>
              ) : (
                inner
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Scoreboard({ tippers }: { tippers: Tipper[] }) {
  return (
    <ol className="mt-2 divide-y divide-hairline border-y border-hairline">
      {tippers.map((t, i) => (
        <li
          key={`${t.name}-${i}`}
          className="flex items-center gap-3 py-2 text-[13px]"
        >
          <span className="w-6 shrink-0 text-right font-mono text-[12px] text-ink-faint">
            {i + 1}
          </span>
          <span className="min-w-0 flex-1 truncate text-ink">
            {t.url ? (
              <a
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-hairline underline-offset-2 hover:decoration-ink"
              >
                {t.name}
              </a>
            ) : (
              t.name
            )}
            {t.company && (
              <span className="ml-2 border border-hairline px-1 py-0.5 text-[9px] uppercase tracking-[0.12em] text-ink-faint">
                company
              </span>
            )}
          </span>
          <span className="shrink-0 font-mono text-[12px] text-ink-soft">
            {formatTip(t.amount)}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function TipsSection() {
  const years = availableYears();
  const [year, setYear] = useState<number>(years[0] ?? new Date().getFullYear());
  const current = tipYear(year);
  const ranked = rankedTippers(current);
  const featured = featuredTippers(current);

  return (
    <section
      id="supporters"
      className="border-t border-hairline bg-paper-deep/30"
    >
      <div className="mx-auto w-full max-w-[1280px] px-5 py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* Left: the pitch */}
          <div>
            <h2 className="font-serif text-[26px] leading-tight">Tip jar</h2>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-ink-soft">
              freeflyingplog is free and runs on a shoestring. If a clean
              kneeboard card saved you some time, a small tip helps keep it
              online and the ads light. No sign-up, no pressure.
            </p>

            <div className="mt-5 flex items-center gap-3">
              <TipButton />
              <span className="text-[11px] text-ink-faint">
                via {TIP_PROVIDER} — opens in a new tab
              </span>
            </div>

            <div className="mt-6 border-l-2 border-navy/40 pl-4">
              <p className="text-[13px] font-medium text-ink">
                Flying schools &amp; companies
              </p>
              <p className="mt-1 max-w-md text-[13px] leading-relaxed text-ink-soft">
                Tip as a company and your logo rides at the top of the
                supporters board for the whole year — seen by every pilot who
                builds a card here. A friendly way to back a free tool your
                students already use.
              </p>
            </div>
          </div>

          {/* Right: the yearly scoreboard */}
          <div>
            <div className="flex items-baseline justify-between border-b border-ink pb-1">
              <h3 className="font-serif text-[18px]">Supporters board</h3>
              {years.length > 1 ? (
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  aria-label="Scoreboard year"
                  className="border border-hairline bg-transparent px-1.5 py-0.5 text-[12px] text-ink outline-none hover:border-ink"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="font-mono text-[12px] text-ink-faint">
                  {current.year}
                </span>
              )}
            </div>

            {ranked.length === 0 ? (
              <div className="mt-4 border border-dashed border-hairline px-4 py-8 text-center">
                <p className="text-[14px] text-ink">
                  No tips yet in {current.year}.
                </p>
                <p className="mx-auto mt-1 max-w-xs text-[12px] leading-relaxed text-ink-soft">
                  Be the first on the board — companies get their logo up top.
                </p>
                <div className="mt-4">
                  <TipButton />
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-6">
                {featured.length > 0 && <LogoWall tippers={featured} />}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                    Top tippers {current.year}
                  </p>
                  <Scoreboard tippers={ranked} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

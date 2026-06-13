# freeploggenerator

Free, single-page web app where pilots design a custom kneeboard PLOG
(pilot's log) and download it as a print-ready A5 PDF. Everything runs
client-side — no backend, no database, no sign-up — so it deploys as a
static site (Vercel free tier, GitHub Pages, anywhere).

## The flip trick

The back page is rotated 180° in the PDF. The card is clipped at the top
of a kneeboard; the pilot flips the bottom edge up over the clip, so the
rotated back reads upright. Print duplex, **flip on long edge**. A toggle
disables the rotation for separate sheets / short-edge duplex.

## Stack

- Next.js 14 (App Router, static export), TypeScript, Tailwind CSS
- `@react-pdf/renderer` — the PDF document component is the single source
  of truth; the live preview renders the same document
- `zustand` (config state, persisted to localStorage)
- `dnd-kit` (drag-to-reorder sections and checklist items)
- `lz-string` (share links: config compressed into the URL `#` fragment)

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to ./out
```

Dev utilities (not part of the build):

```bash
npx tsx scripts/render-test.tsx        # render all templates to /tmp/plogtest
npx tsx scripts/pdf2png.ts <file.pdf>  # rasterize a PDF for inspection
node scripts/screenshot.mjs [path]     # serve ./out and screenshot a page
node scripts/verify.mjs                # e2e checks (persistence, share, export)
```

## Ads (off by default)

Two placements (config panel bottom, export modal) render quiet
placeholders unless enabled:

```bash
NEXT_PUBLIC_ADS_ENABLED=true
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADSENSE_SLOT_PANEL=1234567890
NEXT_PUBLIC_ADSENSE_SLOT_MODAL=0987654321
```

Ad scripts load only after cookie consent (banner shown when ads are
enabled); declining means no ad scripts load at all. The download is never
gated or delayed by an ad.

## Templates

- **IFR** — 12-leg flight log (shaded HDG (M) column), two-column phase
  checklist with auto-slotted minima box; inverted back with route sketch,
  clearance/ATIS, fuel plan, comms/nav.
- **VFR** — 8-leg log, single-column FREDA/BUMFICHH checklist; back with a
  larger route sketch, fuel plan, comms/nav and notes. (The spec'd
  all-on-front arrangement physically overflows A5 at legible sizes, so
  fuel plan and comms/nav live on the back.)
- **Blank canvas** — flight log only; switch on whatever you need.

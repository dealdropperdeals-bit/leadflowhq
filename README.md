# Local B2B Lead Scanner

Local B2B Lead Scanner is scanner product #1 in a planned 5-scanner business. It helps local marketers, agencies, freelancers, SDRs, and outbound teams find local business leads worth contacting in minutes, rank them by outreach potential, save the best ones, and export them.

## What This Product Does

- Scan a niche and location for local business leads
- Rank leads with explainable lead, website-quality, and outreach-priority scores
- Save, hide, tag, and annotate leads in SQLite
- Export current results or saved leads to CSV
- Run reliably in demo mode and gracefully fall back when live data is unavailable

## Tech Stack

- Next.js 16 with App Router and TypeScript
- Tailwind CSS v4
- SQLite via `better-sqlite3`
- Route handlers for scan, lead updates, and CSV export
- Config-driven product metadata for reuse across future scanners

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Copy environment defaults:

```bash
copy .env.example .env.local
```

3. Start the app:

```bash
npm run dev
```

4. Open:

- Landing page: [http://localhost:3000](http://localhost:3000)
- Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## Demo Mode

- Demo mode is enabled by default.
- The app ships with a seeded multi-city, multi-niche dataset so the scanner always demos well.
- Default scan: `Roofer`, `Orlando`, `FL`, radius `25`.
- If live mode fails, the app falls back gracefully to the demo adapter.

## Shared Product Architecture

This repo is now structured to act as a repeatable base for the other scanner products.

### Product-specific config

- Product config lives in `src/lib/config/product.ts`
- Shared config typing lives in `src/lib/config/types.ts`
- Shared SEO metadata builder lives in `src/lib/config/seo.ts`

Move per-product values into product config, including:

- product name
- domain placeholder
- headline and subheadline
- CTA copy
- pricing tiers
- entity labels
- export filename prefix
- default scan values
- metadata title and description

### Shared pieces intended to stay common across all 5 scanners

- `src/components/shared/landing/*`
- `src/components/shared/scanner/*`
- `src/lib/export/*`
- `src/lib/sources/types.ts`
- `src/lib/analytics.ts`
- `src/lib/utils.ts`
- the save/hide/tag/note interaction pattern
- the score explanation pattern
- the CSV export pattern
- the basic deployment shape

### Product-specific pieces that should change per scanner

- `src/lib/config/product.ts`
- product-specific demo data
- product-specific source adapters
- product-specific scoring weights and reasons
- product-specific entity language
- product-specific landing copy and pricing copy

## Where Important Systems Live

- Product config: `src/lib/config/product.ts`
- Scoring config: `src/lib/scoring/config.ts`
- Scoring engine: `src/lib/scoring/engine.ts`
- Demo data: `src/lib/demo/data.ts`
- Source adapters: `src/lib/sources/*`
- CSV export logic: `src/lib/export/csv.ts`
- SQLite persistence: `src/lib/db.ts`
- Marketing wrapper: `src/components/product/marketing-page.tsx`
- Dashboard wrapper: `src/components/product/dashboard-page.tsx`
- Shared landing shell: `src/components/shared/landing/landing-shell.tsx`
- Shared scanner shell: `src/components/shared/scanner/dashboard-shell.tsx`

## How To Clone This Pattern For Future Scanners

1. Copy this repo as the base for the next scanner.
2. Update `src/lib/config/product.ts` with the new product name, domain, copy, pricing, entity labels, and defaults.
3. Replace or extend demo data in `src/lib/demo`.
4. Replace or extend source adapters in `src/lib/sources`.
5. Update scoring config and reason logic in `src/lib/scoring`.
6. Keep the shared landing shell, dashboard shell, export logic, analytics hook points, and persistence pattern unless the new scanner truly needs a different flow.

## Deployment Pattern

Recommended shared hosting pattern for all 5 scanners:

- One deployable Next.js app per scanner
- Host each app on Vercel
- Assign one domain per scanner
- Keep environment variables minimal and repeatable
- Reuse the same SQLite persistence approach locally; move to a hosted database only when validation demands it

### Deployment checklist

1. Push the scanner repo to GitHub.
2. Import the repo into Vercel.
3. Set environment variables from `.env.example`.
4. Assign the scanner domain.
5. Verify landing page metadata, dashboard loads, demo mode works, and export works.

## Useful Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

## Notes For Scanner #2-#5

- Keep the shared scanner shell and landing shell unless the business model changes materially.
- Keep the adapter interface and export logic shared.
- Use product config first before editing shared UI.
- Only fork shared components when a scanner has a genuinely different workflow.

Six investing calculators: required savings, compound interest, ETF + one company, fee impact, how long money lasts, and the cost of waiting. Static site — no build step, no runtime dependencies.

## Structure

```
index.html            page shell
css/styles.css        design tokens + components (light/dark)
js/domain/            Layer 1  pure finance functions (no DOM)
js/format.js          locale formatting (bg-BG)
js/calculators/       Layer 2  one use case per calculator + registry
js/ui/                Layer 3  chart, results, panel, app (tabs/routing/theme)
js/main.js            composition root
tests/                node:test unit tests (domain + use cases)
vercel.json           static deploy config + security headers (CSP etc.)
```

Dependencies point inward: `ui → calculators → domain`. UI knows only the `Calculator`/`Result` contract in `js/calculators/base.js`.

**Add a calculator:** create a class extending `Calculator` in `js/calculators/`, return a `Result`, add it to `REGISTRY` in `index.js`.

## Conventions

Deposits and withdrawals happen at the start of each month; recurring amounts step up once a year; rates are annual fractions. All figures are illustrative assumptions, not forecasts.

## Run and test

```bash
npm test            # Node >= 20, no install needed
npx serve .         # local preview (ES modules need http, not file://)
```

## Deploy to Vercel

1. Push this folder to a Git repo and import it at vercel.com/new, **or** run `npx vercel --prod` inside the folder.
2. Framework preset: **Other**. Build command and install command: empty. Output directory: `.` (already set in `vercel.json`).

The CSP allows only same-origin scripts/styles plus Google Fonts. If you self-host the fonts, drop the two `fonts.*` entries from `vercel.json`.

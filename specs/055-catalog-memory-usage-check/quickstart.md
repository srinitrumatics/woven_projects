# Quickstart: Validate the Memory Usage Report

## Prerequisites

- Repo dependencies installed (`npm install`) and the app running (`npm run dev`), reachable
  at `http://localhost:3000` (or whichever host is used for this investigation).
- A logged-in test account session (main portal auth, per `middleware.ts`/`lib/salesforce-auth.ts`)
  whose account can reach both pages under investigation. `NEXT_PUBLIC_ALGOLIA_APP_ID` /
  `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY` must be configured for the Products Catalog page's Algolia
  search to return results at all.
- `puppeteer-core` installed to a scratch directory (not the repo) and the system's Chrome
  binary available (e.g. `/usr/bin/google-chrome`) — see `research.md` Decision 1.

## Setup

```bash
# From the repo root
npm run dev

# In a scratch directory (NOT inside the repo)
npm init -y && npm install puppeteer-core --no-save
```

Obtain a session cookie for the test account via `POST /api/auth/login` (email/password),
then cookie-inject it into a `puppeteer-core` session pointed at the system Chrome binary —
this is the same pattern already used and documented for this repo's browser verification.

## Validation scenarios

Each maps to an Acceptance Scenario in `spec.md`.

1. **Products Catalog page — baseline** (User Story 1, Scenario 1)
   - Navigate to `/products`, wait for the first Algolia page (9 hits) to render.
   - Record `page.metrics().JSHeapUsedSize` — this is the baseline row.

2. **Products Catalog page — ~1,000 and ~2,000** (User Story 1, Scenarios 2-3)
   - Repeatedly scroll the infinite-scroll sentinel into view and wait for each `showMore()`
     load to resolve (per `research.md` Decision 2), tracking the loaded hit count via
     `page.evaluate(() => document.querySelectorAll('<hit selector>').length)` or equivalent.
   - When the count first reaches ≥1,000, record a measurement (`actualCount` = the real count,
     which may be slightly over 1,000 since pages load in batches of 9).
   - Continue until the count first reaches ≥2,000; record that measurement too.

3. **Order Details "Add Products" tab — baseline, ~1,000, ~2,000** (User Story 2, Scenarios 1-3)
   - Navigate to an existing order's detail page; baseline = measurement taken *before*
     selecting the "Add Products" tab (per `research.md` Decision 4).
   - Open the tab once against the real catalog (reference data point; note the real count
     reached in `notes`).
   - Open the tab twice more with the products-fetch response intercepted and truncated to
     exactly 1,000 and 2,000 records respectively (per `research.md` Decision 3), recording a
     measurement each time, with `method` marked `simulated/truncated catalog`.

4. **Assemble the document** (User Story 3)
   - Write `specs/055-catalog-memory-usage-check/memory-usage-report.md` containing all 6
     rows (grouped by page, per `data-model.md`), the methodology note, and a summary
     judgment for each page.
   - Confirm a reader unfamiliar with the process can find every figure and both verdicts
     without asking further questions (spec SC-002).

## Expected outcome

`memory-usage-report.md` exists with exactly 6 recorded measurements (2 pages × 3
checkpoints), each labeled with page, checkpoint, actual count reached, and JS heap used;
a methodology note explaining how each checkpoint was reached (real vs. simulated data for
the Add Products tab); and a plain-language concerning/not-concerning/uncertain judgment per
page. No application file was modified in the process (verify with `git status` — should
show no changes under `app/`).

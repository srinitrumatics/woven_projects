# Implementation Plan: Browser Memory Usage Report for Product Loading

**Branch**: `wovn_mathu` | **Date**: 2026-07-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/055-catalog-memory-usage-check/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Produce a single written document recording browser (client-side) memory usage at three checkpoints — baseline, ~1,000 products loaded, ~2,000 products loaded — on two existing pages: the Products Catalog page (`app/products/ProductClientPage.tsx`, Algolia `useInfiniteHits` + `IntersectionObserver`-driven infinite scroll, `hitsPerPage=9`) and the Order Details "Add Products" tab (`app/orders/[id]/page.tsx`'s `catalog` view mode, backed by `app/orders/[id]/components/ProductCatalog.tsx`, which fetches the organization's **entire** catalog in one request via `/api/salesforce/orders?action=products` before any client-side pagination happens). This is a one-time investigation with no code or UI changes — the deliverable is the document itself, produced by driving each page with a headless browser and reading Chrome's per-page JS heap metrics at each checkpoint.

## Technical Context

**Language/Version**: N/A for the app itself (no code changes). Measurement tooling: Node.js 20 (matches `"engines": {"node": ">=20.0.0"}` in `package.json`) driving `puppeteer-core` against the system's installed Chrome — the same toolchain already used and documented for this repo's browser-based UI verification (see prior session's headless-verification approach: cookie-injected session, no form-fill, `google-chrome` at `/usr/bin/google-chrome`).

**Primary Dependencies**: `puppeteer-core` (dev-only, installed to a scratch directory outside the repo — not added to `package.json`/lockfile, since this is a one-time investigation per spec FR-005/FR-006, not a permanent capability). No new runtime dependency is added to the app.

**Storage**: N/A — no database or Salesforce schema involved; this only reads existing pages as a logged-in user would.

**Testing**: No automated test suite is added (matches the rest of this repo, which has no component/unit test runner). "Testing" for this feature *is* the investigation itself — each measurement is a manual/scripted browser run, and the deliverable document is the record of what was found.

**Target Platform**: Chrome (via `puppeteer-core`'s `page.metrics()`, which exposes `JSHeapUsedSize`/`JSHeapTotalSize` — the standard, already-available way to read a page's JS heap size without modifying the app). Findings describe Chrome's behavior specifically; the document will note this so readers don't assume identical numbers on other browsers.

**Project Type**: Existing single Next.js 15 App Router web application — this feature adds no new project, page, or route. It is an external, read-only investigation run against the already-running app (dev server or a Heroku review/staging instance, per whichever the engineer running the checks has available).

**Performance Goals**: N/A — this feature does not set or enforce a performance target; it documents observed memory figures so a future decision (e.g., whether to change how the "Add Products" tab loads its catalog) can be made with evidence. Per spec FR-006, this feature itself must not change either page's behavour or outcome.

**Constraints**: Must not modify `app/products/ProductClientPage.tsx`, `app/orders/[id]/page.tsx`, or `app/orders/[id]/components/ProductCatalog.tsx` (or any other production file) as part of this work — the investigation is external to the app (spec FR-005/FR-006). Reaching exactly 1,000/2,000 products on the "Add Products" tab (which loads its whole catalog in one fetch, not progressively) may require either a test org whose catalog is naturally that size, or a controlled test technique (e.g., response interception in the measurement script only, never in application code) per the spec's Assumptions.

**Scale/Scope**: 2 pages × 3 checkpoints = 6 measurements, plus one summary document. No ongoing/recurring scope — this is not wired into CI or any monitoring.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|-----------|-------|--------|
| I. Salesforce as Single Source of Truth | No new SF reads/writes; both pages already read products the existing way (Algolia-backed search index for the Catalog page, `lib/salesforce-service.ts`-backed API for the Add Products tab). This feature only *observes* that existing traffic; it adds none. | PASS |
| II. RBAC-First Feature Design | No new capability is exposed to any user — both pages already require an authenticated session per `middleware.ts`. The investigation uses an existing test account's normal, already-permitted access; no new `PermissionGate` or server-side check is introduced or needed. | PASS |
| III. Next.js 15 App Router Patterns | No new routes, no route param handling involved — no application code changes at all. | PASS |
| IV. Multi-Tenant Isolation | No new queries; the investigation reads whichever single test-account org is used, the same way that account's normal session already scopes its own data. No cross-org access is introduced. | PASS |
| V. Simplicity & Phase-Driven Scope | Deliberately minimal: no permanent monitoring, logging, or UI (spec FR-005) — just a script run twice (once per page) and a document. Matches "no half-finished implementations / no feature flags for work that can simply be omitted." | PASS |

No violations — Complexity Tracking table is not needed.

**Post-Phase 1 re-check**: `research.md`, `data-model.md`, and `quickstart.md` (below) confirm the approach stays observation-only, touches no application file, and adds no dependency to the shipped app. All five gates still PASS after design.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

## Project Structure

### Documentation (this feature)

```text
specs/055-catalog-memory-usage-check/
├── plan.md                       # This file (/speckit-plan command output)
├── research.md                   # Phase 0 output (/speckit-plan command)
├── data-model.md                 # Phase 1 output (/speckit-plan command)
├── quickstart.md                 # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md           # /speckit-specify output
├── memory-usage-report.md        # THE deliverable (produced during /speckit-implement)
└── tasks.md                      # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

No application source files are created, modified, or need scaffolding for this feature —
it is an external, read-only investigation against the existing app. The only "code" this
feature produces is a disposable measurement script that lives outside the repository
(consistent with how the prior `053-configure-qty-moq-control` feature's browser
verification tooling was kept in a scratch directory, never committed).

```text
app/products/ProductClientPage.tsx                          # READ ONLY — page 1 under investigation
app/orders/[id]/page.tsx                                     # READ ONLY — hosts the "Add Products" tab
app/orders/[id]/components/ProductCatalog.tsx                # READ ONLY — page 2 under investigation

specs/055-catalog-memory-usage-check/memory-usage-report.md   # NEW — the actual deliverable
```

**Structure Decision**: Existing single Next.js 15 App Router project, unmodified. This
feature's only repository artifact is the deliverable document itself
(`specs/055-catalog-memory-usage-check/memory-usage-report.md`); the measurement script that
produces the six data points is throwaway tooling run from a scratch/temp directory, not
part of the committed source tree — matching spec FR-005/FR-006 (no permanent code, no
behavior change).

## Complexity Tracking

*No violations — this section is not applicable. Constitution Check above passed with no
exceptions required.*

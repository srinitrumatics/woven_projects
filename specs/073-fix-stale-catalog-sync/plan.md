# Implementation Plan: Consistent Product Catalog Freshness Across Configure & Order Views

**Branch**: `073-fix-stale-catalog-sync` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/073-fix-stale-catalog-sync/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

`app/products/page.tsx` always shows current Algolia catalog data because it re-queries live on every InstantSearch interaction. `app/configure/page.tsx` (Quick Add) and `app/orders/[id]/components/productcatalog.tsx` (fed by `OrderClientPage.tsx`) each fetch the catalog exactly once, on mount, and never refetch — so they silently drift stale after a catalog sync. The fix is behavioral, not architectural: re-run each view's existing fetch when the user (re)opens/(re)activates that view, keep the last good data on fetch failure instead of clearing it, and add an explicit manual refresh affordance. No new services, indices, or data pipelines are introduced.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 15 (App Router)

**Primary Dependencies**: `algoliasearch` v4 (direct client-side queries), `react-instantsearch` v7 (Products page + Configure's Browse Catalog panel), existing `useToast` component for error surfacing

**Storage**: N/A for this feature — no schema or PostgreSQL changes; catalog data continues to be read from the org's existing Algolia index (populated by the existing sync worker, out of scope here)

**Testing**: No automated test framework is present for client-side UI in this repo (only `npm run test:rbac`, a manual RBAC script). Consistent with Constitution Principle V (Simplicity), this feature does not introduce a new test framework; verification is via the manual scenarios in `quickstart.md`, matching how comparable prior UI fixes in `specs/` (e.g. `069-fix-browse-catalog-mismatch`) were validated.

**Target Platform**: Web browser (existing Next.js 15 web app), no platform-specific concerns

**Project Type**: Web application (existing Next.js App Router monolith — no frontend/backend split beyond the app's existing `app/` + `app/api/` structure)

**Performance Goals**: Re-fetch behavior must feel identical to the Products page today — a single catalog fetch per open/reactivation, no continuous polling, no perceptible added latency versus the current one-shot fetch

**Constraints**: Must not change the Algolia index/queue/sync pipeline (`workers/algolia-sync-worker.js`, `lib/product-index-service.ts`) or introduce background polling while a view sits idle and unopened (per spec Assumptions); must preserve existing Quick Add / Product Catalog UX (draft persistence, selection state, pagination) untouched

**Scale/Scope**: 2 client components (`app/configure/ConfigureOrderClientPage.tsx`, `app/orders/[id]/OrderClientPage.tsx`) get a refetch-on-(re)open trigger, failure-preserves-last-good-data behavior, and a manual refresh control; `app/orders/[id]/components/productcatalog.tsx` is presentational and unaffected beyond receiving fresher props

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth** — N/A to this fix. Catalog data flows Salesforce → sync worker → Algolia (existing, untouched); the affected views read only from Algolia, exactly as they do today. PASS.
- **II. RBAC-First Feature Design** — No permission surface changes; Quick Add and the order Product Catalog tab are already behind existing route/permission gates, which this fix does not touch. PASS.
- **III. Next.js 15 App Router Patterns** — Both affected files are existing `"use client"` components; no new routes, no new dynamic params. Fix is confined to `useEffect` trigger conditions and local state handling. PASS.
- **IV. Multi-Tenant Isolation** — `indexName` continues to be resolved per-request via `getOrgConfig()` (already org-scoped, no caching across orgs); this fix does not change how the index name is derived. PASS.
- **V. Simplicity & Phase-Driven Scope** — Fix reuses existing fetch functions, existing `useToast`, and existing state; no new abstractions, no new library, no speculative generalization across the three views beyond the shared behavioral contract documented in `contracts/`. PASS.

No violations. Complexity Tracking table not needed.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/
├── products/
│   └── ProductClientPage.tsx          # Reference behavior — live InstantSearch, already fresh (no change)
├── configure/
│   ├── page.tsx                       # Resolves indexName via getOrgConfig() (no change)
│   └── ConfigureOrderClientPage.tsx    # Quick Add one-shot fetch (~L99-147) -> refetch-on-open + error preservation
└── orders/
    └── [id]/
        ├── OrderClientPage.tsx         # loadProducts() one-shot fetch (~L595-659) -> refetch-on-tab-activate + error preservation
        └── components/
            └── ProductCatalog.tsx      # Presentational only; receives fresher props, no logic change

app/api/algolia/browse/route.ts         # Existing admin-key browse endpoint feeding OrderClientPage; no change needed (already dynamic/uncached)
lib/org-config.ts                       # Existing per-request org->index resolution; no change needed
```

**Structure Decision**: Single Next.js App Router project (existing structure, no frontend/backend split). This is a targeted behavioral fix inside two existing client components (`ConfigureOrderClientPage.tsx`, `OrderClientPage.tsx`); no new files, routes, services, or directories are introduced.

## Complexity Tracking

*No constitution violations — table intentionally omitted.*

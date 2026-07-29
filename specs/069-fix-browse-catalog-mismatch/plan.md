# Implementation Plan: Fix Browse Catalog Showing Non-Salesforce Products

**Branch**: `069-fix-browse-catalog-mismatch` | **Date**: 2026-07-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/069-fix-browse-catalog-mismatch/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

The Configure Order page's Browse Catalog panel (`app/configure/page.tsx` + `app/configure/ConfigureOrderClientPage.tsx`) does a one-shot `index.search('', { hitsPerPage: 1000 })` against whatever Algolia index name it's handed. When the org-specific index can't be resolved (`getOrgConfig()` throws, or the org row has no `algoliaIndexName`), it silently falls back to `NEXT_PUBLIC_ALGOLIA_INDEX_NAME`, which in this environment is `wovn_products_local` — a local/seed index unrelated to the organization's real Salesforce-synced catalog. That is the literal source of "1000 products which is not belong to salesforce." The fix removes the silent fallback (show an empty/messaged state instead) and replaces the fixed 1000-record snapshot with the same `react-instantsearch` `useInfiniteHits` pattern already used by `app/products/ProductClientPage.tsx`, so search and incremental loading work the way the constitution requires for catalog/card views. Clarification on sync staleness (recommended default: trust the synced index snapshot, no per-product live Salesforce re-verification at list-render time) is carried as an open, low-risk assumption per the interrupted `/speckit-clarify` session — see Research.

## Technical Context

**Language/Version**: TypeScript, Next.js 15 (App Router), React 18

**Primary Dependencies**: `algoliasearch`, `react-instantsearch` (already used by `app/products/ProductClientPage.tsx`), Drizzle ORM (`lib/org-config.ts`)

**Storage**: PostgreSQL via Drizzle (`organizations` table — source of `algoliaIndexName`); Algolia (search index, source of catalog records) — no schema changes

**Testing**: Manual verification via `npm run dev` (no existing automated test harness for this client component); `npm run lint`

**Target Platform**: Web browser (desktop-first), server-rendered page + client component

**Project Type**: Web application (Next.js single project, no separate frontend/backend split)

**Performance Goals**: Initial Browse Catalog load and subsequent "load more" scroll fetches complete within standard Algolia query latency (sub-second); no fixed 1000-record ceiling

**Constraints**: Must not change the add-to-order (`+` / drag-and-drop), qty/MOQ/price-from-Salesforce-at-add-time, or order submission flows (FR-004, FR-005); must not introduce a fallback to any non-org-specific index (FR-002)

**Scale/Scope**: Single client component (`ConfigureOrderClientPage.tsx`) and its server page (`page.tsx`); no new routes, no new DB tables, no new API endpoints

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth** — PASS. Order-line qty/MOQ/price already comes from Salesforce at add-time (`unwrapProductDetails`, existing code) and is unchanged (FR-005). The catalog *list* itself is explicitly allowed to be Algolia-sourced per prior spec `056-catalog-source-algolia`, which this feature does not revisit.
- **II. RBAC-First Feature Design** — PASS / N/A. No new UI surface or permission boundary is introduced; the Configure Order page's existing auth/permission gating is unchanged (per spec Assumptions).
- **III. Next.js 15 App Router Patterns** — PASS. `page.tsx` remains a server component resolving org config via `await`; `ConfigureOrderClientPage.tsx` remains a client component. No route/param changes.
- **IV. Multi-Tenant Isolation** — PASS, and directly reinforced by this fix. Removing the fallback to a non-org-specific index (`NEXT_PUBLIC_ALGOLIA_INDEX_NAME`) closes the one place this page could show data not scoped to the requesting org.
- **V. Simplicity & Phase-Driven Scope** — PASS. Scope is bounded to the index-resolution and list-loading mechanism; no speculative abstraction is introduced (reuses the existing `react-instantsearch` pattern rather than inventing a new one).
- **Technology Stack Constraints (Catalog/card grid views)** — Currently VIOLATED by the existing raw `index.search(..., { hitsPerPage: 1000 })` call, which this feature corrects by adopting `useInfiniteHits`, consistent with `app/products/ProductClientPage.tsx`.

No unresolved violations requiring a Complexity Tracking entry.

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
app/configure/
├── page.tsx                      # Server component — resolves org's Algolia index name (FR-001, FR-002)
├── ConfigureOrderClientPage.tsx   # Client component — Browse Catalog panel (FR-003, FR-006, FR-007)
└── configure.css

app/products/
└── ProductClientPage.tsx          # Reference pattern: react-instantsearch + useInfiniteHits (already constitution-compliant)

lib/
└── org-config.ts                  # getOrgConfig() — existing org→algoliaIndexName resolution, unchanged
```

**Structure Decision**: Single Next.js project (App Router). No new directories, routes, or API endpoints — this is a targeted fix inside the existing `app/configure/` server/client pair, bringing its data-loading pattern in line with the already-established `app/products/ProductClientPage.tsx` pattern.

## Complexity Tracking

> No Constitution Check violations require justification. The one identified gap (raw `hitsPerPage: 1000` fetch instead of `useInfiniteHits`) is resolved by this feature, not carried forward.

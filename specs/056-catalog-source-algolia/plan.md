# Implementation Plan: Configure Order Catalog Sourced from Algolia

**Branch**: `wovn_mathu` | **Date**: 2026-07-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/056-catalog-source-algolia/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Split the Configure Order page's product data into two independent sources: the Browse Catalog panel and quick-add dropdown (`app/configure/page.tsx`) switch from the bulk `GET /api/salesforce/orders?action=products` Salesforce call to a direct Algolia index query (same org-scoped index already used by `app/products/page.tsx`), while the Lines table keeps sourcing quantity and MOQ from Salesforce — resolved per-product, at the moment a product is added, via the existing single-product endpoint `GET /api/salesforce/product-details`. This removes the bulk Salesforce catalog fetch from page load entirely and replaces it with (a) a lightweight Algolia search for browsing and (b) an on-demand, per-add Salesforce lookup for the fields that must stay authoritative. No change to the Lines table's existing MOQ stepper, drag-and-drop, grouping, draft persistence, or order submission.

## Technical Context

**Language/Version**: TypeScript 5 / React 19 (Next.js 15 App Router)

**Primary Dependencies**: `algoliasearch` (already a project dependency, used today in `app/products/ProductClientPage.tsx`) for the client-side catalog query; existing `lib/product-salesforce-service.ts` (`getProductDetailsFromSalesforce`) and its route `app/api/salesforce/product-details/route.ts` for the per-add Salesforce lookup; existing `lib/org-config.ts` (`getOrgConfig`) for resolving the org's Algolia index name, following the same pattern as `app/products/page.tsx`. No new dependencies.

**Storage**: N/A — no PostgreSQL schema change. Reads only: Algolia index (already synced by the existing pipeline, specs 051/052) and Salesforce (already the MOQ/qty source of truth per spec 053).

**Testing**: No automated component/unit test runner exists in this repo; validation is manual, via `npm run dev` and exercising the Configure Order page in a browser per `quickstart.md`.

**Target Platform**: Web browser (desktop-first, existing responsive Tailwind layout), served by the Next.js app.

**Project Type**: Web application (single Next.js project). This feature touches `app/configure/page.tsx` (split into a server wrapper + client component, mirroring `app/products/page.tsx` / `ProductClientPage.tsx`) and adds no new API routes — both endpoints it calls already exist.

**Performance Goals**: Catalog search results return and render within the same perceived latency as today's local array filter (sub-second for typical org catalog sizes); the per-add Salesforce lookup completes and reflects in the new line within a couple of seconds, with a visible loading state on the line so the user is never shown a fabricated qty/MOQ value.

**Constraints**: Must not change the order-lines payload shape sent to `/api/salesforce/orders` (PATCH); must not alter the existing MOQ stepper (`resolveMoq`/`normalizeQty`/`stepQty`), drag-and-drop insert logic, grouping, or `gth-configured-draft` localStorage draft behavior; the Browse Catalog panel and quick-add dropdown must keep their current position, layout, and interaction affordances ("+" button, `draggable` items).

**Scale/Scope**: Single page (`app/configure/page.tsx`), split into a small server component plus the existing client component; no new DB tables; reuses two existing API routes (`/api/salesforce/product-details`, and indirectly the existing Algolia sync pipeline — no changes to the worker).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|-----------|-------|--------|
| I. Salesforce as Single Source of Truth | Browse Catalog list now reads from Algolia, which is an existing, constitution-permitted exception already codified under "Technology Stack Constraints" ("Catalog/card grid views (e.g. Products) use Algolia..."). The Lines table's qty/MOQ — the fields that actually matter for the order — continue to be read exclusively through `lib/product-salesforce-service.ts`/`lib/salesforce-service.ts`, at add-time, per FR-003/FR-004/FR-008. No business object is written anywhere but Salesforce. | PASS |
| II. RBAC-First Feature Design | Configure Order page is already behind session middleware; this feature adds no new capability or route requiring a new permission — it only changes where two existing reads are sourced from. | PASS |
| III. Next.js 15 App Router Patterns | `app/configure/page.tsx` is refactored from a single client component into a server component (`page.tsx`, resolves `indexName` via `getOrgConfig()`, `await`s no dynamic params) rendering a client component (e.g. `ConfigureOrderClientPage.tsx`), exactly mirroring the existing `app/products/page.tsx` / `ProductClientPage.tsx` split. No new API routes are introduced — the one route this feature depends on (`app/api/salesforce/product-details/route.ts`) already exists and already follows `NextResponse.json(...)` conventions. | PASS |
| IV. Multi-Tenant Isolation | Algolia index name is resolved server-side per request via `getOrgConfig()` (org-scoped), not client-supplied. Salesforce lookups continue to use the session's `SF_ACCOUNT_ID`/`SF_CONTACT_ID`, unchanged. | PASS |
| V. Simplicity & Phase-Driven Scope | Reuses the existing manual `algoliasearch` + `index.search()` call already present in this codebase (`app/products/ProductClientPage.tsx`'s `logUnfilteredData`) rather than introducing `InstantSearch`/`useInfiniteHits` machinery the Configure Order panel doesn't need (no infinite scroll requirement here). Reuses the existing single-product Salesforce endpoint rather than adding a new one. No feature flags; no speculative abstraction. | PASS |

No violations — Complexity Tracking table is not needed.

**Post-Phase 1 re-check**: `research.md`, `data-model.md`, `contracts/`, and `quickstart.md` confirm the design stays within the existing two API routes (no new ones), the existing Algolia sync pipeline (no worker changes), and one existing page (split into server + client component, matching an established pattern). All five gates above still PASS after design.

## Project Structure

### Documentation (this feature)

```text
specs/056-catalog-source-algolia/
├── plan.md                              # This file (/speckit-plan command output)
├── research.md                          # Phase 0 output (/speckit-plan command)
├── data-model.md                        # Phase 1 output (/speckit-plan command)
├── quickstart.md                        # Phase 1 output (/speckit-plan command)
├── contracts/
│   ├── catalog-search.md                # Algolia query contract for Browse Catalog / quick-add
│   └── product-add-lookup.md            # Salesforce per-product lookup contract for add-time qty/MOQ
└── tasks.md                             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/configure/
├── layout.tsx                       # Unchanged — Sidebar wrapper
├── page.tsx                         # CHANGED — becomes a server component: requireAuth/session context (existing), resolves Algolia indexName via getOrgConfig(), renders ConfigureOrderClientPage
└── ConfigureOrderClientPage.tsx     # NEW — the existing "use client" component body moved here, taking `indexName` as a prop; catalog state now populated via Algolia search instead of the bulk Salesforce fetch; add-time (`quickAddProduct`/`addCat`/drag-drop) resolves qty/MOQ via the per-product Salesforce lookup before creating the line

app/api/salesforce/product-details/route.ts   # Unchanged — already supports the GET lookup this feature needs

lib/product-salesforce-service.ts             # Unchanged — getProductDetailsFromSalesforce already supports single-product lookup
```

**Structure Decision**: Single Next.js project, no frontend/backend split. The only structural change is splitting `app/configure/page.tsx` into a server component + client component, matching the existing `app/products/page.tsx` / `ProductClientPage.tsx` convention already established in this codebase for Algolia-backed pages. No new files outside this one page's directory; both Salesforce touch points this feature needs already exist as routes/services.

## Complexity Tracking

*No violations — table omitted.*

# Implementation Plan: Product Brand Name Sync from Salesforce

**Branch**: `071-product-brand-sync` | **Date**: 2026-07-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/071-product-brand-sync/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Every product's brand name must be reliably fetched from Salesforce (via its `Brand_Name`
lookup) and kept current in each organization's Postgres `product2` mirror table, across both
the full/bulk product Load and the real-time single-product sync, with a clear, permanent
distinction between "no brand assigned" and "not yet synced" so the catalog UI never shows a
blank field or triggers unbounded repeated lookups. The two existing sync paths
(`lib/product-load-service.ts`, `lib/product-sync-service.ts`) already fetch and persist
brand name; the gap is that they disagree on how "no brand" is represented (`''` vs `NULL`),
which makes that distinction unreliable downstream in `app/api/products/brands/route.ts` and
was the root cause of a client-side infinite-retry bug (already fixed separately). This plan
standardizes the "no brand" representation on `NULL` and updates the brands lookup API's
response contract so every consumer gets an unambiguous three-state signal, reusing the
existing admin-triggered Load run as the backfill path for historical data.

## Technical Context

**Language/Version**: TypeScript, Next.js 15 (App Router), Node.js (API routes + standalone
worker/script processes)

**Primary Dependencies**: `pg` (node-postgres, raw SQL for `product2`), Drizzle ORM (platform
tables only — `product2`'s custom columns are managed outside Drizzle), Salesforce REST/SOQL
via `lib/product-salesforce-service.ts` / `lib/product-load-service.ts`, Algolia JS client

**Storage**: PostgreSQL, per-organization schema, existing `product2` mirror table
(`gtherp__brand_name__c` column already present in every org schema)

**Testing**: Ad-hoc `tsx` scripts run against a live dev server and real org credentials
(`npm run test:product-sync` → `lib/product-sync-test.ts`, following the same convention as
`npm run test:rbac` → `lib/rbac-test.ts`); no unit test framework is present in this repo

**Target Platform**: Linux server — the Next.js app itself, plus the separately-deployed
`workers/algolia-sync-worker.js` Node process (per `Procfile`)

**Project Type**: Web application (single Next.js project); no new services or projects

**Performance Goals**: Full Load sync must complete for catalogs of several thousand active
products per org (existing `BATCH_SIZE = 500` in `product-load-service.ts`) without new
per-product overhead; brand lookups must not exceed one request per unresolved product per
client session (ties to FR-007 / SC-004)

**Constraints**: Must stay within the existing multi-tenant, org-scoped schema pattern (all
queries derive `dbSchemaName` from org config, never a client-supplied value); must not
introduce new PostgreSQL storage for business objects beyond the already-exceptioned
`product2` mirror (see Constitution Check)

**Scale/Scope**: Per-organization product catalogs of up to tens of thousands of active
products (the Load/Index split in spec 051 was itself motivated by a 22,000+ product org)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: `product2` already exists as a documented
  exception to "PostgreSQL stores only platform-managed data" (established by
  `specs/051-product-algolia-sync-split/`, predates this feature) — it is a read-side mirror
  for search/catalog display, not a second source of truth; Salesforce remains authoritative
  and every sync path reads from it. This feature adds no new PostgreSQL business-object
  storage and makes no new exception. **PASS**.
- **II. RBAC-First Feature Design**: No new user-facing capability is exposed. The brand
  lookup API (`/api/products/brands`) and catalog UI reuse existing page-level permission
  gating; the backfill path reuses the existing admin-portal-gated Load run
  (`/api/admin/organizations/{orgId}/sync/load`). No new permission surface. **PASS**.
- **III. Next.js 15 App Router Patterns**: No new dynamic route params are introduced. Any
  route touched (`app/api/products/brands/route.ts`) already follows
  `app/api/<route>/route.ts` returning `NextResponse.json(...)`. **PASS**.
- **IV. Multi-Tenant Isolation**: All reads/writes continue to be scoped to
  `"${dbSchemaName}".product2`, with `dbSchemaName` derived from the requesting org's config,
  never from a client-supplied parameter. **PASS**.
- **V. Simplicity & Phase-Driven Scope**: Change is confined to correcting existing sync
  write behavior and one API's response contract — no new services, no speculative
  abstractions, no scope beyond Phase 1 (Client Priority) product catalog. **PASS**.

No violations; Complexity Tracking is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/071-product-brand-sync/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── products-brands-api.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

This is a single existing Next.js 15 App Router project; no new top-level directories or
projects are introduced. Work is confined to existing files:

```text
app/
├── api/
│   ├── products/brands/route.ts                        # brand lookup API — response contract change
│   └── admin/organizations/[id]/sync/...                # existing Load/Index trigger + status (reused as-is for backfill)
└── configure/ConfigureOrderClientPage.tsx                # catalog/browse UI consuming brand data (retry-loop fix already applied)

lib/
├── product-sync-service.ts       # real-time single-product SF -> product2 sync (brand write path)
├── product-load-service.ts       # full/bulk SF -> product2 load (brand write path; backfill mechanism)
├── product-index-service.ts      # product2 -> Algolia push (unaffected)
├── admin-sync-helpers.ts         # product_sync_runs tracking (unaffected, reused)
└── product-sync-test.ts          # existing verification script (npm run test:product-sync)

db/
└── salesforce-schema.ts          # product2 Drizzle shape (brand column intentionally not modeled here, unchanged)
```

**Structure Decision**: Single Next.js project, existing layout. No new files at the project-
structure level are required by this feature — only edits to the two sync write paths
(`lib/product-load-service.ts`, `lib/product-sync-service.ts`) and the brand lookup API
(`app/api/products/brands/route.ts`), per `research.md` Decisions 2 and the contract in
`contracts/products-brands-api.md`.

## Complexity Tracking

*No violations — table intentionally omitted.*

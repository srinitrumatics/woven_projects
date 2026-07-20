# Implementation Plan: Split Product Load & Search-Index Sync with Progress Indicator

**Branch**: `[051-product-algolia-sync-split]` | **Date**: 2026-07-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/051-product-algolia-sync-split/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

The admin-portal organization page currently exposes a single "Add Products to Index" action
(`POST /api/admin/organizations/[id]/sync`) that, in one HTTP request, (1) pulls all products
for the org from Salesforce, (2) upserts them one row at a time into that org's
`<schema>.product2` Postgres table, and (3) immediately pushes every row to Algolia via
`saveObjects`. For organizations with 22,000+ products this blows past Heroku's 30-second
router timeout (H12) long before Algolia is even reached, and the admin gets no visibility
into how far the run got.

This feature splits that single action into two independently triggerable, asynchronous
actions — **Load Products** (Salesforce → `product2`) and **Index Products**
(`product2` → Algolia) — each tracked by a persisted run record so progress survives page
reloads and the run continues even if the browser tab is closed. "Index Products" is
re-routed through the org's already-provisioned `algolia_sync_queue` /
`algolia-sync-worker.js` infrastructure (currently provisioned but unused by this flow)
instead of a second synchronous Algolia call, giving a natural, already-built mechanism for
incremental progress and per-record retry. The organization page polls a new status endpoint
every few seconds to render a progress indicator/log and enable/disable each button based on
run state.

## Technical Context

**Language/Version**: TypeScript, Next.js 15 (App Router), Node.js (Heroku `web` + `worker` dynos)

**Primary Dependencies**: `next`, `drizzle-orm` + `pg` (Postgres access), `algoliasearch` (Admin
API client, already used by `sync/route.ts` and `workers/algolia-sync-worker.js`), Salesforce
REST/SOQL over `fetch` (no SDK — see `getSalesforceToken`/`fetchAllProducts` in the existing
sync route)

**Storage**: PostgreSQL. Platform-managed tables via Drizzle (`db/schema.ts`: `organizations`,
etc.). Per-organization raw-SQL-provisioned schema (`<sanitized-schema>.product2`,
`.algolia_sync_queue`, `.algolia_sync_log`, `.algolia_index_config` — provisioned by
`app/api/admin/organizations/provision/route.ts` from `db/algolia.sql`). This feature adds:
a `product_sync_runs` table per org schema (new, via migration) to track Load runs, and a
`batch_id` column + `algolia_index_runs` table added to the existing per-org schema (new, via
migration) to track Index runs against `algolia_sync_queue`.

**Testing**: No automated test framework is configured in this repo (`package.json` has no
jest/vitest/playwright). Existing convention for backend logic verification is a standalone
`tsx` script (`lib/rbac-test.ts`, run via `npm run test:rbac`). This feature follows that same
convention (see `quickstart.md`) plus manual verification of the two-button UI in the admin
portal, consistent with `CLAUDE.md`'s guidance to verify UI changes in a browser.

**Target Platform**: Server: Heroku `web` dyno (Next.js) + existing `worker` dyno
(`workers/algolia-sync-worker.js`, unchanged process, now actually fed by this flow). Client:
admin-portal pages in evergreen desktop browsers (existing admin-portal scope).

**Project Type**: Web application (single Next.js repo — no separate frontend/backend split)

**Performance Goals**: Both "Load Products" and "Index Products" must complete for
organizations with 22,000+ products without hitting Heroku's 30s per-request router timeout;
the status endpoint must reflect progress that is at most ~5-10 seconds stale (matching the
existing worker's 5s polling interval), per SC-002.

**Constraints**: Must not introduce a new deployment target or process type — reuse the
existing `web` + `worker` dyno topology (`Procfile`). Must not write Salesforce business
objects into net-new tables beyond the job-tracking metadata already implied by Principle I's
"Algolia sync queue entries" carve-out (see Constitution Check). Must preserve the existing
per-org schema isolation model (Principle IV) — no cross-org queries.

**Scale/Scope**: Verified target of at least 25,000 products per organization (spec FR-008 /
SC-001); admin portal is single-tenant-per-request (one org page open at a time per admin),
so no requirement for cross-org concurrent-run dashboards in this feature.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: ✅ PASS (with a documented pre-existing
  exception). The constitution states Postgres MUST NOT store business objects, but
  explicitly carves out "Algolia sync queue entries" as allowed platform-managed data. The
  `<schema>.product2` cache table already exists today (provisioned by
  `provision/route.ts`, populated by the current combined sync route) — it predates this
  feature and this plan does not expand its scope or introduce a new business-object cache.
  The two new/modified tables this feature adds (`product_sync_runs`, `algolia_index_runs`,
  and a `batch_id` column on `algolia_sync_queue`) are run/job metadata, not business objects,
  and fall squarely within the existing "Algolia sync queue" carve-out. All product reads for
  every other page in the app continue to go through `lib/salesforce-service.ts` — unchanged.
- **II. RBAC-First Feature Design**: ✅ PASS. This feature only touches admin-portal routes,
  which use the independent admin-auth system (`lib/admin-auth-service.ts`), not the main
  portal's `PermissionGate`/`hasPermission` RBAC system. No new permission surface is
  introduced; access is gated exactly as the existing combined sync button is today.
- **III. Next.js 15 App Router Patterns**: ✅ PASS. New/changed API routes follow
  `app/api/<route>/route.ts` with `await params`; no new page routes are added (existing
  organization detail/create pages are modified in place, not replaced).
- **IV. Multi-Tenant Isolation**: ✅ PASS. All new tables live inside the same per-org
  provisioned schema as `product2`/`algolia_sync_queue` today; every query continues to be
  scoped by the org's `sanitizedSchema`, derived server-side from the org record (never from a
  client-supplied schema name).
- **V. Simplicity & Phase-Driven Scope**: ✅ PASS. No new job-queue technology, message broker,
  or SSE/websocket layer is introduced — the design reuses the existing worker-polls-a-queue
  pattern already running in production for Algolia, and adds one small new table for the Load
  side rather than building a generic "job runner" abstraction.

No violations requiring the Complexity Tracking table.

## Project Structure

### Documentation (this feature)

```text
specs/051-product-algolia-sync-split/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── sync-api.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/
├── (admin-portal)/
│   └── admin-portal/
│       └── organizations/
│           ├── [id]/page.tsx          # MODIFIED: split single button into Load + Index buttons, progress UI
│           └── create/page.tsx        # MODIFIED: same split in the create-org wizard's sync step
├── api/
│   └── admin/
│       └── organizations/
│           └── [id]/
│               └── sync/
│                   ├── route.ts       # MODIFIED (or removed): superseded by load/index below, or kept as thin deprecated alias
│                   ├── load/
│                   │   └── route.ts   # NEW: POST — trigger Salesforce → product2 run
│                   ├── index/
│                   │   └── route.ts   # NEW: POST — trigger product2 → Algolia queue run
│                   └── status/
│                       └── route.ts   # NEW: GET — poll run progress by type + runId

db/
├── schema.ts                          # unchanged (platform tables only; per-org tables stay raw-SQL)
├── algolia.sql                        # MODIFIED: add batch_id column + algolia_index_runs table to the per-org template
└── migrations/                        # NEW Drizzle-generated migration if any platform-level tracking is added

workers/
└── algolia-sync-worker.js             # UNCHANGED: already claims/processes algolia_sync_queue rows

lib/
└── product-sync-service.ts            # referenced for consistency; single-record combined path left as-is (out of scope)
```

**Structure Decision**: Existing single-repo Next.js App Router application — no new
frontend/backend split. Work is confined to three areas already established by the codebase:
(1) two admin-portal pages that currently render the combined sync button, (2) the
`app/api/admin/organizations/[id]/sync/**` route family, split into `load`, `index`, and
`status` sub-routes, and (3) the per-org raw-SQL schema template (`db/algolia.sql`) that
`provision/route.ts` stamps out for each organization, extended with run-tracking tables. The
existing `worker` dyno (`workers/algolia-sync-worker.js`) is reused unmodified as the
execution engine for the Index step.

## Complexity Tracking

*No Constitution Check violations — table intentionally left empty.*

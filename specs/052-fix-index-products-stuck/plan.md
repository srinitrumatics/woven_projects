# Implementation Plan: Fix Index Products Button Hang & Preserve Sync Trigger

**Branch**: `[052-fix-index-products-stuck]` | **Date**: 2026-07-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/052-fix-index-products-stuck/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Two defects in the just-shipped Load/Index split (spec 051):

1. `lib/product-load-service.ts`'s `runLoadAsync` actively **deletes** the `algolia_sync_queue`
   rows that `product2`'s existing `sf_product2_algolia_sync_trigger` auto-creates on every
   write (added to stop Load from "automatically starting indexing"). The user wants that
   trigger's bookkeeping left alone — it's existing, desired behavior, not something this
   feature should touch.
2. Clicking "Index Products" enqueues work into `algolia_sync_queue` but nothing ever
   processes it unless `workers/algolia-sync-worker.js` happens to be running as a **separate,
   manually-started process** (`npm run start:worker`, or a scaled-up Heroku `worker` dyno).
   When it isn't running — which is the common case for local dev and easy to forget in
   deployment — the button's progress indicator polls forever at 0% with no way to tell the
   admin anything is wrong. This was directly reproduced while validating spec 051: progress
   only advanced once the worker was manually started in a separate terminal.

The fix: (1) remove the trigger-suppressing delete from Load, and (2) make "Index Products"
self-sufficient — the click itself kicks off an in-process drain of the queue (the same
fire-and-forget background-task pattern already used by Load), so progress always happens
regardless of whether the standalone worker is separately running. The standalone worker
remains fully compatible to run alongside in production (queue claiming is already
concurrency-safe via `FOR UPDATE SKIP LOCKED`) — it's just no longer a hard dependency.

## Technical Context

**Language/Version**: TypeScript, Next.js 15 (App Router), Node.js (Heroku `web` + `worker` dynos) — unchanged from spec 051.

**Primary Dependencies**: `algoliasearch` (Admin API client — now called directly from
`lib/product-index-service.ts` as well as from `workers/algolia-sync-worker.js`), `pg` /
`drizzle-orm` (unchanged).

**Storage**: PostgreSQL. No schema changes in this fix — reuses the `product_sync_runs`,
`algolia_index_runs`, and `algolia_sync_queue.batch_id` additions from spec 051 as-is. This
fix is behavior-only.

**Testing**: Same as spec 051 — no automated test framework configured; verification via
`quickstart.md` scenarios and the existing `lib/product-sync-test.ts` (`npm run
test:product-sync`), re-run against this fix.

**Target Platform**: Heroku `web` dyno (Next.js) — the drain now also runs here, in-process,
triggered by the Index click. The existing `worker` dyno (`workers/algolia-sync-worker.js`)
is unchanged and remains a valid, concurrency-safe way to also drain the same queue (e.g. to
spread load across dynos in production), but is no longer required for the button to work.

**Project Type**: Web application (single Next.js repo) — unchanged.

**Performance Goals**: An "Index Products" click must show the indexed count increasing
within about a minute and reach a definite end state without the admin starting any other
process, per spec SC-002/SC-003.

**Constraints**: Must not alter `sf_product2_algolia_sync_trigger` or the automatic
enqueue-on-write behavior it provides (FR-001). Must not turn "Index Products" into a single
long-blocking HTTP request — the drain still has to run detached from the request/response
cycle, for the same Heroku 30s-router-timeout reason spec 051 was built around.

**Scale/Scope**: Same target as spec 051 (25,000+ products); this fix does not change scale
targets, only reliability of the Index step.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: ✅ PASS. No change to how/where product data is
  read from Salesforce; this fix only touches Postgres-side queue processing and Algolia push
  logic, both already within the "Algolia sync queue" carve-out established in spec 051.
- **II. RBAC-First Feature Design**: ✅ PASS. No new routes or permission surface; same
  admin-portal auth as before.
- **III. Next.js 15 App Router Patterns**: ✅ PASS. No route signature changes — `POST
  .../sync/index` keeps its existing contract; only its internal behavior (what happens after
  responding 202) changes.
- **IV. Multi-Tenant Isolation**: ✅ PASS. The in-process drain operates on exactly one org's
  schema per invocation (the schema resolved from the click's org id), identical in scoping to
  every other query in this feature area.
- **V. Simplicity & Phase-Driven Scope**: ⚠️ SEE COMPLEXITY TRACKING. The in-process drain
  necessarily duplicates a meaningful slice of `workers/algolia-sync-worker.js`'s claim →
  push-to-Algolia → mark-complete/failed logic rather than sharing code with it. This is a
  deliberate, bounded exception — see the Complexity Tracking table below for why sharing code
  was rejected.

## Project Structure

### Documentation (this feature)

```text
specs/052-fix-index-products-stuck/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command) — confirms no schema changes
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── contracts/            # Phase 1 output (/speckit-plan command)
│   └── behavior-changes.md
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
lib/
├── product-load-service.ts     # MODIFIED: remove the trigger-suppressing DELETE (lines ~197-209)
└── product-index-service.ts    # MODIFIED: startIndexRun fires a new drainIndexQueue(...) in-process
                                 #   drain loop (fire-and-forget, mirrors runLoadAsync's pattern);
                                 #   new helper functions for claiming/pushing/marking queue rows

app/api/admin/organizations/[id]/sync/
└── index/route.ts              # UNCHANGED signature; now benefits from the self-sufficient drain

workers/
└── algolia-sync-worker.js      # UNCHANGED — remains valid to run in production; concurrency-safe
                                 #   alongside the new in-process drain via existing SKIP LOCKED claiming
```

**Structure Decision**: No new files, no new routes, no schema migrations. This is a targeted
fix confined to two existing service files from spec 051 (`product-load-service.ts`,
`product-index-service.ts`), following the same in-process-async-task pattern already
established for Load.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| `lib/product-index-service.ts` duplicates `workers/algolia-sync-worker.js`'s claim/push/mark-to-Algolia logic instead of sharing one implementation | "Index Products" must make progress without depending on a separately-running process (the reported bug); that requires the same claim-and-push capability to also exist inside the Next.js web process | *Import `workers/algolia-sync-worker.js` directly*: rejected — it's a plain Node CommonJS script with top-level side effects (env loading, CLI-arg schema resolution, and auto-starting a multi-schema polling loop on load); requiring it from the web app would risk starting an unwanted second multi-schema worker loop inside every web dyno. *Extract a shared TS module both could import*: rejected for this fix's scope — the worker runs via plain `node`, not through a TS build step, so sharing a `.ts` module would require adding compilation to the worker's run path, a larger change than this bug fix warrants. The duplicated logic is kept intentionally minimal (claim → push → mark only, skipping the worker's facet-auto-configuration and Salesforce-freshness-check features) to limit drift risk. |

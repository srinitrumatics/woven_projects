# Implementation Plan: Fix Order Line Deletion Not Persisting on Save

**Branch**: `070-fix-orderline-delete-persist` | **Date**: 2026-07-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/070-fix-orderline-delete-persist/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Users delete an order line in the order details page's "My Order" tab, save, and the line still appears after a reload or later reopen. Code investigation (see `research.md`) found the delete already fires a genuine Salesforce DELETE and the reload already fires a genuine refetch — this is not a client-side caching bug. Three concrete, in-repo defects were found instead: (1) delete/update success is judged solely by HTTP status (`response.ok`), never by inspecting the Apex REST response body, so a silent server-side no-op reads as success; (2) the post-save reload is gated by a hardcoded `setTimeout(..., 5000)` "let Salesforce propagate" workaround instead of a confirmed refetch; (3) `handleRemoveProduct`/`handleQuantityChange`/`handleAddProduct` use non-functional `setOrderProducts(orderProducts.filter/map(...))` closures, opening a state-race window between opening the delete confirmation dialog and the user confirming it. The technical approach is to harden delete/save confirmation and remove the timing dependency within `app/orders/[id]/page.tsx` and `lib/salesforce-service.ts`, while flagging that if the symptom persists after this fix, the remaining cause is server-side (Apex REST, outside this repository).

## Technical Context

**Language/Version**: TypeScript 5, Next.js 15 (App Router), React 19

**Primary Dependencies**: `lib/salesforce-service.ts` (Salesforce Apex REST client — `deleteOrderFromSalesforce`, `updateOrderFromSalesforce`, `getOrderLinesFromSalesforce`), `app/api/salesforce/orders/route.ts` (DELETE/PATCH/GET route handler), `app/orders/[id]/page.tsx` + `app/orders/[id]/components/MyOrderTable.tsx` (My Order tab UI)

**Storage**: N/A — order/order-line data is mastered in Salesforce (Apex REST `gtherp/orderlines`, `gtherp/orders`) per Constitution Principle I; no PostgreSQL schema involved in this fix

**Testing**: No unit/integration test framework is configured in this repo (no jest/vitest; `package.json` only has `tsx`-based scripts like `test:rbac`, `test:product-sync`). Verification for this fix is manual/scripted: exercise the delete → save → reload/reopen flow against a live Salesforce session (see `quickstart.md`) and confirm via the Apex REST response body/logs that the delete was actually applied.

**Target Platform**: Web (Next.js server + browser client), deployed to Heroku

**Project Type**: Single Next.js web application (no separate frontend/backend repos) — fix is contained within existing `app/orders/[id]/` and `lib/salesforce-service.ts`

**Performance Goals**: No new performance target; the fix specifically removes reliance on an arbitrary fixed delay (`setTimeout(..., 5000)`) in favor of confirming completion before reflecting new state, so perceived latency should track actual backend confirmation time rather than a fixed 5s wait

**Constraints**: Must preserve Salesforce as the single source of truth accessed exclusively through `lib/salesforce-service.ts` (Constitution I); must not introduce PostgreSQL writes for order/order-line data; must preserve existing RBAC gating around order editing (Constitution II) unchanged; must keep Next.js 15 App Router param/auth patterns (Constitution III) unchanged

**Scale/Scope**: Localized bug fix — no new routes, no new DB schema, no new pages; touches `app/orders/[id]/page.tsx`, `lib/salesforce-service.ts`, and (only if response-body verification requires new fields) `app/api/salesforce/orders/route.ts`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth** — PASS. Fix stays entirely within the existing `lib/salesforce-service.ts` read/write functions; no new direct SOQL outside that file, no PostgreSQL writes for business data. The fix in fact strengthens this principle by verifying the Salesforce response instead of trusting an HTTP status alone.
- **II. RBAC-First Feature Design** — PASS (no change). Order line delete is already gated by existing permission checks in the order details page; this fix does not add new user-facing capability, so no new gates are required.
- **III. Next.js 15 App Router Patterns** — PASS (no change). No new routes or param handling introduced; existing `React.use(params)` / route handler conventions in `app/orders/[id]/page.tsx` and `app/api/salesforce/orders/route.ts` are preserved as-is.
- **IV. Multi-Tenant Isolation** — PASS (no change). Delete/update/get calls already scope by `accountId`/`contactId` derived from the authenticated session; this fix does not alter that scoping.
- **V. Simplicity & Phase-Driven Scope** — PASS. Fix is a targeted correction (functional state updates, response-body verification, confirmed-refetch instead of fixed timer) with no new abstractions, feature flags, or speculative generalization.

No violations — Complexity Tracking section is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/070-fix-orderline-delete-persist/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── contracts/            # Phase 1 output (/speckit-plan command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/
├── orders/
│   └── [id]/
│       ├── page.tsx                       # handleRemoveProduct, handleSubmitOrder, fetchOrder — fix location
│       └── components/
│           └── MyOrderTable.tsx           # "My Order" tab list UI (renders order lines, delete affordance)
└── api/
    └── salesforce/
        └── orders/
            └── route.ts                    # DELETE/PATCH/GET handlers for order + order lines

lib/
└── salesforce-service.ts                   # deleteOrderFromSalesforce, updateOrderFromSalesforce,
                                             # getOrderLinesFromSalesforce — Apex REST client functions
```

**Structure Decision**: Single Next.js App Router project (per Constitution III and Technology Stack Constraints — no separate frontend/backend repos). This is a targeted bug fix with no new routes or files: changes are confined to the existing order details page (`app/orders/[id]/page.tsx`), its "My Order" tab component (`app/orders/[id]/components/MyOrderTable.tsx`, if the delete affordance itself needs touching), and the existing Salesforce service layer (`lib/salesforce-service.ts`) plus its route handler (`app/api/salesforce/orders/route.ts`) only if response-body verification requires surfacing additional fields through the API response.

## Complexity Tracking

*No Constitution Check violations — this section is not applicable.*

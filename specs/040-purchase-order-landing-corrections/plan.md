# Implementation Plan: Purchase Order Landing Page — Required Corrections

**Branch**: `040-purchase-order-landing-corrections` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/040-purchase-order-landing-corrections/spec.md`

## Summary

Fix one confirmed gap on the Purchase Order landing page and verify/lock in everything else. Direct code inspection (cross-checked against prior spec 030, commit `1d4b194`, which already delivered correct column order/labels, Supplier/Hybrid hyperlink gating, sticky column, headers, pagination, and default DESC sort) found one real gap: `app/purchase-orders/page.tsx:85-87` maps `productCost: p.Total_Product_Cost__c || 0`, `shippingCost: p.Total_Shipping_Charges__c || 0`, `totalCost: p.Total_Cost__c || 0` — checking only the unprefixed field name, while this request explicitly cites the namespaced (`gtherp__`-prefixed) API names for all three fields. This diverges from the dual-namespace fallback pattern already established elsewhere in this portal (Box dimension fields on Shipments, Brand Name across multiple pages, Ship/Delivered dates on Shipments). The fix adds the `gtherp__`-prefixed fallback to all three financial fields, matching the established convention. Everything else on this page is verification-only.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: `Link` (Next.js), `SortableHeader`, `Pagination`, `useSortableData`, `useResizableColumns`, `displayCell()`/`formatCurrency()`/`formatDate()` — all existing in the codebase, same primitives used by every prior table-correction feature (016-039)

**Storage**: N/A — read-only Salesforce data proxied through `lib/purchase-order-service.ts`; no SOQL in-repo. The fix is a pure client-side field-mapping correction; no new API routes or endpoint changes required.

**Testing**: Visual/functional — run `npm run dev`, open the Purchase Order landing page, and verify per `quickstart.md`, with particular attention to a purchase order whose cost data is populated only under the namespaced field names.

**Target Platform**: Browser (Next.js SSR + client components)

**Performance Goals**: No degradation — the fix is a three-field fallback addition with zero overhead

**Constraints**: No new API routes; no new SF Apex changes; no DB schema changes; no new columns

**Scale/Scope**: 1 file touched (`app/purchase-orders/page.tsx` — 3 field-mapping fixes, all on adjacent lines)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | The fix is a client-side field-mapping correction against data already returned by the existing service layer; no new query logic |
| II — RBAC-First | ✅ PASS | No permission structure changed; existing Supplier/Hybrid `isManufacturer`-gated hyperlink visibility preserved unchanged |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes; existing client component only |
| IV — Multi-Tenant Isolation | ✅ PASS | No org-scoped query logic changed |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | Narrowest possible scope — three isolated field-mapping fixes confirmed by direct code inspection, mirroring the already-proven dual-namespace pattern used elsewhere, no speculative rework of already-correct code |

No violations. No Complexity Tracking entry required.

**Post-design re-check** (after Phase 0/1 research): The fix is isolated to three adjacent lines in a single file and touches no shared state, no other component, and no data-fetching logic beyond reading three additional already-available fields. All five principles remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/040-purchase-order-landing-corrections/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command) — skipped, no new external interface
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (files in scope)

```text
app/purchase-orders/page.tsx   # Total Cost/Shipping/Grand Total dual-namespace fallback fix (3 lines)
```

**Structure Decision**: Single Next.js App Router project (existing structure, no new files) — three isolated field-mapping fixes in one file.

## Complexity Tracking

No constitution violations — table not required.

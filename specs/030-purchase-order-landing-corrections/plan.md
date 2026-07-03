# Implementation Plan: Purchase Order Landing Page Corrections

**Branch**: `030-purchase-order-landing-corrections` | **Date**: 2026-07-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/030-purchase-order-landing-corrections/spec.md`

## Summary

Correct column order, labels, and hyperlinks on the Purchase Order landing page (`app/purchase-orders/page.tsx`), expanding it from 16 to 26 columns. Unusually for this series of corrections, most of the "new" columns require **no new field mapping at all** — Ship to Contact, Drop Ship, Shipping, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, and Goods Receipt Date are all already read from the API in the existing mapping, simply never rendered. The genuine fixes are: a confirmed data bug where "Total Cost" displays the grand-total value instead of the product-cost subtotal (both values already exist under different mapped names); Purchase Order # converted from plain text to a real hyperlink; Customer PO's incorrect hyperlink removed; the Proposal Name/Proposal # split (new field, same fallback-chain pattern already used twice elsewhere); one genuinely new field (Payment Terms); and one column removed (Shipment). The Supplier-vs-Hybrid conditional hyperlink requirement is **already implemented** by this page's existing `isManufacturer` gate — no new logic needed, just formalized as an explicit requirement. Headers, sticky column, pagination, and descending sort are all already correct and are locked in as regression guards. All changes are pure frontend edits to one page file plus its shared types file; no new routes, no schema changes.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: Tailwind CSS, `Link` (Next.js), `SortableHeader`, `useSortableData`, `Pagination`, `useResizableColumns`, `formatCurrency()`/`formatDate()`/`displayCell()` — all existing in the codebase, same primitives used by every prior table-correction feature (016-029)

**Storage**: N/A — read-only Salesforce data via `/api/purchase-orders` (used identically by this page today); the frontend maps whichever fields it needs from the `Purchase_Order__c` raw array

**Testing**: Visual/functional — run `npm run dev`, open the Purchase Order landing page as both a Supplier-type and Hybrid-type account, verify column order, labels, hyperlinks, and gating per `quickstart.md`

**Target Platform**: Browser (Next.js SSR + client components)

**Performance Goals**: No degradation — most new columns render already-fetched data with zero new API calls; negligible overhead from the two new field mappings (`proposalNumber`, `paymentTerms`)

**Constraints**: No new API routes; no new SF Apex changes; no DB schema changes; changes scoped to `app/purchase-orders/page.tsx` and `app/purchase-orders/types.ts`. One field mapping carries residual live-org verification risk (a dedicated Proposal Number field, assumed unavailable, falling back to Proposal Name) — the same open question already documented and never resolved in features 023 and 028; it degrades gracefully to the fallback value regardless.

**Scale/Scope**: 2 files touched (landing page + shared types), 1 table, 26 total column definitions (11 net-new/split, 5 relabeled, 1 removed, 1 bug-fixed, 8 unchanged)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | Reads continue to flow through the existing `/api/purchase-orders` endpoint; no new DB writes; nearly all "new" columns render data already present in the existing API response |
| II — RBAC-First | ✅ PASS | No permission structure changed; the Supplier-vs-Hybrid gating requirement is satisfied by the page's existing `isManufacturer` check — no new gate introduced |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes; modifying one existing client component and its shared types file only |
| IV — Multi-Tenant Isolation | ✅ PASS | No org-scoped query logic changed |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | Targeted corrections to one existing page; reuses the exact `SortableHeader`/`useSortableData`/`Pagination`/`useResizableColumns`/`isManufacturer` primitives already proven on this same page — no new abstractions |

No violations. No Complexity Tracking entry required.

**Post-design re-check** (after Phase 0/1 research): The Total Cost/Grand Total fix reassigns which existing field feeds which existing label — no new data risk, since both values were already being fetched correctly, just displayed under the wrong column. The Proposal Name/Proposal # split and the Shipment column removal do not affect any other consumer of `PurchaseOrder` — this page is the sole consumer of its own inline mapping. All five principles remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/030-purchase-order-landing-corrections/
├── plan.md              # This file
├── research.md          # Phase 0 output — current-state audit and field-mapping confirmation
├── data-model.md        # Phase 1 output — field-mapping catalogue and column-order delta
└── quickstart.md        # Phase 1 output — validation scenarios (including Supplier/Hybrid gating)

(no contracts/ — this feature exposes no new API routes or external interfaces)
```

### Source Code (files modified)

```text
app/purchase-orders/
├── types.ts   # PurchaseOrder interface: add proposalNumber, remove shipmentId/shipmentName
└── page.tsx   # mappedPOs mapping, useResizableColumns config, header row, body row, EmptyState colSpan
```

**Structure Decision**: Single Next.js App Router project (existing structure, no new files) — same minimal-scope pattern as features 016-029, here touching one landing page file, closely mirroring the Shipments landing page correction (feature 028) which shares nearly identical column semantics.

## Complexity Tracking

No constitution violations — table not required.

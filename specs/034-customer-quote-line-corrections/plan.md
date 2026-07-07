# Implementation Plan: Customer Quote Line Page — Fulfillment & Returns Corrections

**Branch**: `034-customer-quote-line-corrections` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/034-customer-quote-line-corrections/spec.md`

## Summary

Correct column order, labels, and hyperlinks across five line-level tables on the Customer Quote Line detail page: the Fulfillment tab's three sub-tabs (Sales Order Lines, Shipping Manifest Lines, Invoice Lines) and the Returns tab's two sub-tabs (RMA Lines, Credit Memo Lines). Direct code inspection confirmed this page has never been corrected (greenfield) and found several genuine defects: the recurring dead `brand: undefined` bug (same pattern as features 031/033) on all five tables; a link/unlink swap on Shipping Manifest Lines where the parent "Shipping Manifest" is hyperlinked while the row's own record is plain text; a partial version of the same swap on Invoice Lines (its own record is plain text while the parent "Invoice" is linked — both need to end up linked); Invoice Lines' "Invoice Qty" column reading `Invoiced_Qty__c` under a "Total Order Qty" label the request expects to source `Total_Order_Qty__c`; a broken default sort on all five tables where both parent tabs initialize `useSortableData`/manual sort with `key: 'name'`, a field that doesn't exist on any row interface (all use `lineName`), making the initial sort a permanent no-op; and a wrong Fulfillment sub-tab order (Sales Order Lines, Invoice Lines, Shipping Manifest Lines — Invoice Lines and Shipping Manifest Lines are swapped relative to the requested order). Additionally, no table in this page currently passes `truncate={false}` to any header, so headers currently wrap/truncate by default — the no-wrap requirement is a genuine fix, not a lock-in. All changes are frontend edits to the five sub-tab components plus their two shared parent tab containers (`QuoteLineFulfillmentsTab.tsx`, `QuoteLineReturnsTab.tsx`); no new routes (two hyperlink targets, `/shipments/{id}/lines/{lineid}` and `/invoices/{id}/lines/{lineid}`, already exist), no schema changes.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: Tailwind CSS, `Link` (Next.js, already imported but unused in 4 of the 5 sub-tab files), `SortableHeader`, `Pagination`, `useSortableData`, `useResizableColumns`, `formatCurrency()`/`formatDate()`/`displayCell()` — all existing in the codebase, same primitives used by every prior table-correction feature (016-033)

**Storage**: N/A — read-only Salesforce data via `/api/salesforce/quotes?...&action={fulfillment|returns}&objectName=Customer_Quote_Line__c` (proxied through `lib/quote-service.ts`); field-mapping for all five tables happens client-side inside the two parent tab containers' `useEffect` fetch blocks (`QuoteLineFulfillmentsTab.tsx` lines 103-207, `QuoteLineReturnsTab.tsx` lines 125-251), not in the sub-tab components themselves or in an API route

**Testing**: Visual/functional — run `npm run dev`, open a customer quote line's detail page, and verify all five tables' column order, labels, hyperlinks, sort, and pagination per `quickstart.md`

**Target Platform**: Browser (Next.js SSR + client components)

**Performance Goals**: No degradation — column reordering, new field mappings, and a corrected sort key add negligible overhead; no new network calls

**Constraints**: No new API routes; no new SF Apex changes; no DB schema changes. New "Proposed Product" columns on all five tables and new Box Length/Width/Height on Shipping Manifest Lines carry residual live-org field-availability risk — all degrade gracefully to "-"/plain text if unavailable, consistent with how features 031/033 handled equivalent risk. "Customer Quote Line" hyperlinks assume the current page's own quote id can be reused as the link target's quote id (see spec Assumptions) since no distinct parent-quote id field is captured on any of these five line objects today.

**Scale/Scope**: 7 files touched (5 sub-tab components + 2 parent tab containers), 5 tables, 16+20+17+15+15 = 83 total column definitions today, changing to match each table's FR-defined target count (15, 20, 17, 15, 15)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | Reads continue to flow through the existing `/api/salesforce/quotes` endpoint; no new DB writes; new field references (Proposed Product, Box Length/Width/Height, Brand fix) read from the same raw record shape already returned by the API, mapped client-side per the existing pattern |
| II — RBAC-First | ✅ PASS | No permission structure changed; this page currently has no `isManufacturer`/`isRestricted` gating and none is being introduced — all hyperlinks added/fixed in this feature (Customer Quote Line, Proposed Product, Shipping Manifest Line #, Invoice Line) are ungated, matching the two hyperlinks that already exist on this page today (Shipping Manifest, Invoice) |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes; modifying existing client components only; no changes to the page's `params` handling |
| IV — Multi-Tenant Isolation | ✅ PASS | No org-scoped query logic changed |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | Targeted corrections to five existing tables; reuses the exact `SortableHeader`/`Pagination`/`useSortableData`/`useResizableColumns` primitives already used on this same page — no new abstractions, no new routes |

No violations. No Complexity Tracking entry required.

**Post-design re-check** (after Phase 0/1 research): All column/label/hyperlink changes are UI-only edits to five sibling sub-tab components and their two parent containers, none of which are consumed by any other page. The sort-key fix (`'name'` → each table's own `lineName`) is a bug fix restoring intended behavior, not new logic. All five principles remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/034-customer-quote-line-corrections/
├── plan.md              # This file
├── research.md          # Phase 0 output — current-state audit of all five tables
├── data-model.md        # Phase 1 output — field-mapping catalogues and column-order deltas per table
└── quickstart.md        # Phase 1 output — validation scenarios

(no contracts/ — this feature exposes no new API routes or external interfaces)
```

### Source Code (files in scope)

```text
app/quotes/[id]/lines/[lineid]/components/
├── QuoteLineFulfillmentsTab.tsx             # Field-mapping fixes (Brand, Proposed Product), sort-key fix,
│                                             # sub-tab order fix, widths config additions/removals
├── QuoteLineSalesOrderLinesSubTab.tsx       # Column order/labels/hyperlinks (US1)
├── QuoteLineShippingManifestLinesSubTab.tsx # Column order/labels/hyperlinks + link/unlink swap (US2)
├── QuoteLineInvoiceLinesSubTab.tsx          # Column order/labels/hyperlinks + own-link fix + field fix (US3)
├── QuoteLineReturnsTab.tsx                  # Field-mapping fixes (Brand, Proposed Product), sort-key fix,
│                                             # widths config additions
├── QuoteLineRMALinesSubTab.tsx              # Column order/labels/hyperlinks (US4)
└── QuoteLineCreditMemoLinesSubTab.tsx       # Column order/labels/hyperlinks + table-fixed consistency fix (US5)
```

**Structure Decision**: Single Next.js App Router project (existing structure, no new files) — same minimal-scope pattern as features 016-033, here touching five sibling line-level tables sharing two parent containers that own each sub-table's data-fetch/mapping, sort state, and column widths.

## Complexity Tracking

No constitution violations — table not required.

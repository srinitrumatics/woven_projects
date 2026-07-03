# Implementation Plan: Inventory Landing Page & Inventory Details Page Corrections

**Branch**: `026-inventory-landing-details-corrections` | **Date**: 2026-07-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/026-inventory-landing-details-corrections/spec.md`

## Summary

Correct column labels, formatting, and one hyperlink on the My Inventory landing page (`app/inventory/page.tsx`), and correct column order, labels, and one field fallback on the Inventory Details page (`app/inventory/[id]/page.tsx`). Column order on My Inventory is already correct — the fix there is a dead field (Brand Name never mapped), a missing color rule (Qty Available), a bold-weight cell (Total OH Value), a non-semantic hyperlink (Product Name), and three relabels. Inventory Details needs a genuine column reorder (Location/Site move to the end; Total CV columns move up), a missing RMA fallback on the PO # column, a spacing typo (ShippingManifest), a bold-weight cell (Total OH Value, renamed from Total Price), and five relabels. Pagination, header no-wrap/sticky-column behavior, and default sort order are already correct on both pages and are locked in as regression guards rather than changed. All changes are pure frontend edits to two existing page files; no new routes, no schema changes, no new API calls.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: Tailwind CSS, `Link` (Next.js), `SortableHeader`, `useSortableData`, `Pagination`, `useResizableColumns`, `displayCell()`/`formatCurrency()`/`formatNumber()`/`formatDate()` — all existing in the codebase, same primitives used by every prior table-correction feature (016-025)

**Storage**: N/A — read-only Salesforce data via `/api/salesforce/inventory` (thin proxy to the `gtherp/inventory` Apex REST endpoint in `lib/inventory-service.ts`, no server-side field mapping); the frontend maps whichever fields it needs

**Testing**: Visual/functional — run `npm run dev`, open My Inventory and a product's Inventory Details page, verify column order, labels, formatting, and the PO/RMA fallback per `quickstart.md`

**Target Platform**: Browser (Next.js SSR + client components)

**Performance Goals**: No degradation — relabeling, reordering existing JSX blocks, and adding one field mapping/one conditional class add negligible overhead

**Constraints**: No new API routes; no new SF Apex changes; no DB schema changes; changes scoped to `app/inventory/page.tsx` and `app/inventory/[id]/page.tsx`. One field mapping carries live-org verification risk (the RMA fallback field on Inventory Details, assumed `RMA_Name`) and is documented in `research.md`; it degrades gracefully to showing only the PO # (or "-") if unavailable.

**Scale/Scope**: 2 files touched (My Inventory landing page, Inventory Details page), 2 tables, 14 + 18 = 32 total column definitions (no new columns — relabels, reorders, and formatting fixes only)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | Reads continue to flow through the existing `/api/salesforce/inventory` endpoint via `lib/inventory-service.ts`; no new DB writes; one additive field-mapping fix (Brand Name) and one additive field fallback (RMA) |
| II — RBAC-First | ✅ PASS | No permission structure changed; the existing `isManufacturer` gate on My Inventory's Action column is untouched |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes; modifying two existing pages only; `app/inventory/[id]/page.tsx` already correctly unwraps `params` via `use()` |
| IV — Multi-Tenant Isolation | ✅ PASS | No org-scoped query logic changed |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | Targeted corrections to two existing pages; reuses existing `SortableHeader`/`useSortableData`/`Pagination`/`useResizableColumns` primitives with no new abstractions; pagination and sort are confirmed already-correct and left untouched |

No violations. No Complexity Tracking entry required.

**Post-design re-check** (after Phase 0/1 research): The Brand Name fix and RMA fallback are additive field reads with graceful degradation to "-"; the Inventory Details column reorder is a pure JSX reordering of existing `SortableHeader`/`<td>` pairs with no `useResizableColumns` key changes; My Inventory's Product Name hyperlink swap (`<button>` → `Link`) preserves the exact same navigation target and styling. No other consumer of `InventoryPosition` or the raw `Inventory_Position__c` records is affected by any of these changes. All five principles remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/026-inventory-landing-details-corrections/
├── plan.md              # This file
├── research.md          # Phase 0 output — current-state audit of both pages
├── data-model.md        # Phase 1 output — field-mapping catalogues and column-order deltas
└── quickstart.md        # Phase 1 output — validation scenarios for both pages

(no contracts/ — this feature exposes no new API routes or external interfaces)
```

### Source Code (files modified)

```text
app/inventory/
├── types.ts                 # No interface changes required (brand?: string already declared)
├── page.tsx                 # mappedInventory: add brand field; header row: 3 relabels; body row: Link swap, color class, weight removal
└── [id]/
    └── page.tsx              # header row: reorder 4 pairs, 6 relabels; body row: RMA fallback, weight removal, matching reorder
```

**Structure Decision**: Single Next.js App Router project (existing structure, no new files) — same minimal-scope pattern as features 016-025, here touching two sibling pages under `app/inventory/` instead of tab components under a shared `[id]/components/` directory (this feature area has no tab-component split).

## Complexity Tracking

No constitution violations — table not required.

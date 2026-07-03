# Implementation Plan: Shipping Manifest Line Page Corrections

**Branch**: `029-shipping-manifest-line-corrections` | **Date**: 2026-07-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/029-shipping-manifest-line-corrections/spec.md`

## Summary

Apply the identical column-correction pattern already delivered one level up (feature 027, the shipping manifest parent detail page) to the shipping manifest line page's Inventory Positions and Serial Number Logs tabs. Both tabs are already reachable — no tab-bar wiring is needed. Inventory Positions needs an 18→11 column reduction (Purchase Order, Unit Cost, Rack, Bay, Level-Position, Sales Order, Shipping Manifest removed; Rack/Bay/Level-Position consolidated into the existing Location field), a Brand Name fix (currently hardcoded blank), and a new Product Name hyperlink. Serial Number Logs needs a 10→7 column reduction (Shipping Manifest Line, Ship Date, Ship to Account, Active removed), a net-new Brand Name column, and a new Product Name hyperlink. Both tabs also have a **confirmed bug** independent of the request: their default-sort initializer references a capitalized `Name` key that doesn't match the actual mapped field (`name`), so the default sort is currently a complete no-op — fixing this to `{ key: 'name', direction: 'asc' }` both corrects the bug and delivers the requested ascending order in one change. Neither tab currently paginates. All changes are pure frontend edits to two existing tab components; no new routes, no schema changes.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: Tailwind CSS, `Link` (Next.js), `SortableHeader`, `useSortableData`, `Pagination`, `useResizableColumns`, `formatDate()`/`formatNumber()`/`displayCell()` — all existing in the codebase, same primitives used by every prior table-correction feature (016-028)

**Storage**: N/A — read-only Salesforce data via `/api/salesforce/shipments` (used identically by both tabs today, with `objectName=Shipping_Manifest_Line__c`); the frontend maps whichever fields it needs from the `Inventory_Position__c`/`Serial_Number_Log__c` raw arrays

**Testing**: Visual/functional — run `npm run dev`, open a shipping manifest line's detail page, verify both tabs' column order, labels, hyperlinks, pagination, and sort per `quickstart.md`

**Target Platform**: Browser (Next.js SSR + client components)

**Performance Goals**: No degradation — column removal/relabeling, one new field mapping per tab, and adding pagination reduce rendering cost for lines with many positions/logs rather than increasing it

**Constraints**: No new API routes; no new SF Apex changes; no DB schema changes; changes scoped to `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx` and `SerialNumbersTab.tsx`. One field mapping carries live-org verification risk on each tab (the Product Name hyperlink's target id field, assumed `Product_Name__c || Product__c`) — the same open item already documented and never resolved for the equivalent columns at the shipping manifest (parent) level in feature 027; it degrades gracefully to plain text if unavailable.

**Scale/Scope**: 2 files touched, 2 tables, 11 + 7 = 18 total column definitions (down from 18 + 10 = 28 today)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | Reads continue to flow through the existing `/api/salesforce/shipments` endpoint; no new DB writes; one additive field-mapping fix (Brand Name) per tab plus one new field (`productId`) per tab |
| II — RBAC-First | ✅ PASS | No permission structure changed; neither tab currently applies role-based link gating and this feature does not introduce it |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes; modifying two existing client components only |
| IV — Multi-Tenant Isolation | ✅ PASS | No org-scoped query logic changed |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | Targeted corrections mirroring an already-validated pattern (feature 027) applied one level deeper; reuses the exact `Pagination`/`SortableHeader`/`useSortableData` primitives already in use on these same two files — no new abstractions |

No violations. No Complexity Tracking entry required.

**Post-design re-check** (after Phase 0/1 research): The Brand Name fix and new `productId` field on both tabs are additive reads with graceful "-"/plain-text degradation. The sort-initializer fix (`Name` → `name`) corrects a pre-existing bug rather than introducing new behavior beyond what the spec already requires (ascending order). Column removals are UI-only — neither `InventoryTab.tsx` nor `SerialNumbersTab.tsx` is imported or consumed by any other component besides `BottomTabs.tsx` on this same page. All five principles remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/029-shipping-manifest-line-corrections/
├── plan.md              # This file
├── research.md          # Phase 0 output — current-state audit of both tabs
├── data-model.md        # Phase 1 output — field-mapping catalogues and column-order deltas
└── quickstart.md        # Phase 1 output — validation scenarios for both tabs

(no contracts/ — this feature exposes no new API routes or external interfaces)
```

### Source Code (files modified)

```text
app/shipments/[id]/lines/[lineid]/
└── components/
    ├── InventoryTab.tsx        # mapping, widths, header/body row, sort-initializer fix, add Pagination
    └── SerialNumbersTab.tsx    # mapping, widths, header/body row, sort-initializer fix, add Pagination
```

**Structure Decision**: Single Next.js App Router project (existing structure, no new files) — same minimal-scope pattern as features 016-028, here re-applying an already-validated correction (feature 027) one directory level deeper.

## Complexity Tracking

No constitution violations — table not required.

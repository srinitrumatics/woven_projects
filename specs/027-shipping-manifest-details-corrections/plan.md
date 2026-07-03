# Implementation Plan: Shipping Manifest Details Page Corrections

**Branch**: `027-shipping-manifest-details-corrections` | **Date**: 2026-07-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/027-shipping-manifest-details-corrections/spec.md`

## Summary

Enable the already-built-but-disabled "Inventory Positions" tab on the Shipping Manifest Details page (`app/shipments/[id]/components/ShipmentTabs.tsx`), and correct column order, labels, hyperlinks, headers, pagination, and sort across all three tabs — Shipping Manifest Lines (`ShipmentLinesTab.tsx`), Inventory Positions (`InventoryTab.tsx`), and Serial Number Logs (`SerialNumbersTab.tsx`). All three tabs currently hand-roll their own local sort state instead of using the project-standard `useSortableData` hook (a pre-existing constitution deviation this feature resolves in passing) and none currently paginate. Shipping Manifest Lines needs the largest column lift: a brand-name dead field (matching a bug pattern already fixed on Invoice Lines and My Inventory), one genuinely new column (Proposed Product), two new hyperlinks on existing columns (Customer Quote Line, Product Name), and five columns removed to match the exact requested list. Inventory Positions needs the tab uncommented plus a large column reduction (18 → 11 columns, consolidating four separate location fields into one). Serial Number Logs needs a net-new Brand Name column, a new Product Name hyperlink, and four columns removed. All changes are pure frontend updates to three existing tab components plus one tab-bar component; no new routes, no schema changes.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: Tailwind CSS, `Link` (Next.js), `SortableHeader`, `useSortableData`, `Pagination`, `useResizableColumns`, `displayCell()`/`formatCurrency()`/`formatDate()`/`formatNumber()` — all existing in the codebase, same primitives used by every prior table-correction feature (016-026)

**Storage**: N/A — read-only Salesforce data via `/api/salesforce/shipments` (generic `tabName`-based passthrough in `lib/shipment-service.ts`, no server-side field mapping); the frontend maps whichever fields it needs from `Shipping_Manifest_Line__c`, `Inventory_Position__c`, and `Serial_Number_Log__c` raw arrays

**Testing**: Visual/functional — run `npm run dev`, open a shipping manifest's detail page, verify all three tabs' column order, labels, hyperlinks, pagination, and sort per `quickstart.md`

**Target Platform**: Browser (Next.js SSR + client components)

**Performance Goals**: No degradation — column reordering, relabeling, additional field mappings, migrating to `useSortableData`, and adding pagination to all three tabs add negligible overhead (and pagination *improves* rendering cost for manifests with many lines/positions/logs)

**Constraints**: No new API routes; no new SF Apex changes; no DB schema changes; changes scoped to `app/shipments/[id]/components/ShipmentTabs.tsx`, `ShipmentLinesTab.tsx`, `InventoryTab.tsx`, and `SerialNumbersTab.tsx`. Three field/route mappings carry live-org verification risk (Proposed Product's and Product Name's id fields for their new hyperlinks on two tabs, and the Inventory Positions "Location" field's RBLP interpretation) and are documented in `research.md`; all degrade gracefully to plain text/"-" if unavailable.

**Scale/Scope**: 4 files touched (3 tab components + 1 tab-bar component), 3 tables, 19 + 11 + 7 = 37 total column definitions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | Reads continue to flow through the existing `/api/salesforce/shipments` generic passthrough via `lib/shipment-service.ts`; no new DB writes; field-mapping additions only |
| II — RBAC-First | ✅ PASS | No permission structure changed; none of the three tabs currently apply role-based link gating and this feature does not introduce it |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes; modifying three existing client components and one tab-bar component only |
| IV — Multi-Tenant Isolation | ✅ PASS | No org-scoped query logic changed |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | Targeted corrections to three existing tabs, reusing exactly the `Pagination`/`SortableHeader`/`useSortableData` primitives already proven elsewhere in the portal — no new abstractions. Migrating all three tabs' hand-rolled sort state to `useSortableData` *resolves* a pre-existing deviation from the constitution's "UI Component Conventions" clause (all data-table landing pages MUST use `SortableHeader` + `useSortableData`) rather than introducing one |

No violations. No Complexity Tracking entry required.

**Post-design re-check** (after Phase 0/1 research): The Brand Name fixes (all three tabs), Proposed Product/Product Name hyperlink additions (Shipping Manifest Lines, Inventory Positions, Serial Number Logs), and the box-field `gtherp__` fallbacks are additive field reads with graceful degradation to "-"/plain text. The Inventory Positions "Location" consolidation and column removals across all three tabs are UI-only (no other consumer of these tab components exists — each is used only by this one detail page). The `useSortableData` migration changes internal state management only, not the public component props (`shipmentId`/`accountId`/`contactId` stay the same); no other file imports or depends on these three components' internals. All five principles remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/027-shipping-manifest-details-corrections/
├── plan.md              # This file
├── research.md          # Phase 0 output — current-state audit of all three tabs
├── data-model.md        # Phase 1 output — field-mapping catalogues and column-order deltas
└── quickstart.md        # Phase 1 output — validation scenarios for all three tabs

(no contracts/ — this feature exposes no new API routes or external interfaces)
```

### Source Code (files modified)

```text
app/shipments/[id]/
└── components/
    ├── ShipmentTabs.tsx        # uncomment the "Inventory Positions" tab entry
    ├── ShipmentLinesTab.tsx    # interface, mapLine, widths, header/body row, sort migration, add Pagination
    ├── InventoryTab.tsx        # interface, mapItem, widths, header/body row, sort migration, add Pagination
    └── SerialNumbersTab.tsx    # interface, mapLog, widths, header/body row, sort migration, add Pagination
```

**Structure Decision**: Single Next.js App Router project (existing structure, no new files) — same minimal-scope pattern as features 016-026, here touching three sibling tab components sharing one parent page's tab-bar/data-fetch wiring (`app/shipments/[id]/page.tsx`, which needs no changes since its Inventory-tab plumbing already exists).

## Complexity Tracking

No constitution violations — table not required.

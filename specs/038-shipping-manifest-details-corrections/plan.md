# Implementation Plan: Shipping Manifest Details Page — Shipping Manifest Lines, Inventory Positions, Serial Number Logs Corrections

**Branch**: `038-shipping-manifest-details-corrections` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/038-shipping-manifest-details-corrections/spec.md`

## Summary

Fix two confirmed defects on the Shipping Manifest Details page and verify/lock in everything else. Direct code inspection (cross-checked against prior spec 027, commit `19148f9`, which already delivered correct column order/labels, tab reachability, Brand Name mappings, Box dimension mappings, and header/sticky/pagination/sort behavior on all three tabs) found two real bugs: (1) `app/shipments/[id]/components/ShipmentLinesTab.tsx` maps both `customerQuoteId` and `customerQuoteLineId` from the same single field (`Customer_Quote_Line__c`), then links to `/quotes/${customerQuoteLineId}` — passing a quote-line ID into a route that expects a top-level quote ID, producing a broken/incorrect link; the fix is to capture the parent quote ID separately (`Customer_Quote__c`) and route to the nested `/quotes/{quoteId}/lines/{lineId}` pattern, matching the already-correct convention in `app/purchase-orders/[id]/components/POLinesTable.tsx:45-46,139`. (2) `app/shipments/[id]/components/InventoryTab.tsx:63` sources "Location" from `raw.Inventory_Location_Name`, while the Inventory Landing Page (`app/inventory/[id]/page.tsx:255`, `app/inventory/page.tsx`) sources it from the raw field `Location` directly with no mapping — the fix is to fall back through `raw.Location` first to match the landing page's convention as explicitly requested ("RBLP - Use same as Inventory Landing Page"). This plan scopes corrective work to these two isolated changes; the Serial Number Logs tab and all remaining behavior on the other two tabs are verification-only.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: `Link` (Next.js), `SortableHeader`, `Pagination`, `useSortableData`, `useResizableColumns`, `displayCell()`/`formatCurrency()`/`formatNumber()`/`formatDate()` — all existing in the codebase, same primitives used by every prior table-correction feature (016-037)

**Storage**: N/A — read-only Salesforce data proxied through an Apex REST endpoint (`lib/shipment-service.ts`); no SOQL in-repo. The two fixes are pure client-side field-mapping and URL-construction corrections; no new API routes or endpoint changes are required, assuming the Shipping Manifest Line record already exposes a `Customer_Quote__c` (parent quote) field alongside `Customer_Quote_Line__c` — consistent with the same dual-field convention already relied upon on Purchase Order Lines (`POLinesTable.tsx`) from the same underlying Apex proxy family.

**Testing**: Visual/functional — run `npm run dev`, open a shipping manifest's detail page, and verify per `quickstart.md`, with particular attention to clicking a populated Customer Quote Line value and comparing an Inventory Position's Location value against the Inventory Details page for the same position.

**Target Platform**: Browser (Next.js SSR + client components)

**Performance Goals**: No degradation — both fixes are small field-mapping/URL-construction changes with zero overhead

**Constraints**: No new API routes; no new SF Apex changes anticipated (assumes `Customer_Quote__c` is already present in the Shipping Manifest Line payload, consistent with the sibling Purchase Order Line proxy); no DB schema changes; no new columns

**Scale/Scope**: 2 files touched (`ShipmentLinesTab.tsx` — 1 hyperlink fix; `InventoryTab.tsx` — 1 field-mapping fix); `SerialNumbersTab.tsx` requires verification only, no code changes anticipated

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | Both fixes are client-side field-mapping/URL corrections against data already returned by the existing Apex REST proxy; no new query logic |
| II — RBAC-First | ✅ PASS | No permission structure changed |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes; the fix routes to an already-existing nested dynamic route (`/quotes/[id]/lines/[lineid]`) |
| IV — Multi-Tenant Isolation | ✅ PASS | No org-scoped query logic changed |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | Narrowest possible scope — two isolated field-mapping/URL fixes confirmed by direct code inspection, no speculative rework of already-correct code |

No violations. No Complexity Tracking entry required.

**Post-design re-check** (after Phase 0/1 research): Both fixes are isolated to their respective single files and touch no shared state, no other component, and no data-fetching logic beyond reading one additional already-available field. All five principles remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/038-shipping-manifest-details-corrections/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command) — skipped, no new external interface
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (files in scope)

```text
app/shipments/[id]/components/ShipmentLinesTab.tsx   # Customer Quote Line hyperlink fix (dual-ID capture + nested route)
app/shipments/[id]/components/InventoryTab.tsx       # Location field-mapping fix (fall back through raw.Location first)
app/shipments/[id]/components/SerialNumbersTab.tsx   # Verification only — no code changes anticipated
```

**Structure Decision**: Single Next.js App Router project (existing structure, no new files) — two isolated field-mapping/URL-construction fixes across two files, plus a verification pass on a sibling tab component.

## Complexity Tracking

No constitution violations — table not required.

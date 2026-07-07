# Implementation Plan: Shipping Manifest Line Page — Inventory Positions & Serial Number Logs Corrections

**Branch**: `039-shipping-manifest-line-corrections` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/039-shipping-manifest-line-corrections/spec.md`

## Summary

Fix one confirmed defect on the Shipping Manifest Line page's Inventory Positions tab and verify/lock in everything else. Direct code inspection (cross-checked against prior spec 029, commit `19148f9`, which already delivered correct column order/labels/hyperlinks and header/sticky/pagination/sort behavior on both tabs, and against the sibling manifest-level fix from spec 038) found one real bug: `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx:60` sources "Location" from `item.gtherp__Inventory_Location__c || item.Inventory_Location_Name || item.Inventory_Location__c || ""` — a set of fields that never includes the raw field the Inventory Landing Page actually uses (`Location`, per `app/inventory/[id]/page.tsx:255`). This is the same bug already fixed one level up, at the parent shipping-manifest level, in spec 038 (`app/shipments/[id]/components/InventoryTab.tsx:63`), but the fix was never propagated down to this line-level tab. The fix here mirrors the manifest-level fix exactly: fall back through `item.Location` first. The Serial Number Logs tab and all remaining behavior on the Inventory Positions tab are verification-only.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: `Link` (Next.js), `SortableHeader`, `Pagination`, `useSortableData`, `useResizableColumns`, `displayCell()`/`formatNumber()`/`formatDate()` — all existing in the codebase, same primitives used by every prior table-correction feature (016-038)

**Storage**: N/A — read-only Salesforce data proxied through an Apex REST endpoint (`lib/shipment-service.ts`); no SOQL in-repo. The fix is a pure client-side field-mapping correction; no new API routes or endpoint changes required.

**Testing**: Visual/functional — run `npm run dev`, open a shipping manifest line's detail page, and verify per `quickstart.md`, with particular attention to comparing an Inventory Position's Location value against the Inventory Details page for the same position.

**Target Platform**: Browser (Next.js SSR + client components)

**Performance Goals**: No degradation — the fix is a one-line field-mapping change with zero overhead

**Constraints**: No new API routes; no new SF Apex changes; no DB schema changes; no new columns

**Scale/Scope**: 1 file touched (`InventoryTab.tsx` — 1 field-mapping fix); `SerialNumbersTab.tsx` requires verification only, no code changes anticipated

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | The fix is a client-side field-mapping correction against data already returned by the existing Apex REST proxy; no new query logic |
| II — RBAC-First | ✅ PASS | No permission structure changed |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes; existing client component only |
| IV — Multi-Tenant Isolation | ✅ PASS | No org-scoped query logic changed |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | Narrowest possible scope — one isolated field-mapping fix confirmed by direct code inspection, mirroring the already-proven fix from spec 038, no speculative rework of already-correct code |

No violations. No Complexity Tracking entry required.

**Post-design re-check** (after Phase 0/1 research): The fix is isolated to a single file and touches no shared state, no other component, and no data-fetching logic beyond reading one additional already-available field. All five principles remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/039-shipping-manifest-line-corrections/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command) — skipped, no new external interface
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (files in scope)

```text
app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx      # Location field-mapping fix (fall back through item.Location first)
app/shipments/[id]/lines/[lineid]/components/SerialNumbersTab.tsx  # Verification only — no code changes anticipated
```

**Structure Decision**: Single Next.js App Router project (existing structure, no new files) — one isolated field-mapping fix in one file, plus a verification pass on a sibling tab component.

## Complexity Tracking

No constitution violations — table not required.

# Implementation Plan: Data Table Scroll Container Excludes Pagination

**Branch**: `044-table-scroll-pagination-fix` | **Date**: 2026-07-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/044-table-scroll-pagination-fix/spec.md`

## Summary

Fix six data-table components where the `<Pagination>` component is rendered inside the same `overflow-x-auto` scroll wrapper as the `<table>` element, so the table's horizontal scrollbar renders below pagination instead of directly below the table. The fix is purely structural: wrap the existing scroll div and the existing `Pagination` element in a new outer container, move the scroll div's closing tag to immediately after `</table>`, and keep `Pagination` as a sibling after that — exactly the pattern already used correctly by 60 of the 66 portal data tables (e.g., `app/supplier-bills/[id]/lines/[lineid]/components/SBLDebitMemoLinesTab.tsx`, fixed in feature 042). No column, sort, data-fetch, or pagination-logic changes.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: Tailwind CSS (`overflow-x-auto`, `flex flex-col`), `Pagination` (`@/components/ui/Pagination`) — no new dependencies; this reuses the exact wrapper pattern already present in 60 other components in this codebase

**Storage**: N/A — no data-fetching or field-mapping changes; purely a JSX structure/layout fix

**Testing**: Visual/functional — run `npm run dev`, open each of the six affected tables, narrow the viewport so the table requires horizontal scrolling, and confirm pagination stays visible/fixed below the table per `quickstart.md`

**Target Platform**: Browser (Next.js SSR + client components)

**Performance Goals**: No impact — a pure JSX nesting change with no new elements beyond one wrapping `<div>` per file

**Constraints**: No new API routes, no data/type changes, no changes to sort/filter/pagination logic. Scoped to exactly six files, each requiring the same three-part edit: (1) wrap the existing scroll div + `Pagination` in a new outer `<div>`, (2) move the scroll div's closing `</div>` to immediately after `</table>`, (3) leave `Pagination`'s props and the table's own JSX completely unchanged. Confirmed via two independent audit methods (div-depth tracking and nearest-`</table>`-to-`<Pagination>` gap analysis) plus manual reads of all six files that this is the full and only defect present.

**Scale/Scope**: 6 files touched, 1 structural edit per file, 0 files with logic changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | No data-fetching or field-mapping code touched; purely JSX layout structure |
| II — RBAC-First | ✅ PASS | No permission logic touched |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes; six existing client components edited for JSX structure only |
| IV — Multi-Tenant Isolation | ✅ PASS | No query logic touched |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | Reuses the exact wrapper pattern (`flex flex-col` outer div, `overflow-x-auto` inner div, `Pagination` sibling) already proven correct on 60 other tables in this codebase — no new abstraction, no new component |

No violations. No Complexity Tracking entry required.

**Post-design re-check** (after Phase 0/1 research): Confirmed via research.md that each of the six files' current root return element is exactly the `overflow-x-auto` div itself (not already wrapped in an outer container), so each fix requires adding one new outer `<div>` — a mechanical, low-risk change with no shared state or prop changes. All five principles remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/044-table-scroll-pagination-fix/
├── plan.md              # This file
├── research.md          # Phase 0 output — full audit methodology and per-file findings
├── data-model.md        # Phase 1 output — before/after JSX structure per file
└── quickstart.md        # Phase 1 output — validation scenarios for all six tables

(no contracts/ — this feature exposes no new API routes or external interfaces)
```

### Source Code (files modified)

```text
app/invoices/[id]/components/InvoiceLineItems.tsx
app/shipments/[id]/components/InventoryTab.tsx
app/shipments/[id]/components/SerialNumbersTab.tsx
app/shipments/[id]/components/ShipmentLinesTab.tsx
app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx
app/shipments/[id]/lines/[lineid]/components/SerialNumbersTab.tsx
```

**Structure Decision**: Single Next.js App Router project (existing structure, no new files) — six independent, single-file structural edits with no shared dependency between them (each component owns its own return JSX with no shared layout wrapper to fix once).

## Complexity Tracking

No constitution violations — table not required.

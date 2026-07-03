# Implementation Plan: Purchase Order Line Page Corrections

**Branch**: `031-purchase-order-line-corrections` | **Date**: 2026-07-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/031-purchase-order-line-corrections/spec.md`

## Summary

Correct column order, labels, and hyperlinks across the four tables on the Purchase Order Line detail page: Supplier Bill Lines, Serial Number Logs, and the Returns tab's RTV Lines and Debit Memo Lines sub-tabs. Three of the four tables share an identical bug: a "Purchase Order Line" column that redundantly re-displays the very record already being viewed, where "Proposed Product" belongs instead. The Serial Number Logs tab needs relabeling to match the naming convention already established on the corrected Shipping Manifest Serial Number Logs tabs (features 027/029), plus a net-new Brand Name column. None of the four tables currently apply any default sort at all (not merely descending — genuinely unsorted), and none of the three tables needing Customer Quote Line/Proposed Product hyperlinks currently have any account-type gating — this is new logic, unlike the Purchase Order landing page (feature 030) where the equivalent gating already existed. The gating pattern itself is fully proven, though: the sibling PO-**detail**-level Returns tables (`PORTVTable.tsx`/`PODebitMemoTable.tsx`) already implement the exact `useUserSession`/`isManufacturer` pattern this feature needs, self-contained per component with no prop drilling required. All changes are pure frontend edits to four existing tab components; no new routes, no schema changes.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: Tailwind CSS, `Link` (Next.js), `SortableHeader`, `useSortableData`, `Pagination`, `useResizableColumns`, `useUserSession`, `formatCurrency()`/`formatDate()`/`displayCell()` — all existing in the codebase, same primitives used by every prior table-correction feature (016-030)

**Storage**: N/A — read-only Salesforce data via `/api/purchase-orders` (used identically by this page today, with `action=bills`/`returns`/`serialNumbers`); all four tab components receive raw, unmapped Salesforce field shapes directly as props — there is no intermediate mapping layer to edit, only each component's own TypeScript interface

**Testing**: Visual/functional — run `npm run dev`, open a purchase order line's detail page as both a Supplier-type and Hybrid-type account, verify all four tabs' column order, labels, hyperlinks, gating, and sort per `quickstart.md`

**Target Platform**: Browser (Next.js SSR + client components)

**Performance Goals**: No degradation — column relabeling/reordering and one new `useUserSession` call per component (already used elsewhere on this exact page tree) add negligible overhead

**Constraints**: No new API routes; no new SF Apex changes; no DB schema changes; changes scoped to the four tab components under `app/purchase-orders/[id]/lines/[lineid]/components/`. Several field mappings carry residual live-org verification risk (the Proposed Product id field, the Supplier Bill Line's own hyperlink target, whether `brand`/`Brand_Name__c` is actually populated on three of the four tables, and the Purchase Order # field on Serial Number Logs) — all degrade gracefully to plain text/"-" if unavailable.

**Scale/Scope**: 4 files touched, 4 tables, 14 + 10 + 12 + 13 = 49 total column definitions (down from 14 + 11 + 12 + 14 = 51 today)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | Reads continue to flow through the existing `/api/purchase-orders` endpoint; no new DB writes; all new field references read from the same raw record shape already returned by the API |
| II — RBAC-First | ✅ PASS | No permission structure changed; the new Supplier/Hybrid gating on three tables reuses the exact `isManufacturer` mechanism already proven at the PO landing and PO-detail levels — not a new gate, an extension of an existing one to previously-ungated columns |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes; modifying four existing client components only; no changes to `page.tsx`'s `params` handling |
| IV — Multi-Tenant Isolation | ✅ PASS | No org-scoped query logic changed |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | Targeted corrections to four existing components; reuses the exact `SortableHeader`/`useSortableData`/`Pagination`/`useResizableColumns`/`useUserSession`/`isManufacturer` primitives already proven elsewhere in this same page tree — no new abstractions, no prop-drilling introduced |

No violations. No Complexity Tracking entry required.

**Post-design re-check** (after Phase 0/1 research): The "Purchase Order Line" → "Proposed Product" swap and the Supplier Bill Line/RTV Line/Debit Memo Line removals are UI-only — none of these four components are consumed by any other page. Adding `useUserSession` to three components mirrors an already-shipped pattern (`PORTVTable.tsx`) with no shared-state risk since each component computes its own local `isManufacturer` value. All five principles remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/031-purchase-order-line-corrections/
├── plan.md              # This file
├── research.md          # Phase 0 output — current-state audit of all four tables
├── data-model.md        # Phase 1 output — field-mapping catalogues and column-order deltas
└── quickstart.md        # Phase 1 output — validation scenarios (including Supplier/Hybrid gating)

(no contracts/ — this feature exposes no new API routes or external interfaces)
```

### Source Code (files modified)

```text
app/purchase-orders/[id]/lines/[lineid]/components/
├── POSupplierBillLinesTable.tsx    # interface, widths, header/body row, sort init, add isManufacturer gating
├── poserialnumberloglinestab.tsx   # interface, widths, header/body row, sort init (no gating)
├── PORtvLinesTab.tsx               # interface, widths, header/body row, sort init, add isManufacturer gating
└── PODebitMemoLinesTab.tsx         # interface, widths, header/body row, sort init, add isManufacturer gating
```

**Structure Decision**: Single Next.js App Router project (existing structure, no new files) — same minimal-scope pattern as features 016-030, here touching four sibling tab components sharing one parent page's raw-data-fetch wiring (`page.tsx`, which needs no changes since gating is self-contained per component, following the exact precedent already set by `PORTVTable.tsx` one level up).

## Complexity Tracking

No constitution violations — table not required.

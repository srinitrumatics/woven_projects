# Implementation Plan: Orders Landing Page — Required Corrections

**Branch**: `021-orders-landing-corrections` | **Date**: 2026-07-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/021-orders-landing-corrections/spec.md`

## Summary

Correct column order, labels, hyperlinks, and header display on the Orders landing page (`app/orders/page.tsx`) to match the prescribed 17-column list, splitting the current single "Proposal Name" hyperlinked column into separate "Proposal #" (hyperlink) and "Proposal Name" (plain) columns, and fixing a pre-existing data-labeling gap where "Bill to Account"/"Ship to Account" are actually sourced from Location-name fields rather than true Account-name fields. Adds 5 new columns (Bill to Location, Bill to Contact, Ship to Location, Ship to Contact, Drop Ship, Create Date) using the exact field-mapping pattern already proven on the Proposal Detail page's Orders tab (feature 018), which reads the same `Customer_Order__c` Salesforce object. Pagination is already implemented; default sort is already descending — both confirmed via research, not assumed. All changes are pure frontend updates to one file; no new routes, no schema changes.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: Tailwind CSS, `Link` (Next.js), `SortableHeader`, `useSortableData`, `Pagination`, `useResizableColumns`, `displayCell()` — all existing in the codebase, same primitives used by every prior table-correction feature (016–020)

**Storage**: N/A — read-only Salesforce data via `/api/salesforce/orders?action=list`, which returns raw `Customer_Order__c` records; the frontend maps whichever fields it needs

**Testing**: Visual/functional — run `npm run dev`, navigate to `/orders`, verify column order, labels, hyperlinks, and data values

**Target Platform**: Browser (Next.js SSR + client components)

**Performance Goals**: No degradation — column reordering, relabeling, and additional field mappings add negligible overhead

**Constraints**: No new API routes; no new SF Apex changes; no DB schema changes; all changes scoped to `app/orders/page.tsx`

**Scale/Scope**: 1 file, 1 table, 17 columns

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | Reads continue to flow through the existing `/api/salesforce/orders` endpoint; no new DB writes; field-mapping additions only |
| II — RBAC-First | ✅ PASS | No permission structure changed; existing `isManufacturer`/restricted-account Proposal-link gating is preserved unchanged |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes; modifying an existing client component only |
| IV — Multi-Tenant Isolation | ✅ PASS | No org-scoped query logic changed |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | Targeted corrections to one existing component; no new abstractions |

No violations. No Complexity Tracking entry required.

**Post-design re-check** (after Phase 0/1 research): The new field mappings (`billToAccountName`, `billToContactName`, `shipToAccountName`, `shipToContactName`, `dropShip`, `createdDate`) are read-only additions to an inline mapping local to this one page — no shared type is touched, so there is no risk to other pages (unlike features 019/020 which touched shared `types.ts`). All five principles remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/021-orders-landing-corrections/
├── plan.md              # This file
├── research.md          # Phase 0 output — current-state audit + confirmed field-mapping source (feature 018 cross-reference)
├── data-model.md         # Phase 1 output — field-mapping catalogue and column-order delta
└── quickstart.md        # Phase 1 output — validation scenarios

(no contracts/ — this feature exposes no new API routes or external interfaces)
```

### Source Code (files modified)

```text
app/orders/
└── page.tsx    # Column widths config, order-mapping (useMemo), table header row, table body row
```

**Structure Decision**: Single Next.js App Router project (existing structure, no new files). This is the smallest-scope feature in this series — one file, one table — since the Orders landing page has no sub-tabs or nested line-detail components (unlike features 018/020).

## Complexity Tracking

No constitution violations — table not required.

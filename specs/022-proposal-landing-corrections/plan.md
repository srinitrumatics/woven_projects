# Implementation Plan: Proposal Landing Page — Required Corrections

**Branch**: `022-proposal-landing-corrections` | **Date**: 2026-07-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/022-proposal-landing-corrections/spec.md`

## Summary

Correct column order, labels, and hyperlinks on the Proposal landing page (`app/proposals/page.tsx`) to match the prescribed 21-column list. Fixes the same Bill/Ship Account-Location mislabeling bug already found and corrected on the Orders landing page (feature 021), surfaces Shipping and Taxes data that is already fetched but never displayed, and adds a genuinely new Grand Total figure and Issued Date field. Unlike feature 021, this page's headers already use `truncate={false}` and its Action column is already correctly labeled — those two corrections need no work here. All changes are pure frontend updates to one file; no new routes, no schema changes.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: Tailwind CSS, `Link` (Next.js), `SortableHeader`, `useSortableData`, `Pagination`, `useResizableColumns`, `displayCell()` — all existing in the codebase, same primitives used by every prior table-correction feature (016–021)

**Storage**: N/A — read-only Salesforce data via `/api/salesforce/proposals?action=list`, which returns raw `Proposal__c` records; the frontend maps whichever fields it needs

**Testing**: Visual/functional — run `npm run dev`, navigate to `/proposals`, verify column order, labels, hyperlinks, and data values

**Target Platform**: Browser (Next.js SSR + client components)

**Performance Goals**: No degradation — column reordering, relabeling, and additional field mappings add negligible overhead

**Constraints**: No new API routes; no new SF Apex changes; no DB schema changes; all changes scoped to `app/proposals/page.tsx`

**Scale/Scope**: 1 file, 1 table, 21 columns

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | Reads continue to flow through the existing `/api/salesforce/proposals` endpoint; no new DB writes; field-mapping additions only |
| II — RBAC-First | ✅ PASS | No permission structure changed; existing `isManufacturer`/`isRestricted` gating on the Customer Order and Customer PO hyperlinks is preserved unchanged |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes; modifying an existing client component only |
| IV — Multi-Tenant Isolation | ✅ PASS | No org-scoped query logic changed |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | Targeted corrections to one existing component; no new abstractions |

No violations. No Complexity Tracking entry required.

**Post-design re-check** (after Phase 0/1 research): The new field mappings (`billToAccount`, `billToContact`, `shipToAccount`, `shipToContact`, `dropShip`, `grandTotal`, `issuedDate`) are read-only additions to an inline mapping local to this one page — no shared type is touched (the `Proposal` interface already declares most of these fields as optional, so no interface edit is even required), so there is no risk to other pages. All five principles remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/022-proposal-landing-corrections/
├── plan.md              # This file
├── research.md          # Phase 0 output — current-state audit + confirmed field sources (cross-referenced with the Proposal Detail page's own mapping of the same object)
├── data-model.md         # Phase 1 output — field-mapping catalogue and column-order delta
└── quickstart.md        # Phase 1 output — validation scenarios

(no contracts/ — this feature exposes no new API routes or external interfaces)
```

### Source Code (files modified)

```text
app/proposals/
└── page.tsx    # Column widths config, proposal-mapping (useEffect), table header row, table body row
```

**Structure Decision**: Single Next.js App Router project (existing structure, no new files) — same minimal scope pattern as feature 021 (Orders landing page).

## Complexity Tracking

No constitution violations — table not required.

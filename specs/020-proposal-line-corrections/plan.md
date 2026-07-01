# Implementation Plan: Proposal Line Page — Fulfillment & Returns Corrections

**Branch**: `020-proposal-line-corrections` | **Date**: 2026-07-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/020-proposal-line-corrections/spec.md`

## Summary

Correct column order, labels, hyperlinks, sort defaults, and sub-tab ordering across the two Fulfillment/Returns tab groups on the Proposal Line Detail page (`app/proposals/[id]/lines/[lineid]/`): 4 Fulfillment sub-tabs (Customer Quote Lines, Sales Order Lines, Shipping Manifest Lines, Invoice Lines) and 2 Returns sub-tabs (RMA Lines, Credit Memo Lines). This mirrors the correction pattern already delivered for the parent Proposal Details page in feature 018, applied one level down to the per-line-item detail page. All changes are pure frontend updates to TypeScript interfaces, data mappings, and component column definitions — no new API routes, no DB schema changes, no new Salesforce endpoints. Pagination is already implemented on this page; only column content, ordering, and default sort direction need correction.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: Tailwind CSS, `Link` (Next.js), `SortableHeader`, `useSortableData`, `Pagination`, `useResizableColumns`, `displayCell()` — all existing in the codebase, same primitives used by feature 018

**Storage**: N/A — read-only Salesforce data via the `gtherp/generic/tab` API, fetched by `app/proposals/[id]/lines/[lineid]/page.tsx`

**Testing**: Visual/functional — run `npm run dev`, navigate to a Proposal Line Detail page, verify each sub-tab

**Target Platform**: Browser (Next.js SSR + client components)

**Performance Goals**: No degradation — column reordering and relabeling add negligible overhead

**Constraints**: No new API routes; no new SF Apex changes; no DB schema changes; all changes scoped to 3 files (`page.tsx`, `LineFulfillmentsTab.tsx`, `LineReturnsTab.tsx`) under `app/proposals/[id]/lines/[lineid]/`

**Scale/Scope**: 3 files in one page directory, covering 6 sub-tab tables total

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | Data flows from the existing Salesforce fetch in `page.tsx`; no new DB writes for business data |
| II — RBAC-First | ✅ PASS | No permission structure changed; existing guards untouched |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes; modifying existing client components only |
| IV — Multi-Tenant Isolation | ✅ PASS | No org-scoped queries changed; API calls unchanged |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | Targeted corrections to existing components; no new abstractions |

No violations. No Complexity Tracking entry required.

**Post-design re-check** (after Phase 0/1 research): The additive-only field changes to shared `types.ts` interfaces (`Invoice.totalOrderQty`, `CreditMemo.customerQuoteLineName`/`customerQuoteLineId`) do not affect any constitution gate — no new write paths, no permission changes, and the parent Proposal Detail page (which shares these interfaces) is unaffected since it never references the new optional fields. All five principles remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/020-proposal-line-corrections/
├── plan.md              # This file
├── research.md          # Phase 0 output — current-state audit of the 3 target files
├── data-model.md        # Phase 1 output — per-sub-tab field-mapping / interface change catalogue
└── quickstart.md        # Phase 1 output — validation scenarios covering all 6 sub-tabs

(no contracts/ — this feature exposes no new API routes or external interfaces)
```

### Source Code (files modified)

```text
app/proposals/[id]/lines/[lineid]/
├── page.tsx                              # Interface field additions, SF field mappings, default sort states
└── components/
    ├── LineFulfillmentsTab.tsx           # Sub-tab order, all 4 sub-tab column sets (Customer Quote/Sales Order/Shipping Manifest/Invoice Lines)
    └── LineReturnsTab.tsx                # RMA Lines + Credit Memo Lines column corrections (RTV/Debit sections untouched)
```

**Structure Decision**: Single Next.js App Router project (existing structure, no new directories or files). This mirrors the exact 018 approach one level down: the parent Proposal Details page's `page.tsx` + `FulfillmentsTab.tsx`/`ReturnsTab.tsx` become this feature's `lines/[lineid]/page.tsx` + `LineFulfillmentsTab.tsx`/`LineReturnsTab.tsx`.

## Complexity Tracking

No constitution violations — table not required.

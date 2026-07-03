# Implementation Plan: Shipments Landing Page Corrections

**Branch**: `028-shipments-landing-corrections` | **Date**: 2026-07-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/028-shipments-landing-corrections/spec.md`

## Summary

Correct column order, labels, and hyperlinks on the Shipments landing page (`app/shipments/page.tsx`), expanding it from 17 to 28 columns. The bulk of the work is additive: 11 net-new columns (Proposal #, Ship to Contact, Drop Ship, six Box dimension/weight fields, and Estimated/Actual Delivery Date) plus a genuine new hyperlink (Shipping Manifest #, currently plain text) and a column split (Proposal Name separated out from the field that currently doubles as both the identifier and the hyperlink). Critically, every "new" field's underlying Salesforce field name is already confirmed — not inferred — via `app/proposals/[id]/page.tsx`'s existing, already-shipped mapping of this exact `Shipping_Manifest__c` object, which eliminates nearly all live-org verification risk that would normally accompany a change this size. Pagination, the sticky first column, and the descending default sort are all already correct and are locked in as regression guards; header full-text/no-wrap is a genuine, isolated fix. All changes are pure frontend edits to one page file plus its shared types file; no new routes, no schema changes.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: Tailwind CSS, `Link` (Next.js), `SortableHeader`, `useSortableData`, `Pagination`, `useResizableColumns`, `formatCurrency()`/`formatDate()`/`displayCell()` — all existing in the codebase, same primitives used by every prior table-correction feature (016-027)

**Storage**: N/A — read-only Salesforce data via `/api/salesforce/shipments` (used identically by this page today); the frontend maps whichever fields it needs from the `Shipping_Manifest__c` raw array

**Testing**: Visual/functional — run `npm run dev`, open the Shipments landing page, verify column order, labels, hyperlinks, and the new fields per `quickstart.md`

**Target Platform**: Browser (Next.js SSR + client components)

**Performance Goals**: No degradation — 11 new field mappings and one new hyperlink add negligible overhead; pagination/sort/sticky-column behavior is unchanged

**Constraints**: No new API routes; no new SF Apex changes; no DB schema changes; changes scoped to `app/shipments/page.tsx` and `app/shipments/types.ts`. One field mapping carries residual live-org verification risk (a dedicated Proposal Number field, assumed unavailable, falling back to Proposal Name) — the same open question already documented and never resolved in feature 023; it degrades gracefully to the fallback value regardless.

**Scale/Scope**: 2 files touched (landing page + shared types), 1 table, 28 total column definitions (11 net-new, 5 relabeled, 1 split, 11 unchanged)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | Reads continue to flow through the existing `/api/salesforce/shipments` endpoint; no new DB writes; all new field mappings read from data already present in the existing API response (confirmed via `app/proposals/[id]/page.tsx`'s mapping of the same object) |
| II — RBAC-First | ✅ PASS | No permission structure changed; the new Shipping Manifest # hyperlink is intentionally left ungated (unlike the Customer Quote/Proposal/Customer Order links) because the row's own click handler and Action icon already navigate to the identical destination for every account type today — gating only the new link would create an inconsistency, not a real permission boundary (see research.md §5) |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes; modifying one existing client component and its shared types file only |
| IV — Multi-Tenant Isolation | ✅ PASS | No org-scoped query logic changed |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | Targeted corrections to one existing page; reuses the exact `SortableHeader`/`useSortableData`/`Pagination`/`useResizableColumns` primitives already proven on this same page — no new abstractions |

No violations. No Complexity Tracking entry required.

**Post-design re-check** (after Phase 0/1 research): All 11 new field mappings are additive reads with graceful "-" degradation if absent; the Proposal Name/Proposal # split does not remove any existing capability (both values remain visible, just in two columns instead of one). No other consumer of `ShippingManifest` or the raw `Shipping_Manifest__c` records is affected by any of these changes — `app/proposals/[id]/page.tsx`'s own mapping of the same object is untouched by this feature. All five principles remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/028-shipments-landing-corrections/
├── plan.md              # This file
├── research.md          # Phase 0 output — current-state audit + proposals-page field confirmation
├── data-model.md        # Phase 1 output — field-mapping catalogue and column-order delta
└── quickstart.md        # Phase 1 output — validation scenarios

(no contracts/ — this feature exposes no new API routes or external interfaces)
```

### Source Code (files modified)

```text
app/shipments/
├── types.ts   # ShippingManifest interface: add 10 optional fields
└── page.tsx   # uiShipments mapping, useResizableColumns config, header row, body row
```

**Structure Decision**: Single Next.js App Router project (existing structure, no new files) — same minimal-scope pattern as features 016-027, here touching one landing page file instead of a detail page's tab components.

## Complexity Tracking

No constitution violations — table not required.

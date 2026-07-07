# Implementation Plan: Supplier Bill Line Page — Debit Memo Lines Tab Corrections

**Branch**: `042-supplier-bill-line-debit-memo-corrections` | **Date**: 2026-07-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/042-supplier-bill-line-debit-memo-corrections/spec.md`

## Summary

Correct the single Debit Memo Lines tab on the Supplier Bill Line detail page (`SBLDebitMemoLinesTab.tsx`): remove two columns that don't belong (a redundant "Supplier Bill Line" self-reference and a "Purchase Order Line" column occupying the slot where "Proposed Product" belongs), relabel two columns ("Debit Memo" → "Debit Memo #", "Brand" → "Brand Name"), add Product Name as an unconditional hyperlink, add account-type-conditional hyperlinks (Supplier = plain text, Hybrid = link) to Customer Quote Line and Proposed Product, force headers to `truncate={false}`, and set a default ascending sort by record name — mirroring the exact correction pattern already shipped on the equivalent, already-corrected Debit Memo Lines tab on the Purchase Order Line detail page (feature 031, `PODebitMemoLinesTab.tsx`). One material difference from that precedent: live-data verification during 031 found the backend never returns a `Customer_Quote__c` (parent quote ID) field on this related-list object, so 031's own Customer Quote Line link is silently broken (`/quotes/undefined/...`) whenever it renders for a non-Supplier account. This feature must not repeat that mistake — the Customer Quote Line hyperlink here must only render when both the quote-line ID and the parent quote ID are actually present, falling back to plain text otherwise (per spec FR-008). All changes are a pure frontend edit to one existing component; no new routes, no schema changes.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: Tailwind CSS, `Link` (Next.js), `SortableHeader`, `useSortableData`, `Pagination`, `useResizableColumns`, `useUserSession` — all existing in the codebase, same primitives used by every prior table-correction feature (016-031)

**Storage**: N/A — read-only Salesforce data via `/api/supplier-bills?...&action=returns&objectName=Supplier_Bill_Line__c&tabName=Returns` (used identically by this page today); the component receives the raw, unmapped Salesforce field shape directly as props via `page.tsx` — there is no intermediate mapping layer to edit, only the component's own TypeScript interface

**Testing**: Visual/functional — run `npm run dev`, open a supplier bill line's detail page as both a Supplier-type and a Hybrid-type account, verify the Debit Memo Lines tab's column order, labels, hyperlinks, gating, headers, pagination, and sort per `quickstart.md`

**Target Platform**: Browser (Next.js SSR + client components)

**Performance Goals**: No degradation — column relabeling/reordering, one new `useUserSession` call, and an initial sort config add negligible overhead

**Constraints**: No new API routes; no new SF Apex changes; no DB schema changes; changes scoped to `app/supplier-bills/[id]/lines/[lineid]/components/SBLDebitMemoLinesTab.tsx`. Confirmed via live-data query against this exact endpoint (`action=returns`, `objectId=<a Supplier Bill Line id>`) that the payload includes `Proposed_Product__c` (safe to link directly), `Product_Name__c` (safe to link directly), and `Product_Brand_Name__c` (the correct brand source, matching the `gtherp__Brand_Name__c` API name called out in the request) — but does **not** include any `Customer_Quote__c` field, flat or nested. The Customer Quote Line hyperlink MUST therefore be guarded on both `Customer_Quote_Line__c` and `Customer_Quote__c` being present and fall back to plain text when `Customer_Quote__c` is absent (which, per live verification, is always today) — this satisfies FR-008/SC-006 without waiting on a backend change.

**Scale/Scope**: 1 file touched, 1 table, 13 column definitions (down from 14 today: -2 removed [Supplier Bill Line, Purchase Order Line], +1 added [Proposed Product])

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | Reads continue to flow through the existing `/api/supplier-bills` endpoint; no new DB writes; all new field references read from the same raw record shape already returned by the API |
| II — RBAC-First | ✅ PASS | No permission structure changed; the new Supplier/Hybrid gating reuses the exact `useUserSession`/`isManufacturer` mechanism already proven on the equivalent Purchase Order Line page tables (feature 031) — not a new gate, an extension of an existing one to a previously-ungated column |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes; modifying one existing client component only; no changes to `page.tsx`'s `params` handling |
| IV — Multi-Tenant Isolation | ✅ PASS | No org-scoped query logic changed |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | Targeted correction to one existing component; reuses the exact `SortableHeader`/`useSortableData`/`Pagination`/`useResizableColumns`/`useUserSession`/`isManufacturer` primitives already proven elsewhere in this same page family — no new abstractions, no prop-drilling introduced |

No violations. No Complexity Tracking entry required.

**Post-design re-check** (after Phase 0/1 research): The "Purchase Order Line" → "Proposed Product" swap and the "Supplier Bill Line" column removal are UI-only — this component is not consumed by any other page. Adding `useUserSession` mirrors an already-shipped pattern (`PODebitMemoLinesTab.tsx` on the PO Line page) with no shared-state risk since the component computes its own local `isManufacturer` value. The dual-ID guard on the Customer Quote Line link (new relative to the 031 precedent) is a stricter, safer version of the same pattern — no new dependency, no new principle risk. All five principles remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/042-supplier-bill-line-debit-memo-corrections/
├── plan.md              # This file
├── research.md          # Phase 0 output — current-state audit of the tab
├── data-model.md        # Phase 1 output — field-mapping catalogue and column-order delta
└── quickstart.md        # Phase 1 output — validation scenarios (including Supplier/Hybrid gating)

(no contracts/ — this feature exposes no new API routes or external interfaces)
```

### Source Code (files modified)

```text
app/supplier-bills/[id]/lines/[lineid]/components/
└── SBLDebitMemoLinesTab.tsx    # interface, widths, header/body row, sort init, add isManufacturer gating
```

**Structure Decision**: Single Next.js App Router project (existing structure, no new files) — same minimal-scope pattern as features 016-031, here touching one tab component that already owns its full data-fetch-to-render pipeline via its parent `page.tsx`, which needs no changes since gating is self-contained per component, following the exact precedent already set by `PODebitMemoLinesTab.tsx` on the sibling Purchase Order Line page.

## Complexity Tracking

No constitution violations — table not required.

# Implementation Plan: Invoice Details Page — Invoice Lines & Credit Memos Tab Corrections

**Branch**: `024-invoice-lines-credit-memos-corrections` | **Date**: 2026-07-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/024-invoice-lines-credit-memos-corrections/spec.md`

## Summary

Correct column order, labels, and hyperlinks on the Invoice Details page's Invoice Lines and Credit Memos tabs (`app/invoices/[id]/components/InvoiceLineItems.tsx` and `InvoiceCredits.tsx`). The Invoice Lines tab needs the larger lift: pagination is entirely absent today (unlike every other table audited in prior corrections), 4 new columns must be inserted (Invoice #, Sales Order Line, Purchase Order Line, Customer Quote Line, Proposed Product — 5 counting Product Name's new hyperlink), and Brand Name is a confirmed dead field (`brand: undefined` hardcoded) that must be wired to real data. The Credit Memos tab needs column-order correction, 3 new columns (Invoice #, Sales Order #, Proposal # + Proposal Name), and the removal of two columns ("Credit to Account"/"Credit to Contact") not present in the corrected list. Both tabs' default sort direction must flip from descending to ascending — a genuine behavior change, unlike feature 023 where the requested direction already matched. All changes are pure frontend updates to two components plus their shared data-mapping block in one page file; no new routes, no schema changes.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: Tailwind CSS, `Link` (Next.js), `SortableHeader`, `useSortableData`, `Pagination`, `useResizableColumns`, `displayCell()`/`formatCurrency()`/`formatDate()`/`formatNumber()` — all existing in the codebase, same primitives used by every prior table-correction feature (016–023)

**Storage**: N/A — read-only Salesforce data via `/api/salesforce/invoices?action=lines` and `?action=credits`, which return raw `Invoice_Line__c` and `Credit_Memo__c` records; the frontend maps whichever fields it needs

**Testing**: Visual/functional — run `npm run dev`, open an invoice detail page, verify both tabs' column order, labels, hyperlinks, pagination, and sort per `quickstart.md`

**Target Platform**: Browser (Next.js SSR + client components)

**Performance Goals**: No degradation — column reordering, relabeling, additional field mappings, and adding pagination to the Invoice Lines tab add negligible overhead (and pagination *improves* rendering cost for invoices with many lines)

**Constraints**: No new API routes; no new SF Apex changes; no DB schema changes; changes scoped to `app/invoices/[id]/components/InvoiceLineItems.tsx`, `app/invoices/[id]/components/InvoiceCredits.tsx`, and the shared mapping/types in `app/invoices/[id]/page.tsx` / `app/invoices/types.ts`. Three field/route mappings carry live-org verification risk (Customer Quote Line's target route, Proposed Product's and Product Name's id fields for their new hyperlinks, and Credit Memo's Sales Order field) and are documented in `research.md`; all degrade gracefully to plain text/"-" if unavailable.

**Scale/Scope**: 3 files touched (2 tab components + 1 shared page/mapping file), 1 shared types file, 2 tables, 17 columns each (34 total column definitions)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | Reads continue to flow through the existing `/api/salesforce/invoices?action=lines`/`?action=credits` endpoints; no new DB writes; field-mapping additions only |
| II — RBAC-First | ✅ PASS | No permission structure changed; neither tab currently applies `isManufacturer`-style link gating and this feature does not introduce it (see research.md §13 — explicitly out of scope to avoid an unrequested permissions change) |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes; modifying two existing client components and their shared parent mapping only |
| IV — Multi-Tenant Isolation | ✅ PASS | No org-scoped query logic changed |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | Targeted corrections to two existing components; Invoice Lines' new pagination reuses the exact `Pagination` component/pattern already proven on the Credit Memos tab in the same file tree — no new abstraction |

No violations. No Complexity Tracking entry required.

**Post-design re-check** (after Phase 0/1 research): The new field mappings for both tabs are additive optional fields on `InvoiceLine`/`CreditMemo` (no breaking interface changes); the Credit Memos tab's removal of "Credit to Account"/"Credit to Contact" columns is a UI-only removal (the underlying `creditToAccountName`/`creditToContactName` fields remain in the type and mapping, simply unrendered, so no other consumer of `CreditMemo` is affected). Three fields carry unresolved live-org verification risk (documented above and in research.md) but the chosen approach — graceful degradation to plain text/"-" — means no principle is at risk regardless of the outcome. All five principles remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/024-invoice-lines-credit-memos-corrections/
├── plan.md              # This file
├── research.md          # Phase 0 output — current-state audit of both tabs + field-source confirmation/inference log
├── data-model.md         # Phase 1 output — field-mapping catalogues and column-order deltas for both tabs
└── quickstart.md        # Phase 1 output — validation scenarios for both tabs

(no contracts/ — this feature exposes no new API routes or external interfaces)
```

### Source Code (files modified)

```text
app/invoices/
├── types.ts                                    # InvoiceLine + CreditMemo interfaces: add optional fields
└── [id]/
    ├── page.tsx                                # lines mapping, credits mapping, pass invoiceNumber prop to InvoiceLineItems
    └── components/
        ├── InvoiceLineItems.tsx                # widths config, header row, body row, add Pagination, sort direction → asc
        └── InvoiceCredits.tsx                  # widths config, header row, body row, remove 2 columns, sort direction → asc
```

**Structure Decision**: Single Next.js App Router project (existing structure, no new files) — same minimal-scope pattern as features 021–023, extended here to two sibling tab components sharing one parent's data-fetch/mapping block instead of a single page.

## Complexity Tracking

No constitution violations — table not required.

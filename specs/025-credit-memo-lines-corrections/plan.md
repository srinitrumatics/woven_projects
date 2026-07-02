# Implementation Plan: Invoice Line Page — Credit Memo Lines Tab Corrections

**Branch**: `025-credit-memo-lines-corrections` | **Date**: 2026-07-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/025-credit-memo-lines-corrections/spec.md`

## Summary

Correct column order, labels, and hyperlinks on the Invoice Line detail page's Credit Memo Lines tab (`app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx`). Unlike the sibling Invoice Lines/Credit Memos tabs corrected in feature 024, this tab starts from a lower baseline: it has **no pagination and no default sort at all** (not just a wrong direction), and **zero hyperlinks exist anywhere in the table today** (every relationship column is plain text with no id fields even captured). The corrections add 3 new hyperlinks (Customer Quote Line, Proposed Product, Product Name), fix the same hardcoded-blank Brand Name bug already fixed in feature 024, remove the unlisted "Invoice Line" column, relabel two columns, and add both pagination and a default ascending sort from scratch. All changes are confined to this one self-contained component file; no new routes, no schema changes.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: Tailwind CSS, `Link` (Next.js), `SortableHeader`, `useSortableData`, `Pagination`, `useResizableColumns`, `displayCell()`/`formatCurrency()`/`formatNumber()` — all existing in the codebase, same primitives used by every prior table-correction feature (016–024)

**Storage**: N/A — read-only Salesforce data via `/api/salesforce/invoices?action=creditmemolines&objectName=Invoice_Line__c` (existing endpoint, unchanged), which returns raw `Credit_Memo_Line__c` records; the frontend maps whichever fields it needs

**Testing**: Visual/functional — run `npm run dev`, open an invoice line's Credit Memo Lines tab, verify column order, labels, hyperlinks, pagination, and sort per `quickstart.md`

**Target Platform**: Browser (Next.js SSR + client components)

**Performance Goals**: No degradation — column reordering, relabeling, and adding pagination/default sort add negligible overhead (pagination *improves* rendering cost for lines with many associated credit memo lines)

**Constraints**: No new API routes; no new SF Apex changes; no DB schema changes; all changes scoped to `app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx`. Three field/route mappings carry live-org verification risk (documented in `research.md`): the Proposed Product id field (`Proposed_Product__c`, high confidence — the identical field pair was live-confirmed working on the sibling `Invoice_Line__c` object in feature 024), the Product Name id field (`Product__c`, unconfirmed, carried over from feature 024's unresolved risk), and the Customer Quote Line target route (unconfirmed, same open question as feature 024). All degrade gracefully to plain text/"-" if unavailable.

**Scale/Scope**: 1 file, 1 table, 15 columns

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | Reads continue to flow through the existing `/api/salesforce/invoices?action=creditmemolines` endpoint; no new DB writes; field-mapping additions only |
| II — RBAC-First | ✅ PASS | No permission structure changed; this tab currently applies no role-based link gating and this feature does not introduce any (consistent with feature 024's decision to leave that out of scope for these tabs) |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes; modifying one existing self-contained client component only |
| IV — Multi-Tenant Isolation | ✅ PASS | No org-scoped query logic changed |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | Targeted corrections to one existing component; new pagination/sort reuse the exact pattern already proven in feature 024's `InvoiceLineItems.tsx` fix — no new abstraction |

No violations. No Complexity Tracking entry required.

**Post-design re-check** (after Phase 0/1 research): The new field mappings (`customerQuoteLineId`, `customerQuoteId`, `proposedProduct`, `proposedProductId`, `productId`) are additive fields on a local, self-contained `CreditMemoLine` interface with no other consumers — no breaking change risk. The removal of `invoiceLine` from both the interface and the mapping is likewise self-contained since this interface has no other consumers. All five principles remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/025-credit-memo-lines-corrections/
├── plan.md              # This file
├── research.md          # Phase 0 output — current-state audit + field-source confirmation/inference log
├── data-model.md         # Phase 1 output — field-mapping catalogue and column-order delta
└── quickstart.md        # Phase 1 output — validation scenarios

(no contracts/ — this feature exposes no new API routes or external interfaces)
```

### Source Code (files modified)

```text
app/invoices/[id]/lines/[lineid]/
└── components/
    └── InvoiceLineCreditMemoTab.tsx    # Interface, data mapping, widths config, header row, body row, pagination, sort
```

**Structure Decision**: Single Next.js App Router project (existing structure, no new files) — the smallest-scope feature in this series (1 file), continuing the pattern established across features 021–024.

## Complexity Tracking

No constitution violations — table not required.

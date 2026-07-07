# Implementation Plan: Purchase Order Details Page — Lines, Supplier Bills, Serial Number Logs, Returns Corrections

**Branch**: `041-purchase-order-details-corrections` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/041-purchase-order-details-corrections/spec.md`

## Summary

Correct genuine defects across all four tabs of the Purchase Order Details page (`app/purchase-orders/[id]/page.tsx`): Purchase Order Lines, Supplier Bills, Serial Number Logs, and Returns (RTVs and Debit Memos sub-tabs). Unlike several recent features in this series, four parallel background audits confirmed this is substantially corrective, not verification-only:

- **`POLinesTable.tsx`**: remove a self-referential "Purchase Order" column and two other unrequested columns (Open Balance Qty, Invoice Status); add Proposed Product (gated), Need By Date, Promise Date, and Action; add `isManufacturer` gating to Customer Quote Line and Proposed Product; add an unconditional Product Name hyperlink; fix Brand Name (currently hardcoded `undefined`) and relabel "Brand" → "Brand Name"; fix Shipping to source the line-level `Shipping_Charges__c` field instead of the parent PO's `Total_Shipping_Charges__c`; add `gtherp__`-prefixed dual-namespace fallbacks to all three financial fields; relabel "Line Total Cost" → "Line Grand Total"; fix a Tracking Status/Estimated Delivery Date column-order transposition; change default sort from DESC to ASC.
- **`POSupplierBillsTable.tsx`**: remove four unrequested columns (Supplier Name, Supplier DBA, Supplier Contact, Days Outstanding) and replace with the correct Ship to Account/Location/Contact fields; add Proposal #, Proposal Name, and Action; add `isManufacturer` gating (currently absent entirely) to Customer Quote #/Proposal #/Customer Order #; relabel two financial columns ("Total Cost"→"Total Amount", "Total Amount"→"Grand Total") and add `gtherp__`-prefixed fallbacks to all three; add `>0 red / <=0 green` color-coding to Open Balance (currently has none); change default sort from DESC to ASC; adjust the empty-state to keep headers visible.
- **`POSerialNumbersTable.tsx`**: rename the tab-bar label from "Serial Numbers" to "Serial Number Logs" (`POTabs.tsx`); add a missing Brand Name column; add an unconditional Product Name hyperlink; relabel "Serial Number"→"Serial Number #", "Purchase Order"→"Purchase Order #", "RMA"→"RMA #"; change default sort from DESC to ASC.
- **`PORTVTable.tsx`** and **`PODebitMemoTable.tsx`**: remove the account-type gating on the Purchase Order # hyperlink (it must always be clickable); add missing Proposal # and Proposal Name columns to both; remove unrequested columns (Supplier Name/Contact/Approval Date on RTVs; Supplier Bill/Supplier Credit Memo/Debit to Account/Debit to Contact/Approval Date on Debit Memos); relabel and reposition Type/Supplier RMA Number on RTVs and Debit Memo #/Expiration Date on Debit Memos; add the missing Expiration Date column to Debit Memos; change default sort from DESC to ASC on both.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: `Link` (Next.js), `SortableHeader`, `Pagination`, `useSortableData`, `useResizableColumns`, `useUserSession`, `displayCell()`/`formatCurrency()`/`formatDate()`, `StatusBadge`/`RemittanceBadge` — all existing in the codebase, same primitives used by every prior table-correction feature (016-040)

**Storage**: N/A — read-only Salesforce data proxied through a generic Apex REST endpoint (`lib/purchase-order-service.ts`, `services/apexrest/gtherp/generic/tab`); no SOQL in-repo. All fixes are client-side field-mapping, column-structure, and hyperlink corrections; no new API routes or endpoint changes required. Newly-added columns whose underlying field availability cannot be confirmed from static code (Brand Name on Serial Number Logs; Proposal #/Name on Supplier Bills/RTVs/Debit Memos; Expiration Date on Debit Memos) should be empirically verified against a live API response during implementation — if a field is genuinely absent, the column renders "-" per the existing null-dash convention rather than being removed.

**Testing**: Visual/functional — run `npm run dev`, open a purchase order's detail page, and verify each tab per `quickstart.md`, with particular attention to both Supplier-type and Hybrid-type account behavior across all four tabs.

**Target Platform**: Browser (Next.js SSR + client components)

**Performance Goals**: No degradation — all fixes are field-mapping, label, column-structure, and conditional-rendering changes with no new data fetching

**Constraints**: No new API routes; no new SF Apex changes anticipated (assumes the generic Apex proxy already returns the fields this fix maps to, consistent with how equivalent fields are already returned for sibling tabs elsewhere in the portal); no DB schema changes

**Scale/Scope**: 5 files touched — `POLinesTable.tsx`, `POSupplierBillsTable.tsx`, `POSerialNumbersTable.tsx`, `PORTVTable.tsx`, `PODebitMemoTable.tsx` — plus `POTabs.tsx` for the Serial Number Logs tab-bar rename; User Stories 5-6 (headers/sticky/pagination) require no changes beyond the sort-direction fix already captured in each tab's own user story

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | All fixes are client-side field-mapping/column-structure corrections against data already returned (or assumed available, per established sibling conventions) by the existing Apex REST proxy; no new query logic |
| II — RBAC-First | ✅ PASS | No permission structure changed; the `isManufacturer`-style account-type gating being added/fixed is a display convention already used consistently elsewhere in this portal, not a permission-system change |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes; all hyperlink targets (`/quotes/[id]`, `/proposals/[id]`, `/orders/[id]`, `/products/[id]`, `/purchase-orders/[id]`) already exist |
| IV — Multi-Tenant Isolation | ✅ PASS | No org-scoped query logic changed |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | Scope is bounded to the exact discrepancies confirmed by direct code inspection across four independent audits; no speculative rework of already-correct behavior (headers, sticky columns, pagination structure are all preserved as-is) |

No violations. No Complexity Tracking entry required.

**Post-design re-check** (after Phase 0/1 research): All fixes are isolated to five component files plus one tab-label string; none touch shared state, routing configuration, or data-fetching infrastructure beyond reading additional already-available (or empirically-verified) fields. All five principles remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/041-purchase-order-details-corrections/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command) — skipped, no new external interface
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (files in scope)

```text
app/purchase-orders/[id]/components/POLinesTable.tsx         # Column structure, hyperlinks, field mappings, sort direction
app/purchase-orders/[id]/components/POSupplierBillsTable.tsx # Column structure, hyperlinks, field mappings, color-coding, sort direction
app/purchase-orders/[id]/components/POSerialNumbersTable.tsx # Column structure, hyperlink, field mapping, sort direction
app/purchase-orders/[id]/components/PORTVTable.tsx           # Column structure, hyperlink gating fix, sort direction
app/purchase-orders/[id]/components/PODebitMemoTable.tsx     # Column structure, hyperlink gating fix, field mapping, sort direction
app/purchase-orders/[id]/components/POTabs.tsx               # Serial Number Logs tab-bar label rename
```

**Structure Decision**: Single Next.js App Router project (existing structure, no new files) — corrective fixes scoped to five tab components and one tab-label string, all under the existing Purchase Order Details page.

## Complexity Tracking

No constitution violations — table not required.

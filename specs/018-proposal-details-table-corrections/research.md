# Research: Proposal Details Page — Table Corrections (CO-113)

**Feature**: `specs/018-proposal-details-table-corrections`
**Date**: 2026-07-01
**Status**: Complete — all unknowns resolved

---

## Decision Log

### D-001: Column infrastructure — use existing primitives, add no new ones

**Decision**: Reuse `SortableHeader`, `useSortableData`, `Pagination`, `useResizableColumns`, `displayCell()`, and the sticky-column pattern already present across all sub-tabs.

**Rationale**: Every infrastructure primitive needed for this feature is already in production use in `ProductsTab.tsx`, `OrdersTab.tsx`, `FulfillmentsTab.tsx`, and `ReturnsTab.tsx`. Zero new components are required.

**Alternatives considered**: Creating a shared `DataTable` abstraction over all six files. Rejected because (a) the spec scope is a targeted correction, not a refactor, and (b) a shared abstraction would have wide blast radius with no feature benefit.

---

### D-002: Where to add new TypeScript fields — `types.ts`, not inline

**Decision**: Add all new interface fields to `app/proposals/[id]/types.ts`.

**Rationale**: The file already holds all eight interfaces (`ProposedProduct`, `Order`, `CustomerQuote`, `SalesOrder`, `ShippingManifest`, `Invoice`, `RMA`, `CreditMemo`). Component files import from `types.ts` via relative import. Keeping types co-located in `types.ts` matches the existing convention.

**Alternatives considered**: Adding fields inline inside each component. Rejected because component-local interfaces diverge from `types.ts` and would break cross-component type sharing.

---

### D-003: Default sort field for each tab

**Decision**: Use `key: 'name'` (already the default key) and change only `direction` from `'desc'` to `'asc'`.

**Rationale**: The spec says "Record ID ascending." Every sub-tab maps the Salesforce record name (e.g. `Q-00001`) to the `name` TypeScript field. `useSortableData` already uses `name` as its sort key. Only the direction needs to change.

**Alternatives considered**: Using a dedicated `recordId` field. Rejected — record names serve as IDs in this portal (e.g. `Q-00001`, `SM-00001`); the existing `name` field is the correct sort anchor.

---

### D-004: `salesOrderId` bug fix (incidental correction)

**Decision**: Set `salesOrderId: so.Id` in the Sales Orders mapping in `page.tsx` — the field is declared in the `SalesOrder` interface but was never populated in the mapping, so the hyperlink in the Sales Orders sub-tab was silently broken.

**Rationale**: Adding `proposalId`/`proposalName` to Sales Orders already requires touching that mapping block. Fixing `salesOrderId` at the same time is one extra line with no risk, and it restores a hyperlink that was intended to be there.

**Alternatives considered**: Leaving it as a separate ticket. Rejected because the change is one line in a block we are already editing.

---

### D-005: `salesOrderName` for Credit Memo — add to mapping

**Decision**: Add `salesOrderName: c.Sales_Order_Name || ''` to the Credit Memos mapping. The field is already declared in the `CreditMemo` interface but was never set in `page.tsx`.

**Rationale**: The new "Sales Order #" column in the Credit Memos sub-tab renders `credit.salesOrderName`. Without this mapping fix, the column would always display "-".

---

### D-006: Remove Credit to Account / Credit to Contact from Credit Memos

**Decision**: Remove these two columns from the Credit Memos sub-tab render. Do NOT remove the fields from the interface or the mapping.

**Rationale**: FR-017 does not include "Credit to Account" or "Credit to Contact" in the required column list. The spec assumptions section states these are to be excluded from the CO-113 customer-facing view. Keeping the data in the interface/mapping is a no-op and avoids a riskier deletion.

---

### D-007: Fulfillment sub-tab button reorder — swap last two buttons only

**Decision**: In `FulfillmentsTab.tsx`, swap the Invoices and Shipping Manifests `<button>` elements. Do not change `activeFulfillmentTab` default in `page.tsx` — it is already `"quotes"` which is unaffected.

**Rationale**: Current order: Customer Quotes → Sales Orders → Invoices → Shipping Manifests. Required: Customer Quotes → Sales Orders → Shipping Manifests → Invoices. Only the last two swap.

---

### D-008: Salesforce field names for new mappings

Confirmed field names by cross-referencing the spec's API name list with existing mappings in `page.tsx`:

| New TypeScript field | Salesforce source field | Confidence |
|---------------------|------------------------|-----------|
| `status` (ProposedProduct) | `item.Status__c` | Existing `Status__c` pattern used for Order, Invoice, RMA |
| `brandName` | `item.gtherp__Brand_Name__c` | Explicitly provided in spec |
| `qtyShipped` | `item.Qty_Shipped__c` | Standard SF convention |
| `proposalRequested` (Order) | `order.Proposal_Requested__c` | Standard SF convention |
| `transferOrder` (Order) | `order.Transfer_Order__c` | Standard SF convention |
| `proposalId` (all) | `<object>.Proposal__c` | Standard SF lookup ID convention |
| `proposalName` (all) | `<object>.Proposal_Name` or `<object>.Proposal__r?.Name` | Either may exist depending on API response shape |
| `boxLength` | `sm.Case_Length__c` | Explicitly provided in spec |
| `boxWidth` | `sm.Case_Width__c` | Explicitly provided in spec |
| `boxHeight` | `sm.Case_Height__c` | Explicitly provided in spec |
| `purchaseOrderName` | `inv.Purchase_Order_Name` or `inv.Purchase_Order__r?.Name` | Standard pattern |
| `salesOrderName` (CreditMemo) | `c.Sales_Order_Name` | Standard pattern, existing `salesOrderId: c.Sales_Order__c` in mapping |

---

### D-009: Proposal hyperlink routing

**Decision**: Proposal # column links to `/proposals/${proposalId}` using the same `<Link>` + conditional pattern as other record hyperlinks.

**Rationale**: The existing portal has a `/proposals/[id]` route. All hyperlinks follow the pattern: render `<Link>` only when the relevant ID field is non-empty, otherwise render plain text via `displayCell()`.

---

## Files Modified Summary

| File | Change type |
|------|------------|
| `app/proposals/[id]/types.ts` | Interface field additions (8 interfaces) |
| `app/proposals/[id]/page.tsx` | Data mappings + sort default state changes + column widths |
| `app/proposals/[id]/components/ProductsTab.tsx` | Column restructure: +2 cols, 2 label changes, +1 hyperlink |
| `app/proposals/[id]/components/OrdersTab.tsx` | +2 cols, 2 label changes |
| `app/proposals/[id]/components/FulfillmentsTab.tsx` | Sub-tab reorder + column corrections across 4 sub-tabs |
| `app/proposals/[id]/components/ReturnsTab.tsx` | Sort default + column corrections across 2 sub-tabs |

No new files, no new routes, no DB migrations, no Salesforce endpoint changes.

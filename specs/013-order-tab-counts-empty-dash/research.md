# Research: Order Details Tab Counts & Empty Value Dash

**Date**: 2026-06-26

No external technology research is required for this feature — it is a purely frontend display change using patterns already established in the codebase.

## Decisions

### Decision 1 — Count propagation mechanism

**Decision**: Use the existing callback-prop pattern (`onCountChange?: (count: number) => void`) already established by `FilesTab` → `onFilesCountChange`.

**Rationale**: `FulfillmentTab` and `ReturnsTab` fetch their own data internally. The parent page (`app/orders/[id]/page.tsx`) needs the total count after fetch. Callback props are the idiomatic React pattern for child-to-parent communication without lifting all state. This mirrors the already-approved `onFilesCountChange` pattern exactly.

**Alternatives considered**:
- Lifting state to the parent: Would require moving all Fulfillment/Returns fetch logic to `page.tsx`, causing significant churn and bloating an already large file.
- React context: Overkill for a single page; introduces complexity with no benefit over a callback prop.
- Re-fetching in parent: Would add a duplicate API call, violating the no-new-requests constraint.

---

### Decision 2 — Fulfillment and Returns count calculation

**Decision**: Total count = sum of all role-visible sub-tab array lengths at the time of data load.

- **Fulfillment**: `proposals.length + customerQuotes.length + salesOrders.length + manifests.length + invoices.length`
- **Returns**: `rmaList.length + creditMemos.length + (isCustomerOrNSO ? 0 : debitMemos.length + rtvList.length)`

**Rationale**: The count should reflect only the records the current user can see, consistent with FR-005. The `isCustomerOrNSO` flag already gates Debit Memos and RTV sub-tabs in `ReturnsTab` — the count mirrors this gating.

**Alternatives considered**:
- Always sum all arrays: Would show inflated count to customer/NSO users who can't see all sub-tabs, misleading them.
- Count only the active sub-tab: Defeats the purpose; users need the aggregate to know whether to open the tab at all.

---

### Decision 3 — Taxes count strategy

**Decision**: Derive the count directly in `page.tsx` from `orderData` without modifying `TaxesTab`. Count = `!loadingOrder && !!orderData ? 1 : 0`. Show "(1)" when count is 1.

**Rationale**: The Taxes tab always shows exactly one summary row when order data is present (it has no empty sub-tab list concept). The parent page already holds `orderData` and `loadingOrder` state. No component changes needed for TaxesTab.

**Alternatives considered**:
- Add `onCountChange` to `TaxesTab`: Unnecessary — TaxesTab doesn't fetch data itself, and the binary (has order / no order) check is cleaner in the parent.
- Inspect individual tax field values: Overly complex; if the order is loaded, there is tax data (even if all zeros, the table row is shown).

---

### Decision 4 — Empty-value dash character

**Decision**: Use "—" (em dash, Unicode U+2014) consistently, matching what is already used in ~90% of existing cells in FulfillmentTab and ReturnsTab.

**Rationale**: The vast majority of the codebase already uses `"—"`. Switching to "-" (hyphen) for the few missing cells would create inconsistency. The spec said "-" to mean "a visible placeholder", not literally the hyphen character. Adopting "—" throughout is the correct interpretation.

**Scope of cells needing the fix**: Research revealed that most cells in FulfillmentTab and ReturnsTab already have `|| "—"`. The cells that are missing the fallback are limited to:
- `MyOrderTable.tsx`: `product.manufacturer`, `product.productFamily`
- `ProductCatalog.tsx`: `product.manufacturer`, `product.productFamily`
- `ProductCatalog.tsx`: `product.description` (currently uses invisible placeholder — change to "—")

All other cells in FulfillmentTab and ReturnsTab already correctly use `|| "—"`.

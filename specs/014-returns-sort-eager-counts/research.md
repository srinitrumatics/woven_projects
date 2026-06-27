# Research: Returns Table Sorting, Resizing & Eager Tab Counts

**Date**: 2026-06-26

No external technology research required — all patterns already exist in this codebase.

## Decisions

### Decision 1 — Eager fetch strategy: preloaded data via prop (no duplicate fetches)

**Decision**: Add a `preloadedData` optional prop to both `FulfillmentTab` and `ReturnsTab`. In `page.tsx`, add two new `useEffect`s that fetch fulfillment and returns data eagerly on mount (in parallel with other existing fetches). Store the result in component state. Pass it to the tab components. Inside each tab component, if `preloadedData` is provided, initialise the data state arrays from it and skip the internal fetch entirely.

**Rationale**: This is the only approach that satisfies both requirements simultaneously — counts visible on load AND no duplicate API calls when the user later clicks the tab. The tab's internal fetch path is kept as a fallback for cases where `preloadedData` is not provided (e.g., if the tab is reused elsewhere without the eager parent).

**Alternatives considered**:
- **Mount tabs hidden** (`display:none`): Bad — mounts entire components in the background, wastes DOM, causes side effects (event listeners, resize observers).
- **Separate count-only fetch**: Doubles API calls (one for count, one when tab is clicked). Rejected because FR-002 explicitly requires no duplicate fetches.
- **Lift all state to page.tsx**: Moving every single piece of FulfillmentTab and ReturnsTab state into the parent would bloat `page.tsx` dramatically and eliminate encapsulation. Rejected for YAGNI/Principle V reasons.

---

### Decision 2 — Returns sub-tab sort: one `useSortableData` per sub-tab

**Decision**: Add four independent `useSortableData` calls inside `ReturnsTab`, one each for `rmaList`, `creditMemos`, `debitMemos`, and `rtvList`. Default sort key for each is `Name` descending, matching the FulfillmentTab convention.

**Rationale**: Each sub-tab has a different column set and a different meaningful primary sort key. Independent sort state per sub-tab means sort preferences survive sub-tab switching.

**Default sort keys**:
- RMA → `Name` desc
- Credit Memos → `Name` desc
- Debit Memos → `Name` desc
- RTV → `Name` desc

---

### Decision 3 — Returns sub-tab resize: one `useResizableColumns({})` shared instance

**Decision**: Add a single `useResizableColumns({})` call in `ReturnsTab`, with prefixed keys per sub-tab (e.g., `widths.rmaName`, `widths.cmName`, `widths.dmName`, `widths.rtvName`). This matches the exact pattern used in `FulfillmentTab`.

**Rationale**: FulfillmentTab already demonstrates this works correctly with five sub-tabs sharing one width map. Avoids needing to call four separate `useResizableColumns` hooks.

---

### Decision 4 — Preloaded data shape

**Decision**: Use parsed (array) form rather than raw API response shape for the prop:

```typescript
// Added to FulfillmentTab.tsx
interface FulfillmentPreloadedData {
    invoices: Invoice[];
    manifests: ShippingManifest[];
    salesOrders: SalesOrder[];
    proposals: Proposal[];
    customerQuotes: CustomerQuote[];
}

// Added to ReturnsTab.tsx
interface ReturnsPreloadedData {
    rmaList: RMA[];
    creditMemos: CreditMemo[];
    debitMemos: DebitMemo[];
    rtvList: RTV[];
}
```

**Rationale**: Passing already-parsed arrays means the tab component can initialise state with a direct assignment and doesn't need to know API field names (`Invoice__c` etc). The parsing happens once in `page.tsx` at fetch time.

---

### Decision 5 — Empty dash: targeted fix only

**Decision**: Audit each table in `FulfillmentTab` and `ReturnsTab` for any remaining text cells that render without `|| "—"`. In the current code, virtually all string cells already use this pattern. The only cells to fix are any that do not yet have the fallback — expected to be a small number.

**Findings from audit**:
- FulfillmentTab: `prop.Total_Lines__c || "0"` and `cq.Total_Lines__c || "0"` — these are counts, "0" is intentional. No change needed.
- FulfillmentTab: All date, string, and linked-name cells already use `|| "—"`.
- ReturnsTab: All currently rendered cells use `|| "—"` via the existing pattern.
- The newly added `SortableHeader` columns do not render data — only headers. Column data cells inherit the existing pattern.
- MyOrderTable and ProductCatalog: Fixed in feature 013. No further gaps remain.

**Conclusion**: The comprehensive empty-dash sweep is effectively already complete after feature 013. US4 becomes a verification task rather than a major implementation task.

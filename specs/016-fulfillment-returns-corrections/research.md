# Research: Fulfillment & Returns Table Corrections

## Decision 1: Salesforce Field Availability

**Decision**: Treat the `gtherp/generic/tab` Salesforce Apex endpoint as the field source of truth. The endpoint is called generically with `tabName=Fulfillment` and `tabName=Returns`; it returns a data envelope containing arrays keyed by SF object name. The specific fields returned by the Apex are determined server-side. The TypeScript interfaces in `FulfillmentTab.tsx` and `ReturnsTab.tsx` must be expanded to match all new columns; if a field is absent from the API response, its cell renders `—` via `displayCell()`.

**Rationale**: The project uses `displayCell()` as a universal null-safe renderer, so unrecognised or absent fields silently display `—` without breaking the UI. No Apex code changes are in scope — if a field is missing from the API response, it will be identified during QA and escalated to the Salesforce team as a separate ticket.

**Alternatives considered**: Modifying the Apex endpoint to add fields — out of scope for a client-portal frontend change; depends on Salesforce-side work.

---

## Decision 2: Header No-Ellipsis Strategy

**Decision**: Pass `truncate={false}` to every `SortableHeader` and update the `SortableHeader` component to apply `whitespace-nowrap` (not just remove `truncate`) when `truncate={false}`. This keeps headers on a single line without truncation, while cell content retains the `truncate` class already on `<td>` elements.

**Rationale**: The current `SortableHeader` conditional applies `truncate` CSS class when the prop is `true`, and applies nothing (allowing text to word-wrap) when `false`. Adding `whitespace-nowrap` when `truncate={false}` is a minimal one-line change to the component and satisfies the spec's "single-line, no ellipsis" requirement.

**Alternatives considered**:
- CSS-only override on calling site: noisy — would need to repeat on every header call.
- New `noWrap` prop: redundant alongside existing `truncate`; the semantic already covers this.

---

## Decision 3: Sticky First Column Implementation

**Decision**: Apply `sticky left-0 z-10` Tailwind classes to the first `<th>` (via `SortableHeader`'s `className` prop and the existing sticky guard in `SortableHeader`) and to the first `<td>` in each row with matching background classes. The outer `<div>` already has `overflow-auto` which enables horizontal scroll; sticky positioning works correctly inside `overflow-auto` in modern browsers.

**Rationale**: The SortableHeader component already has logic that suppresses the `relative` class when `className` includes `sticky`, making it safe to add sticky classes externally. No component architecture changes required.

**Alternatives considered**: CSS `position: sticky` applied via a shared utility class — same end result, just inline classes are already the pattern used in this codebase.

---

## Decision 4: Pagination Pattern

**Decision**: Follow the exact pattern established in `MyOrderTable.tsx`:
```tsx
const ITEMS_PER_PAGE = 10;
const [currentPage, setCurrentPage] = useState(1);
const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE);
const pagedItems = useMemo(
  () => sortedItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
  [sortedItems, currentPage]
);
```
Each sub-table in Fulfillment and Returns gets its own independent `currentPage` state and the `<Pagination>` component rendered below the table. Changing the active sub-tab does NOT reset other tabs' page state.

**Rationale**: Consistent with existing portal pattern. Each entity has its own data set and independent sort/page state.

**Alternatives considered**: Shared pagination state — no benefit; tab switching already resets visible content.

---

## Decision 5: Sort Default Key for Proposals

**Decision**: Keep `Proposal_Number__c` as the default sort key for Proposals (existing behaviour). For all other entities (Customer Quotes, Sales Orders, Shipping Manifests, Invoices, RMAs, Credit Memos) keep `Name` as the default sort key with `direction: 'desc'`, since `Name` is the record identifier (e.g., `SO-00001`, `INV-00010`). Salesforce auto-numbers these with zero-padded numeric suffixes, so lexicographic descending on `Name` produces Record-ID-descending order.

**Rationale**: Matches spec FR-005 ("sort by Record ID descending"). Changing to sort by the SF `Id` field (18-char alphanumeric) would be unreliable for display ordering; `Name` is the human-readable record number and is already correct.

**Alternatives considered**: Sort by `Id` field — unreliable; SF `Id` is base-62 and not sequential by creation order in all cases.

---

## Decision 6: Hyperlink Permissions Pattern

**Decision**: Preserve the existing `canLink*` permission guards for Proposals (→ `/proposals/:Id`), Customer Quotes (→ `/quotes/:Id`), Shipping Manifests (→ `/shipments/:Id`), and Invoices (→ `/invoices/:Id`). Add permission-guarded hyperlinks to Sales Order # for accounts with `Customer`, `NSO`, or `Hybrid` record types (using a `canLinkSalesOrders` flag, mirroring existing logic). Cross-reference columns (e.g., Proposal # in a Customer Quote row) use the same permission guard as the target entity's own table.

**Rationale**: Existing accounts-based link gating is intentional business logic; the spec confirms that only certain account types should see hyperlinks.

**Alternatives considered**: Remove permission gating — violates existing RBAC design and constitution Principle II.

---

## Decision 7: Debit Memos and RTV in Returns Tab

**Decision**: Retain the existing Debit Memos and RTV sub-tabs in the Returns tab for non-Customer/NSO accounts. The spec scopes column corrections to RMAs and Credit Memos only, but the Debit Memos and RTV tabs are existing functionality for partner-type accounts that must not be removed. No column changes are applied to Debit Memos or RTV tables in this feature.

**Rationale**: The spec says "Returns Tab Sort Order (RMAs, Credit Memos)" — this is the tab ordering requirement for those two tables, not an instruction to remove the other tabs. Preserving partner-facing functionality is consistent with the constitution's Phase 1 scope.

---

## Decision 8: "Issued" vs "Issued Date" label for RMA

**Decision**: The spec lists the RMA column as "Issued" (not "Issued Date"). The current label is "Issued Date". Change to "Issued" to exactly match the spec. All other date columns across all tables use the full "Date" suffix.

**Rationale**: Spec is explicit — "Issued" without "Date" for RMA. This is a distinguishing design choice, not a typo in the spec.

# Quickstart: Supplier Bill Line Page — Debit Memo Lines Tab Corrections

**Prerequisites**: `npm run dev`, a logged-in session, access to both a Supplier-type and a Hybrid-type test account, and a supplier bill line with populated debit memo line data (Customer Quote Line, Proposed Product, and brand populated).

## Validation scenarios

1. **Column order & labels** — Open a supplier bill line, select the Debit Memo Lines tab. Confirm columns appear in this exact order: Debit Memo Line, Status, Debit Memo #, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Cost, Debit Qty, Total Cost, Shipping, Line Grand Total.
2. **Removed columns** — Confirm "Supplier Bill Line" and "Purchase Order Line" no longer appear anywhere in the table.
3. **Product Name hyperlink** — Confirm a populated Product Name is clickable and navigates to `/products/{id}`.
4. **Supplier account gating** — As a Supplier-type account, confirm Customer Quote Line and Proposed Product render as plain text.
5. **Hybrid account gating** — As a Hybrid-type account, confirm Proposed Product renders as a working hyperlink where populated. Confirm Customer Quote Line renders as plain text (not a broken link) per FR-008 — this is expected today since the backend does not return the parent quote id (see research.md); if a future backend change adds `Customer_Quote__c` to this endpoint's payload, re-run this check expecting a working `/quotes/{quoteId}/lines/{lineId}` link instead.
6. **Brand Name** — Confirm a debit memo line with a populated brand shows the correct value under the "Brand Name" header (not "Brand").
7. **Headers** — Narrow the browser or resize columns; confirm every header label stays on one line, never wrapping or truncating, while cell content may truncate with an ellipsis (full value on hover).
8. **Sort** — Reload the tab with no manual sort applied; confirm rows are ordered by Debit Memo Line ascending. Click other headers to confirm manual sort still works.
9. **Pagination** — With more than 10 debit memo lines, confirm pagination controls appear and page navigation works.
10. **Zero-broken-links check** — Inspect every rendered hyperlink's `href` on both account types; confirm none contain the literal string `undefined` or an empty required segment.

## Expected outcome

The Debit Memo Lines tab shows its prescribed column layout with "Supplier Bill Line" and "Purchase Order Line" removed, "Proposed Product" added in the correct position, "Debit Memo #" and "Brand Name" relabeled, Product Name unconditionally linked, Supplier/Hybrid-conditional gating on Customer Quote Line and Proposed Product (Customer Quote Line safely degrading to plain text given the current backend data gap), full-text single-line headers, working pagination, and a default ascending sort by record name — matching SC-001 through SC-006 in the spec.

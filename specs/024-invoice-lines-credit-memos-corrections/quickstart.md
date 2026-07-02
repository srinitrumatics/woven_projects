# Quickstart: Invoice Details Page — Invoice Lines & Credit Memos Tab Corrections

**Prerequisites**: `npm run dev`, a logged-in session, and an invoice detail page (ideally the CO-113 reference record's related invoice, or an equivalent test invoice) with: more than 10 invoice lines, at least one line with populated Brand, Total Order Qty, Sales Order Line, Purchase Order Line, Customer Quote Line, and Proposed Product; and at least one credit memo with populated Sales Order, Proposal, and Customer Order.

## Validation scenarios — Invoice Lines tab

1. **Column order & labels** — Open an invoice, go to the Invoice Lines tab. Confirm columns appear in this exact order: Invoice Line, Status, Invoice #, Sales Order Line, Purchase Order Line, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Price, Total Order Qty, Total Price, Shipping, Taxes, Line Grand Total, Action.
2. **Header display** — Confirm every header renders its full label on a single line with no wrapping/ellipsis (already correct today — verify no regression); cell content may ellipsis-truncate.
3. **Sticky first column** — Scroll the table horizontally; confirm "Invoice Line" stays pinned.
4. **Invoice Line hyperlink** — Click an Invoice Line value; confirm it navigates to that line's detail page (regression check — already works today).
5. **Invoice # hyperlink** — Click the Invoice # value on any line; confirm it navigates back to the parent invoice's own detail page.
6. **Customer Quote Line hyperlink** — Click a populated Customer Quote Line value; confirm it navigates to the quote line (or quote) detail page.
7. **Proposed Product hyperlink** — Click a populated Proposed Product value; confirm it navigates to the expected product record page, or renders as plain text if no id is available from the API (graceful degradation).
8. **Product Name hyperlink** — Click a populated Product Name value; confirm it navigates to the product catalog detail page, or renders as plain text if no id is available.
9. **Brand Name populated** — Confirm at least one line with a real brand shows that brand's name, not a blank cell (regression fix — was always blank before this feature).
10. **Total Order Qty populated** — Confirm the quantity value is correct and non-blank.
11. **Sales Order Line / Purchase Order Line plain text** — Confirm both render as plain, non-clickable text with real values (not raw Salesforce IDs).
12. **Action column** — Confirm the header still reads "Action" and the view-line-detail icon still functions (regression check).
13. **Pagination (new)** — With more than 10 lines on one invoice, confirm pagination controls now appear and only 10 rows show per page, with working page navigation. This tab had **no pagination at all** before this feature.
14. **Default sort (changed)** — Reload the tab without sorting; confirm the first row shows the **lowest** Invoice Line identifier (ascending) — this is a behavior change from the previous descending default.
15. **Null-dash convention** — For a line missing Sales Order Line, Purchase Order Line, Customer Quote Line, or Proposed Product, confirm the cell renders "-" (or plain text/no broken link for the hyperlinked columns).

## Validation scenarios — Credit Memos tab

1. **Column order & labels** — Go to the Credit Memos tab. Confirm columns appear in this exact order: Credit Memo #, Status, Invoice #, Sales Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Total Lines, Total Price, Shipping, Taxes, Total Credit Amount, Issued Date, Expiration Date, Available Credit Balance, Settled Date.
2. **Columns removed** — Confirm "Credit to Account" and "Credit to Contact" (shown previously) are **no longer present** — this is an intentional removal to match the corrected column list exactly.
3. **Header display / sticky column** — Confirm headers stay single-line, no wrap, and "Credit Memo #" stays pinned during horizontal scroll (regression check — already correct today).
4. **Invoice # column (new)** — Confirm a credit memo's parent invoice number shows as plain text (no hyperlink required).
5. **Sales Order # column (new)** — Confirm a populated credit memo shows its Sales Order number as plain text, or "-" if the field is unavailable from the API.
6. **Customer Quote # hyperlink** — Click a populated value; confirm it navigates to the quote detail page (regression check — already works today).
7. **Proposal # hyperlink (new)** and **Proposal Name (new)** — Confirm both show correct, independently distinct values for a credit memo with a linked proposal, and that clicking Proposal # navigates to the proposal detail page.
8. **Customer Order # hyperlink** — Click a populated value; confirm it navigates to the order detail page (regression check — already works today).
9. **Pagination** — Confirm pagination continues to work correctly with the new column set (regression check — already implemented).
10. **Default sort (changed)** — Reload the tab without sorting; confirm the first row shows the **lowest** Credit Memo # (ascending) — behavior change from the previous descending default.
11. **Null-dash convention** — For a credit memo missing Sales Order, Proposal, or any other optional field, confirm "-" renders rather than a blank cell.

## Fields to verify against the live org during implementation

Per `research.md`, several field mappings are inferred from precedent elsewhere in the codebase rather than confirmed directly on the exact objects used by these two tabs:
- Invoice Lines: `Customer_Quote_Line_Name` target route (`/quotes/{quoteId}/lines/{lineId}` vs. falling back to `/quotes/{quoteId}`), the Proposed Product id field (assumed `Proposed_Product__c`), and the Product id field (assumed `Product__c`) for the Product Name hyperlink.
- Credit Memos: the Sales Order field (assumed `Sales_Order_Name`) and whether a dedicated Proposal Number field exists distinct from Proposal Name.

If any of these fields/routes are unavailable, the corresponding column should render as plain text or "-" rather than a broken link — confirm this degrades gracefully.

## Expected outcome

The Invoice Lines tab shows the prescribed 17-column layout with 5 required hyperlinks, working pagination (net new), and ascending default sort. The Credit Memos tab shows the prescribed 17-column layout (with Credit to Account/Contact removed) with 3 hyperlinks, existing pagination preserved, and ascending default sort — matching SC-001 through SC-009 in the spec.

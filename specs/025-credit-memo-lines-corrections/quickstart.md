# Quickstart: Invoice Line Page — Credit Memo Lines Tab Corrections

**Prerequisites**: `npm run dev`, a logged-in session, and an invoice line detail page with at least one associated credit memo line (ideally more than 10, to validate pagination), with populated Customer Quote Line, Proposed Product, Product Name, and Brand values on at least one row.

## Validation scenarios

1. **Column order & labels** — Open an invoice line's detail page, go to the Credit Memo Lines tab. Confirm columns appear in this exact order: Credit Memo Line, Status, Credit Memo #, Sales Order Line, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Price, Credited Qty, Total Price, Shipping, Taxes, Line Grand Total.
2. **Invoice Line column removed** — Confirm the previously-present "Invoice Line" column no longer appears.
3. **Header display** — Confirm every header renders its full label on a single line with no wrapping/ellipsis (already correct today — verify no regression); cell content may ellipsis-truncate.
4. **Sticky first column** — Scroll the table horizontally; confirm "Credit Memo Line" stays pinned.
5. **Customer Quote Line hyperlink** — Click a populated Customer Quote Line value; confirm it navigates to the quote line (or quote) detail page, or renders as plain text if no id is available (graceful degradation).
6. **Proposed Product hyperlink** — Click a populated Proposed Product value; confirm it navigates to the expected product record page.
7. **Product Name hyperlink** — Click a populated Product Name value; confirm it navigates to the product catalog detail page, or renders as plain text if no id is available.
8. **Brand Name populated** — Confirm at least one row with a real brand shows that brand's name, not a blank cell (regression fix — was always blank before this feature).
9. **Credited Qty label** — Confirm the column header reads "Credited Qty" (not "Credit Qty") and the value is correct.
10. **Credit Memo # plain text** — Confirm "Credit Memo #" renders as plain text (no hyperlink), consistent with there being no credit-memo detail page in this portal.
11. **Pagination (new)** — With more than 10 associated credit memo lines, confirm pagination controls now appear and only 10 rows show per page, with working page navigation. This tab had **no pagination at all** before this feature.
12. **Default sort (new)** — Reload the tab without sorting; confirm the first row shows the **lowest** Credit Memo Line identifier (ascending). This tab had **no default sort at all** before this feature (raw API order).
13. **Null-dash convention** — For a row missing Customer Quote Line, Proposed Product, Product Name id, or Brand, confirm the cell renders "-" (or plain text/no broken link for the hyperlinked columns).

## Fields to verify against the live org during implementation

Per `research.md`, several field mappings are inferred from precedent elsewhere in the codebase rather than confirmed directly on `Credit_Memo_Line__c`:
- The Proposed Product id field (assumed `Proposed_Product__c`) — highest-confidence assumption in this feature, given the identical field pair on the sibling `Invoice_Line__c` object was live-confirmed working in the prior Invoice Lines tab correction.
- The Product id field (assumed `Product__c`) for the Product Name hyperlink — carries forward an unresolved risk from the prior correction (never live-verified there either).
- The Customer Quote Line target route (`/quotes/{quoteId}/lines/{lineId}` vs. falling back to `/quotes/{quoteId}`) — same unresolved routing decision as the prior correction.

If any of these fields/routes are unavailable, the corresponding column should render as plain text or "-" rather than a broken link — confirm this degrades gracefully.

## Expected outcome

The Credit Memo Lines tab shows the prescribed 15-column layout with 3 hyperlinks, working pagination (net new), and ascending default sort (net new) — matching SC-001 through SC-008 in the spec.

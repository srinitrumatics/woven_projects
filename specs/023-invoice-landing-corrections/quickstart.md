# Quickstart: Invoice Landing Page — Required Corrections

**Prerequisites**: `npm run dev`, a logged-in session, and at least one invoice with a linked Customer Quote, Proposal, and Customer Order, populated Bill to Account/Location/Contact fields, non-zero Shipping and Taxes, one invoice per Collection Status value (Paid/Pending/Past Due), one with a positive and one with a zero/negative Open Balance, and >10 invoices total (to validate pagination).

## Validation scenarios

1. **Column order & labels** — Navigate to `/invoices`. Confirm columns appear in this exact order: Invoice #, Status, Sales Order #, Purchase Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Customer PO, Bill to Account, Bill to Location, Bill to Contact, Total Lines, Total Price, Shipping, Taxes, Grand Total, Issued Date, Payment Terms, Due Date, Collection Status, Open Balance, Settled Date, Action.
2. **Header display** — Confirm every header renders its full label on a single line with no wrapping/ellipsis (already correct today — verify no regression); cell content may ellipsis-truncate.
3. **Sticky first column** — Scroll the table horizontally; confirm "Invoice #" stays pinned.
4. **Invoice # hyperlink** — Click an Invoice # value; confirm it navigates to that invoice's detail page (via a real link, not just a styled click handler).
5. **Customer Quote # hyperlink** — Click a Customer Quote # value (for an invoice with a linked quote); confirm it navigates to that quote's detail page.
6. **Proposal # hyperlink** — Click a Proposal # value (for an invoice with a linked proposal); confirm it navigates to that proposal's detail page. Confirm it is visually/functionally distinct from the separate "Proposal Name" column.
7. **Customer Order # hyperlink** — Click a Customer Order # value; confirm it navigates to that order's detail page.
8. **Bill to Account/Location/Contact distinctness** — For an invoice with distinct values in Salesforce, confirm all three columns show different, correct values (not the same value repeated).
9. **Financial breakout** — For an invoice with non-zero Shipping and Taxes, confirm Total Price, Shipping, Taxes, and Grand Total show four distinct figures.
10. **Grand Total is plain text** — Confirm the Grand Total cell has no click behavior and is not styled as a link.
11. **Issued Date vs Due Date** — Confirm these show two distinct dates.
12. **Collection Status color-coding** — Confirm a "Paid" invoice shows green, a "Pending" invoice shows yellow, and a "Past Due" invoice shows red.
13. **Open Balance color-coding** — Confirm a positive Open Balance shows red and a zero/negative Open Balance shows green (regression check — already correct today).
14. **Settled Date** — For a settled invoice, confirm a date renders; for an unsettled invoice, confirm "-" renders.
15. **Action column** — Confirm the header still reads "Action" (no regression) and the view-invoice icon still functions.
16. **Pagination** — With >10 invoices, confirm pagination controls appear and page navigation works.
17. **Default sort** — Reload the page without sorting; confirm the first row shows the highest Invoice # (Record ID descending) — regression check, already correct today.
18. **Null-dash convention** — For an invoice missing Customer Quote #, Proposal #, Bill to Location, Bill to Contact, or Settled Date, confirm each cell renders "-" (or plain text, no broken link, for the linked-record columns).

## Out-of-scope regression check

Confirm these are **unchanged**:
- The `isManufacturer` gating that hides the Purchase Order, Proposal Name, and Customer Order hyperlinks for certain account types.
- The pre-existing Purchase Order # and Proposal Name hyperlinks (not part of the corrected column's required-hyperlink list, left as-is).
- Search/filter behavior on the page (status tab cards, search box) — unaffected by the column changes.
- View-invoice button behavior in the Action column.

## Fields to verify against the live org during implementation

Two field mappings in this feature are inferred from sibling-object conventions rather than confirmed directly on `Invoice__c` (see `research.md` sections 4, 5, and 12):
- Customer Quote # (`Customer_Quote__c` / `Customer_Quote_Name`)
- Proposal # (dedicated number field, currently falls back to the existing `Proposal_Name` value)
- Settled Date (`Settled_Date__c`)

If any of these fields are absent from the live `/api/salesforce/invoices?action=list` response, the corresponding column will gracefully show "-" (or the Proposal Name fallback) rather than breaking the page — confirm this degrades gracefully if the field turns out to be unavailable.

## Expected outcome

The Invoice landing page's table matches the prescribed 24-column specification exactly, with correct hyperlinks (Invoice #, Customer Quote #, Proposal #, Customer Order #), a fixed first column, no-wrap headers, color-coded Collection Status and Open Balance, working pagination, and descending default sort — matching SC-001 through SC-010 in the spec.

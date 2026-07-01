# Quickstart: Proposal Landing Page — Required Corrections

**Prerequisites**: `npm run dev`, a logged-in session, and at least one proposal with a linked Customer Order and populated Bill/Ship Account, Location, and Contact fields, plus non-zero Shipping and Taxes (ideally >10 proposals total, to validate pagination).

## Validation scenarios

1. **Column order & labels** — Navigate to `/proposals`. Confirm columns appear in this exact order: Proposal #, Status, Proposal Name, Customer Order #, Customer PO, Bill to Account, Bill to Location, Bill to Contact, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Shipping, Taxes, Grand Total, Issued Date, Expiration Date, Request Date, Action.
2. **Header display** — Confirm every header still renders on a single line with no wrapping/ellipsis (already correct — verify no regression).
3. **Sticky first column** — Scroll the table horizontally; confirm "Proposal #" stays pinned.
4. **Proposal # hyperlink** — Click a Proposal # value; confirm it navigates to that proposal's detail page.
5. **Customer Order # hyperlink** — Click a Customer Order # value (for a proposal with a linked order); confirm it navigates to that order's detail page.
6. **Bill/Ship To distinctness** — For a proposal with distinct Bill to Account, Bill to Location, and Bill to Contact values in Salesforce, confirm all three columns show different, correct values (not the same value repeated). Repeat for Ship to Account/Location/Contact.
7. **Drop Ship** — Confirm the Drop Ship column renders a Yes/No pill matching the style used elsewhere in the portal.
8. **Financial breakout** — For a proposal with non-zero Shipping and Taxes, confirm Total Price, Shipping, Taxes, and Grand Total show four distinct figures, with Grand Total being the largest (the combined total).
9. **Issued Date vs Request Date vs Expiration Date** — Confirm these show three distinct dates.
10. **Action column** — Confirm the header still reads "Action" (no regression) and the view-proposal button still functions.
11. **Pagination** — With >10 proposals, confirm pagination controls appear and page navigation works.
12. **Default sort** — Reload the page without sorting; confirm the first row shows the highest Record ID (descending).
13. **Null-dash convention** — For a proposal missing Bill to Contact or Ship to Contact, confirm the cell renders "-".

## Out-of-scope regression check

Confirm these are **unchanged**:
- The `isManufacturer`/`isRestricted` gating that hides the Customer Order and Customer PO hyperlinks for certain account types.
- The pre-existing Customer PO → Purchase Order hyperlink (not part of the corrected column spec, left as-is).
- Search/filter behavior on the page (tab filters, search box) — unaffected by the column changes.
- View-proposal button behavior in the Action column.

## Expected outcome

The Proposal landing page's table matches the prescribed 21-column specification exactly, with correct hyperlinks, a fixed first column, no-wrap headers (already correct), working pagination, and descending default sort — matching SC-001 through SC-009 in the spec.

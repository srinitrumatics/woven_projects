# Quickstart: Orders Landing Page — Required Corrections

**Prerequisites**: `npm run dev`, a logged-in session, and at least one order with a linked Proposal and populated Bill/Ship Account, Location, and Contact fields (ideally >10 orders total, to validate pagination).

## Validation scenarios

1. **Column order & labels** — Navigate to `/orders`. Confirm columns appear in this exact order: Customer Order #, Status, Proposal #, Proposal Name, Customer PO, Bill to Account, Bill to Location, Bill to Contact, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Request Date, Create Date, Action.
2. **Header display** — Confirm every header renders on a single line with no wrapping/ellipsis, while cell content may truncate.
3. **Sticky first column** — Scroll the table horizontally; confirm "Customer Order #" stays pinned.
4. **Customer Order # hyperlink** — Click a Customer Order # value; confirm it navigates to that order's detail page.
5. **Proposal # hyperlink** — Click a Proposal # value (for an order with a linked proposal); confirm it navigates to that proposal's detail page. Confirm "Proposal Name" next to it shows the same text as plain (non-clickable) text.
6. **Bill/Ship To distinctness** — For an order with distinct Bill to Account, Bill to Location, and Bill to Contact values in Salesforce, confirm all three columns show different, correct values (not the same value repeated). Repeat for Ship to Account/Location/Contact.
7. **Drop Ship** — Confirm the Drop Ship column renders a Yes/No pill matching the style used elsewhere in the portal (e.g. Proposal Detail page's Orders tab).
8. **Create Date vs Request Date** — Confirm these show two distinct dates (record creation vs requested delivery).
9. **Action column** — Confirm the header now reads "Action" (not "Actions") and that edit/clone/delete buttons still function exactly as before.
10. **Pagination** — With >10 orders, confirm pagination controls appear and page navigation works.
11. **Default sort** — Reload the page without sorting; confirm the first row shows the highest Record ID (descending).
12. **Null-dash convention** — For an order missing Bill to Contact or Ship to Contact, confirm the cell renders "-".

## Out-of-scope regression check

Confirm these are **unchanged**:
- The `isManufacturer`/restricted-account gating that hides the Proposal hyperlink for certain account types — still applies to the new "Proposal #" column exactly as it did to the old combined column.
- Search/filter behavior on the page (tab filters, search box) — unaffected by the column changes.
- Edit/Clone/Delete button behavior in the Action column.

## Expected outcome

The Orders landing page's table matches the prescribed 17-column specification exactly, with correct hyperlinks, a fixed first column, no-wrap headers, working pagination, and descending default sort — matching SC-001 through SC-008 in the spec.

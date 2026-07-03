# Quickstart: Shipments Landing Page Corrections

**Prerequisites**: `npm run dev`, a logged-in session, and an account with more than 10 shipments, including at least one shipment with a populated Proposal, Ship to Contact, Drop Ship indicator, box dimension/weight data, and Estimated/Actual Delivery Date.

## Validation scenarios

1. **Column order & labels** — Open the Shipments landing page. Confirm columns appear in this exact order: Shipping Manifest #, Status, Sales Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Customer PO, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Box Count, Box Length, Box Width, Box Height, Box Net Weight, Box Gross Weight, Logistics Partner, Planned Ship Date, Ship Confirmed Date, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, Action.
2. **Header display / sticky column** — Confirm every header renders full-text on a single line with no wrap/ellipsis (this is a fix — headers currently wrap); scroll horizontally and confirm "Shipping Manifest #" stays pinned (regression check — already correct today).
3. **Shipping Manifest # hyperlink (new)** — Click a Shipping Manifest # value; confirm it navigates to that shipment's detail page via a real link, without also triggering the row's own click-to-navigate handler twice.
4. **Customer Quote #, Proposal #, Customer Order # hyperlinks** — Click each populated value; confirm they navigate to the correct quote/proposal/order detail pages (regression check for Customer Quote #/Customer Order # — already work today; new for Proposal #).
5. **Proposal # vs Proposal Name** — Confirm a shipment with a linked proposal shows two independently correct values in "Proposal #" and "Proposal Name", with Proposal # as the clickable one.
6. **Ship to Contact / Drop Ship (new)** — Confirm both columns show correct, non-blank values for a shipment with that data populated; confirm Drop Ship renders as "Yes"/"No".
7. **Box dimension/weight columns (new)** — Confirm Box Count, Box Length, Box Width, Box Height, Box Net Weight, and Box Gross Weight all show correct, non-blank values for a shipment with that data populated.
8. **Planned Ship Date / Ship Confirmed Date** — Confirm both dates render correctly; confirm the second column's header now reads "Ship Confirmed Date" (not "Ship Confirmation").
9. **Estimated Delivery Date / Actual Delivery Date (new)** — Confirm both columns show correct, non-blank date values distinct from Planned Ship Date and Ship Confirmed Date.
10. **Pagination** — With more than 10 shipments, confirm pagination controls appear, showing 10 rows per page, with working navigation (regression check — already implemented).
11. **Default sort** — Reload without sorting; confirm the first row shows the highest Shipping Manifest # (descending) — already correct today, confirm no regression.
12. **Null-dash convention** — For a shipment missing Proposal, Ship to Contact, Drop Ship, any Box field, or either new delivery date, confirm "-" renders rather than a blank cell.

## Fields to verify against the live org during implementation

Per `research.md`, one field mapping remains genuinely unconfirmed:
- The dedicated Proposal Number field (assumed unavailable; falls back to Proposal Name) — same open question as the Invoice landing page (feature 023), never resolved there either.

All other new fields (Ship to Contact, Drop Ship, the six Box fields, Estimated/Actual Delivery Date) are confirmed via `app/proposals/[id]/page.tsx`'s existing, already-shipped mapping of this exact `Shipping_Manifest__c` object — low risk.

## Expected outcome

The Shipments landing page shows the prescribed 28-column layout with 4 hyperlinks (1 new: Shipping Manifest #; 3 regression-checked: Customer Quote #, Proposal #, Customer Order #), 11 new/split columns populated with real data, full-text single-line headers (a genuine fix), and unchanged pagination/sort/sticky-column behavior — matching SC-001 through SC-009 in the spec.

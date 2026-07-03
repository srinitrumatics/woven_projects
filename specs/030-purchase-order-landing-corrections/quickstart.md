# Quickstart: Purchase Order Landing Page Corrections

**Prerequisites**: `npm run dev`, a logged-in session, and access to both a Supplier-type and a Hybrid-type test account with more than 10 purchase orders, including at least one purchase order with a populated Customer Quote, Proposal, Customer Order, Ship to Contact, Drop Ship, Payment Terms, tracking data, and all three delivery/receipt dates.

## Validation scenarios

1. **Column order & labels** — Open the Purchase Order landing page. Confirm columns appear in this exact order: Purchase Order #, Status, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Customer PO, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Cost, Shipping, Grand Total, Payment Terms, Issued Date, Acknowledgement Date, Request Date, Promise Date, Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, Goods Receipt Date, Action.
2. **Column removed** — Confirm "Shipment" (shown previously) is no longer present.
3. **Header display / sticky column** — Confirm every header renders full-text on a single line with no wrap/ellipsis (regression check — already correct today); scroll horizontally and confirm "Purchase Order #" stays pinned.
4. **Purchase Order # hyperlink (new)** — Click a Purchase Order # value; confirm it navigates to that purchase order's detail page via a real link, without double-triggering the row's own click-to-navigate handler.
5. **Supplier account gating** — Log in as (or select) a Supplier-type account. Confirm Customer Quote #, Proposal #, and Customer Order # all render as plain, non-clickable text.
6. **Hybrid account gating** — Log in as (or select) a Hybrid-type account. Confirm Customer Quote #, Proposal #, and Customer Order # all render as working hyperlinks (where populated) to their respective record pages.
7. **Customer PO no longer a link (fix)** — Confirm Customer PO renders as plain text under both account types — it should never be clickable.
8. **Proposal # vs Proposal Name** — Confirm a purchase order with a linked proposal shows values in both "Proposal #" and "Proposal Name", with Proposal # as the (conditionally) clickable one.
9. **Ship to Contact / Drop Ship (new)** — Confirm both columns show correct, non-blank values for a purchase order with that data populated; confirm Drop Ship renders as "Yes"/"No".
10. **Total Cost / Shipping / Grand Total (fix + new)** — Confirm all three show distinct, correct figures for a purchase order with all three populated; confirm "Total Cost" no longer shows the same value as "Grand Total" (this was the pre-existing bug).
11. **Payment Terms (new)** — Confirm the column shows a real payment-terms value for a purchase order with that data populated.
12. **Acknowledgement Date / Promise Date labels** — Confirm the headers read "Acknowledgement Date" and "Promise Date" (not "Acknowledged Date"/"Promised Date").
13. **Tracking & delivery/receipt columns (new)** — Confirm Tracking Number, Tracking Status, Estimated Delivery Date, Actual Delivery Date, and Goods Receipt Date all show correct, non-blank values for a purchase order with that data populated.
14. **Pagination** — With more than 10 purchase orders, confirm pagination controls appear, showing 10 rows per page, with working navigation (regression check — already implemented).
15. **Default sort** — Reload without sorting; confirm the first row shows the highest Purchase Order # (descending) — already correct today, confirm no regression.
16. **Empty state** — With zero purchase orders (or a search with no matches), confirm the empty-state message spans the full new 26-column width without visual misalignment (this also fixes a pre-existing `colSpan` mismatch).
17. **Null-dash convention** — For a purchase order missing any of the new fields, confirm "-" renders rather than a blank cell.

## Fields to verify against the live org during implementation

Per `research.md`, one field mapping remains genuinely unconfirmed:
- The dedicated Proposal Number field (assumed unavailable; falls back to Proposal Name) — the same open question already documented (and never resolved) for the Shipments and Invoice landing pages.

All other new/rewired fields (Ship to Contact, Drop Ship, Shipping, Grand Total, Payment Terms, Tracking Number, Tracking Status, Estimated/Actual Delivery Date, Goods Receipt Date) were confirmed by direct inspection of the existing mapping — they are already read from the API today, just not rendered — low risk.

## Expected outcome

The Purchase Order landing page shows the prescribed 26-column layout with a working Purchase Order # hyperlink, Supplier/Hybrid-conditional gating on three columns (already-existing behavior, now formalized), a corrected Total Cost/Grand Total split, 11 populated new/split columns, and full-text single-line headers with unchanged pagination, sort, and sticky-column behavior — matching SC-001 through SC-011 in the spec.

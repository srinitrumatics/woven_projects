# Quickstart: Supplier Bill Landing Page Corrections

**Prerequisites**: `npm run dev`, a logged-in session, access to both a Supplier-type and a Hybrid-type test account, and several supplier bills with populated Customer Quote, Proposal, Customer Order, ship-to, and financial data.

## Validation scenarios

1. **Column order & labels** — Open the Supplier Bill landing page. Confirm columns appear in this exact order: Supplier Bill #, Status, Purchase Order #, Customer Quote #, Proposal #, Proposal Name, Customer Order #, Ship to Account, Ship to Location, Ship to Contact, Total Lines, Total Amount, Shipping, Grand Total, Billed Date, Payment Terms, Due Date, Remittance Status, Open Balance, Settled Date, Action.
2. **Removed column** — Confirm "Supplier Name" no longer appears anywhere in the table.
3. **Unconditional hyperlinks** — Confirm a populated Supplier Bill # and Purchase Order # are clickable and navigate correctly, for both a Supplier-type and a Hybrid-type account.
4. **Supplier account gating** — As a Supplier-type account, confirm Customer Quote #, Proposal #, and Customer Order # render as plain text.
5. **Hybrid account gating** — As a Hybrid-type account, confirm Customer Quote #, Proposal #, and Customer Order # render as working hyperlinks where populated.
6. **Proposal # / Proposal Name split** — Confirm Proposal Name always shows as plain text (never a link, regardless of account type) and is a distinct column from Proposal #.
7. **Ship-to data** — Confirm Ship to Account, Ship to Location, and Ship to Contact show the bill's actual ship-to values, not the supplier's own name/DBA/contact.
8. **Financial columns** — Confirm Total Amount, Shipping, and Grand Total each show their own distinct, correctly-sourced figure (not all showing the same value, and not what was previously mislabeled).
9. **Open Balance color** — Confirm a bill with Open Balance > 0 shows red, and one with Open Balance <= 0 shows green.
10. **Remittance Status color** — Confirm Paid/Pending/Past Due show green/yellow/red respectively (regression check — already correct).
11. **Headers** — Narrow the browser or resize columns; confirm every header label stays on one line, never wrapping or truncating, while cell content may truncate with an ellipsis (full value on hover).
12. **Sort** — Reload with no manual sort applied; confirm rows are ordered by Supplier Bill # descending (regression check — already correct).
13. **Pagination** — With more than 10 supplier bills, confirm pagination controls appear and page navigation works (regression check — already correct).
14. **Zero-broken-links check** — Inspect every rendered hyperlink's `href` on both account types; confirm none contain the literal string `undefined` or an empty required segment.

## Expected outcome

The Supplier Bill landing page shows its prescribed 21-column layout with "Supplier Name" replaced by the correct Ship to Account/Location/Contact data, "Proposal #" split out as its own gated column alongside a plain "Proposal Name," Supplier Bill #/Purchase Order # as unconditional hyperlinks, Customer Quote #/Proposal #/Customer Order # correctly gated by account type, Total Amount/Shipping/Grand Total each showing their own distinct figure, Open Balance color-coded by sign, full-text single-line headers, and unchanged (already-correct) pagination and DESC default sort — matching SC-001 through SC-007 in the spec.

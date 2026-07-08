# Quickstart: Correct Supplier Bill Debit Memos Table Columns

**Prerequisites**: `npm run dev`, a logged-in session, access to both a Supplier-type and a
Hybrid-type test account, and a supplier bill with at least one debit memo that has a populated
Purchase Order, Customer Quote, and Customer Order (Proposal and Taxes may render empty per
research.md's noted data-availability gap).

## Validation scenarios

1. **Column order & labels** — Open a supplier bill, select the Debit Memos tab. Confirm columns
   appear in this exact order: Debit Memo #, Status, Purchase Order #, Customer Quote #,
   Proposal #, Proposal Name, Customer Order #, Total Lines, Total Cost, Shipping, Taxes, Total
   Debit Amount, Issued Date, Expiration Date, Available Debit Balance, Settled Date.
2. **Rename** — Confirm the first column header reads "Debit Memo #" (not "Debit Memo").
3. **Purchase Order # hyperlink** — Confirm a populated Purchase Order # is clickable (any
   account type) and navigates to `/purchase-orders/{id}`.
4. **Supplier account gating** — As a Supplier-type account, confirm Customer Quote #, Proposal
   #, and Customer Order # render as plain text (no hyperlink) even when populated.
5. **Hybrid account gating** — As a Hybrid-type account, confirm Customer Quote # and Customer
   Order # render as working hyperlinks to `/quotes/{id}` and `/orders/{id}` respectively where
   populated.
6. **Taxes column** — Confirm a "Taxes" column appears between "Shipping" and "Total Debit
   Amount", currency-formatted like its neighbors; confirm it shows the empty-value placeholder
   (not `undefined`, `NaN`, or a crash) if the backend has not yet populated the field.
7. **Proposal columns** — Confirm "Proposal #" and "Proposal Name" appear where specified;
   confirm they show the empty-value placeholder (not a broken link) if the backend has not yet
   populated the field, and confirm "Proposal #" still respects the Supplier/Hybrid gating rule
   even while empty.
8. **Zero-broken-links check** — Inspect every rendered hyperlink's `href` on both account
   types; confirm none contain the literal string `undefined` or an empty required segment.
9. **No regressions** — Confirm existing sorting, column resizing, and pagination on the Debit
   Memos tab still work exactly as before; confirm Total Lines, Total Cost, Shipping, Total
   Debit Amount, Issued Date, Expiration Date, Available Debit Balance, and Settled Date are
   unchanged in content and formatting from today.

## Expected outcome

The Supplier Bill Debit Memos tab shows the full 16-column layout with "Debit Memo #" relabeled,
Purchase Order # always linked, Customer Quote #/Proposal #/Customer Order # linked only for
Hybrid accounts, Proposal Name and Taxes present (populated once the backend supplies the
underlying fields, empty-placeholder otherwise), and zero regressions to existing sorting,
resizing, or pagination — matching SC-001 through SC-003 in the spec.

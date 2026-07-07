# Quickstart: Fix Broken Data Table Hyperlinks

**Prerequisites**: `npm run dev`, a logged-in session, access to a Hybrid-type test account, a Purchase Order Line with populated Customer Quote Line data across all three affected tabs, and the Inventory landing page with at least one product.

## User Story 1 — Customer Quote Line link

1. As a Hybrid-type account, open a Purchase Order Line's detail page.
2. On the **Supplier Bill Lines** tab, find a row with a populated Customer Quote Line. Inspect the rendered cell: it must be either a working hyperlink (no `undefined` in the URL) or plain text — never a link containing `undefined`.
3. Repeat on the **Returns → RTV Lines** sub-tab.
4. Repeat on the **Returns → Debit Memo Lines** sub-tab.
5. Confirm that as a Supplier-type account, the same cell still renders as plain text on all three tabs (unchanged gating behavior).

## User Story 2 — Supplier Bill Line's own link

1. On the Supplier Bill Lines tab, inspect the first (sticky) column's "Supplier Bill Line" link for a row with a populated parent Supplier Bill reference — confirm it still navigates correctly.
2. Confirm this column's link-vs-plain-text behavior now matches the "Supplier Bill #" column's behavior on the same tab (both should only link when the underlying reference is present).

## User Story 3 — Inventory "Average Days Aged" tile

1. Open the Inventory landing page.
2. Click the "Average Days Aged" tile's label, the numeric value, and the "Days" text.
3. Confirm none of these three elements are rendered as clickable links (no underline-on-hover, no `href`) and none append `#` to the URL.
4. Confirm the other three summary tiles ("All", "Put-Away", "Products On Hold") are unaffected — clicking them still filters the inventory list as before.

## Zero-broken-links check

Across all four fixed locations, inspect the browser's rendered HTML (or hover each link) and confirm no `href` attribute anywhere in these files contains the literal string `undefined`.

## Expected outcome

The three Customer Quote Line links never render with a missing identifier (falling back to plain text given current backend data), the Supplier Bill Lines tab's own record-name column is consistently guarded like its sibling column, and the Inventory "Average Days Aged" tile no longer presents itself as clickable when it performs no action — matching SC-001 through SC-004 in the spec.

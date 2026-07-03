# Quickstart: Shipping Manifest Line Page Corrections

**Prerequisites**: `npm run dev`, a logged-in session, and a shipping manifest line with more than 10 inventory positions and more than 10 serial number logs, including at least one row on each tab with a populated product and brand.

## Validation scenarios — Inventory Positions tab

1. **Column order & labels** — Open a shipping manifest line's detail page, select the Inventory Positions tab. Confirm columns appear in this exact order: Inventory Position, Received Date, Age (Days), Product Name, Product Description, Brand Name, Supplier Name, Qty On Hand, Qty Available, Location, Ship Confirmed Date.
2. **Columns removed** — Confirm "Purchase Order", "Unit Cost", "Rack", "Bay", "Level-Position", "Sales Order", and "Shipping Manifest" (shown previously) are no longer present, and "Location" shows a single consolidated value.
3. **Product Name hyperlink (new)** — Click a populated value; confirm it navigates to that product's inventory detail page, or renders as plain text if no id is available.
4. **Brand Name populated (fix)** — Confirm at least one position with a real brand shows that brand's name, not a blank cell.
5. **Header display / sticky column** — Confirm every header renders full-text on a single line with no wrap/ellipsis (this is a fix); confirm "Inventory Position" stays pinned during horizontal scroll (regression check — already correct today).
6. **Pagination (new)** — With more than 10 positions, confirm pagination controls now appear and only 10 rows show per page.
7. **Default sort (fixed)** — Reload the tab without sorting; confirm the first row shows the lowest Inventory Position identifier (ascending). This corrects a confirmed bug where the previous default sort key (`Name`) didn't match the actual data field (`name`), so sorting never applied on first load.
8. **Null-dash convention** — For a position missing Brand Name or Location, confirm "-" renders rather than a blank cell.

## Validation scenarios — Serial Number Logs tab

1. **Column order & labels** — Select the Serial Number Logs tab. Confirm columns appear in this exact order: Serial Number Log, Serial Number #, Product Serial Number, Product Name, Product Description, Brand Name, Shipping Manifest #.
2. **Columns removed** — Confirm "Shipping Manifest Line", "Ship Date", "Ship to Account", and "Active" (shown previously) are no longer present.
3. **Brand Name populated (new)** — Confirm at least one log with a real product brand shows that brand's name — this column did not exist before this feature.
4. **Product Name hyperlink (new)** — Click a populated value; confirm it navigates to the product record page, or renders as plain text if no id is available.
5. **Shipping Manifest # hyperlink** — Click a populated value; confirm it navigates to the parent shipping manifest's detail page (regression check — already works today, only the label changed).
6. **Header display / sticky column** — Confirm headers stay single-line with no wrap, and "Serial Number Log" stays pinned during horizontal scroll.
7. **Pagination (new)** — With more than 10 logs, confirm pagination controls appear, showing 10 rows per page.
8. **Default sort (fixed)** — Reload the tab without sorting; confirm the first row shows the lowest Serial Number Log identifier (ascending) — same case-mismatch bug fix as the Inventory Positions tab.
9. **Null-dash convention** — For a log missing Brand Name or Product Name, confirm "-" renders rather than a blank cell.

## Fields to verify against the live org during implementation

Per `research.md`, the Product Name hyperlink's target id field (assumed `Product_Name__c || Product__c`) on both tabs is unconfirmed — the same open item already documented (and never resolved) for the equivalent columns at the shipping manifest (parent) level. If unavailable, the column continues to render as plain text rather than a broken link.

## Expected outcome

The Inventory Positions tab shows the prescribed 11-column layout with a working Product Name hyperlink, populated Brand Name, consolidated Location, working pagination, and a corrected ascending default sort. The Serial Number Logs tab shows the prescribed 7-column layout with a new Brand Name column, a working Product Name hyperlink, working pagination, and a corrected ascending default sort — matching SC-001 through SC-008 in the spec, and mirroring the exact corrections already delivered one level up in feature 027.

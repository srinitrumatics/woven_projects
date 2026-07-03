# Quickstart: Shipping Manifest Details Page Corrections

**Prerequisites**: `npm run dev`, a logged-in session, and a shipping manifest with: more than 10 shipping manifest lines, more than 10 inventory positions, and more than 10 serial number logs; at least one line with populated Brand, Customer Quote Line, Proposed Product, Product, and box dimension/weight data; at least one inventory position and one serial number log with a populated product/brand.

## Validation scenarios — Shipping Manifest Lines tab

1. **Column order & labels** — Open a shipping manifest, go to the Shipping Manifest Lines tab (default tab). Confirm columns appear in this exact order: Shipping Manifest Line #, Status, Sales Order Line, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Price, Total Order Qty, Total Price, Qty Shipped, Box Count, Box Length, Box Width, Box Height, Box Net Weight, Box Gross Weight, Action.
2. **Columns removed** — Confirm "Shipping Manifest" (parent reference), "Tracking Number", "Tracking Status", "Estimated Delivery Date", and "Actual Delivery Date" (shown previously) are no longer present.
3. **Header display / sticky column** — Confirm every header renders full-text on a single line with no wrap/ellipsis (this is a fix — headers currently wrap); confirm "Shipping Manifest Line #" stays pinned while scrolling horizontally (regression check — already correct today).
4. **Shipping Manifest Line # hyperlink** — Click a line value; confirm it navigates to that line's detail page (regression check — already works today).
5. **Customer Quote Line hyperlink (new)** — Click a populated value; confirm it navigates to the quote/quote-line detail page.
6. **Proposed Product hyperlink (new)** — Click a populated value; confirm it navigates to the expected product record page, or renders as plain text if no id is available (graceful degradation).
7. **Product Name hyperlink (new)** — Click a populated value; confirm it navigates to the product record page, or renders as plain text if no id is available.
8. **Brand Name populated** — Confirm at least one line with a real brand shows that brand's name, not a blank cell (regression fix — was always blank before this feature).
9. **Box measurement fields** — Confirm Box Count, Box Length, Box Width, Box Height, Box Net Weight, and Box Gross Weight all show correct, non-blank values for a line with that data populated.
10. **Pagination (new)** — With more than 10 lines, confirm pagination controls now appear and only 10 rows show per page, with working navigation. This tab had **no pagination at all** before this feature.
11. **Default sort** — Reload the tab without sorting; confirm the first row shows the lowest Shipping Manifest Line # (ascending) — already correct today, confirm no regression after the sort-hook migration.
12. **Null-dash convention** — For a line missing Customer Quote Line, Proposed Product, or Product, confirm the cell renders "-" (or plain text/no broken link for hyperlinked columns).

## Validation scenarios — Inventory Positions tab

1. **Tab now reachable (new)** — Confirm an "Inventory Positions" tab is now visible and selectable in the tab bar, alongside Shipping Manifest Lines, Serial Numbers Logs, and Files.
2. **Column order & labels** — Select the Inventory Positions tab. Confirm columns appear in this exact order: Inventory Position, Received Date, Age (Days), Product Name, Product Description, Brand Name, Supplier Name, Qty On Hand, Qty Available, Location, Ship Confirmed Date.
3. **Columns removed** — Confirm "Purchase Order", "Unit Cost", "Rack", "Bay", "Level-Position", "Sales Order", and "Shipping Manifest" (shown previously) are no longer present, and that "Location" now shows a single consolidated value.
4. **Product Name hyperlink (new)** — Click a populated value; confirm it navigates to that product's inventory detail page, or renders as plain text if no id is available.
5. **Brand Name populated** — Confirm at least one position with a real brand shows that brand's name, not a blank cell.
6. **Location value** — Confirm the Location column shows a real rack/bay/level/position identifier for a populated position; confirm it degrades to "-" gracefully if the underlying field is unavailable (per the unconfirmed field mapping in `research.md` §15).
7. **Header display / sticky column** — Confirm headers stay single-line with no wrap, and "Inventory Position" stays pinned during horizontal scroll.
8. **Pagination (new)** — With more than 10 positions, confirm pagination controls appear, showing 10 rows per page.
9. **Default sort (changed)** — Reload the tab without sorting; confirm the first row shows the lowest Inventory Position identifier (ascending) — this is a behavior change from the previous descending default.
10. **Null-dash convention** — For a position missing Brand Name or Location, confirm "-" renders rather than a blank cell.

## Validation scenarios — Serial Number Logs tab

1. **Column order & labels** — Select the Serial Numbers Logs tab. Confirm columns appear in this exact order: Serial Number Log, Serial Number #, Product Serial Number, Product Name, Product Description, Brand Name, Shipping Manifest #.
2. **Columns removed** — Confirm "Shipping Manifest Line", "Ship Date", "Ship to Account", and "Active" (shown previously) are no longer present.
3. **Brand Name populated (new)** — Confirm at least one log with a real product brand shows that brand's name — this column did not exist before this feature.
4. **Product Name hyperlink (new)** — Click a populated value; confirm it navigates to the product record page, or renders as plain text if no id is available.
5. **Shipping Manifest # hyperlink** — Click a populated value; confirm it navigates to the parent shipping manifest's detail page (regression check — already works today, only the label changed).
6. **Header display / sticky column** — Confirm headers stay single-line with no wrap, and "Serial Number Log" stays pinned during horizontal scroll.
7. **Pagination (new)** — With more than 10 logs, confirm pagination controls appear, showing 10 rows per page.
8. **Default sort (changed)** — Reload the tab without sorting; confirm the first row shows the lowest Serial Number Log identifier (ascending) — this is a behavior change from the previous descending default.
9. **Null-dash convention** — For a log missing Brand Name or Product Name, confirm "-" renders rather than a blank cell.

## Fields to verify against the live org during implementation

Per `research.md`, several field mappings are inferred from precedent elsewhere in the codebase rather than confirmed directly on the objects used by these three tabs:
- Shipping Manifest Lines: the Proposed Product id field (assumed `Proposed_Product__c`) and the Product id field (assumed `Product__c`).
- Inventory Positions: whether `Inventory_Location_Name` is in fact the RBLP-formatted "Location" value the business expects, or whether a Rack/Bay/Level/Position concatenation is required instead (see `research.md` §15 — the most open item in this feature).
- Serial Number Logs: the Product id field (assumed `Product__c`, same open question as Shipping Manifest Lines).

If any of these fields/routes are unavailable, the corresponding column should render as plain text or "-" rather than a broken link or wrong value — confirm this degrades gracefully.

## Expected outcome

The Shipping Manifest Lines tab shows the prescribed 19-column layout with 4 hyperlinks (3 new), working pagination (net new), and ascending default sort (via the migrated `useSortableData` hook). The Inventory Positions tab is now reachable and shows the prescribed 11-column layout with 1 hyperlink, working pagination, and ascending default sort (a genuine direction change). The Serial Number Logs tab shows the prescribed 7-column layout with 2 hyperlinks (1 new) and a new Brand Name column, working pagination, and ascending default sort — matching SC-001 through SC-010 in the spec.

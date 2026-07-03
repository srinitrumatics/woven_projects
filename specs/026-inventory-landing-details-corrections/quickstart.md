# Quickstart: Inventory Landing Page & Inventory Details Page Corrections

**Prerequisites**: `npm run dev`, a logged-in session, and an account with: more than 10 My Inventory items (to see pagination), at least one item with a populated Brand Name and at least one with Qty Available = 0 and one with Qty Available > 0; and a product's Inventory Details page with more than 10 positions, including at least one position with only a PO # and (if available) one with only an RMA #.

## Validation scenarios — My Inventory landing page

1. **Column order & labels** — Open My Inventory. Confirm columns appear in this exact order: Product Name, Description, Brand Name, Product Family, Qty On Hand, Qty Available, Avg Unit Price, Total OH Value, Total CV (IN), Total CV (SQFT), Avg Age (Days), Total Positions, Sites, Action.
2. **Header display / sticky column** — Confirm every header renders full-text on a single line with no wrap/ellipsis (regression check — already correct today); scroll horizontally and confirm Product Name stays pinned.
3. **Product Name hyperlink** — Click a Product Name value; confirm it navigates to that product's Inventory Details page via a real link (inspect that it renders as an `<a>`, not a button).
4. **Brand Name populated** — Confirm at least one item with a real brand shows that brand's name, not a blank/dash cell (regression fix — was always blank before this feature).
5. **Qty Available color coding** — Confirm an item with Qty Available = 0 renders red, and an item with Qty Available > 0 renders green.
6. **Total OH Value formatting** — Confirm the Total OH Value cell renders as regular (non-bold) text.
7. **Pagination** — With more than 10 items, confirm pagination controls appear, showing 10 rows per page, with working navigation (regression check — already implemented).
8. **Default sort** — Reload without sorting; confirm the first row shows the highest Product Name value alphabetically (descending) — already correct today, confirm no regression.
9. **Checkbox column unaffected** — Confirm the row-selection checkbox and "Request Transfer" flow still function as before (out of scope for this feature, regression check only).
10. **Null-dash convention** — For an item missing Brand Name or any other optional field, confirm "-" renders rather than a blank cell.

## Validation scenarios — Inventory Details page

1. **Column order & labels** — Open a product's Inventory Details page. Confirm columns appear in this exact order: Inventory Position ID, Received Date, Age (Days), PO # | RMA #, Supplier Name, Qty on Hand, Qty Available, On Hold, Unit Price, Total OH Value, Total CV (IN), Total CV (SQFT), Sales Order #, Shipping Manifest, Condition, Invoiced, Location, Site.
2. **Header display / sticky column** — Confirm headers stay single-line, no wrap, and "Inventory Position ID" stays pinned during horizontal scroll (regression check — already correct today).
3. **Column reorder** — Confirm Location and Site now appear as the *last two* columns (previously right after Total Price/OH Value), and Total CV (IN)/(SQFT) now appear immediately after Total OH Value (previously after Location/Site).
4. **PO # | RMA # fallback** — For a position with a PO # but no RMA #, confirm the PO # displays; for a position with only an RMA # (if test data has one), confirm the RMA # displays instead. If no RMA field is available from the API, confirm the column gracefully continues to show the PO # (or "-") without a broken cell.
5. **Shipping Manifest spacing** — Confirm the header reads "Shipping Manifest" (with a space), not "ShippingManifest".
6. **Total OH Value formatting** — Confirm the Total OH Value cell renders as regular (non-bold) text and the header no longer reads "Total Price".
7. **Qty Available color coding** — Confirm a position with Qty Available = 0 renders red and one with Qty Available > 0 renders green (regression check — already implemented).
8. **Pagination** — With more than 10 positions, confirm pagination controls appear, showing 10 rows per page (regression check — already implemented).
9. **Default sort** — Reload without sorting; confirm the first row shows the lowest Inventory Position ID (ascending) — already correct today, confirm no regression.
10. **Null-dash convention** — For a position missing Location, Site, Sales Order #, or PO/RMA, confirm "-" renders rather than a blank cell.

## Fields to verify against the live org during implementation

Per `research.md`, one field mapping is inferred from precedent elsewhere in the codebase rather than confirmed directly on the `Inventory_Position__c` object:
- Inventory Details: the RMA fallback field (assumed `RMA_Name`) for the "PO # | RMA #" column.

If this field is unavailable, the column should continue to show only the PO # (or "-" if neither is present) rather than a broken cell — confirm this degrades gracefully.

## Expected outcome

My Inventory shows its existing 14-column layout with Brand Name populated, Qty Available color-coded, Total OH Value non-bold, Product Name as a real hyperlink, and three relabeled headers (Brand Name, Avg Age (Days), Sites) — matching SC-001 through SC-012 in the spec. Inventory Details shows its 18 columns reordered (Location/Site moved to the end, Total CV columns moved up), five relabeled headers, a working PO #/RMA # fallback, corrected Shipping Manifest spacing, and non-bold Total OH Value — with pagination and sort order unchanged (already correct) on both pages.

# Quickstart: Proposal Line Page — Fulfillment & Returns Corrections

**Prerequisites**: `npm run dev`, a logged-in session, and a Proposal Line with related Customer Quote Line, Sales Order Line, Shipping Manifest Line, Invoice Line, RMA Line, and Credit Memo Line records (ideally >10 of at least one type, to validate pagination).

## Validation scenarios

1. **Sub-tab order (Fulfillment)** — Navigate to `/proposals/[id]/lines/[lineid]`, open the Fulfillment tab. Confirm sub-tab button order: Customer Quote Lines → Sales Order Lines → Shipping Manifest Lines → Invoice Lines.
2. **Sub-tab order (Returns)** — Open the Returns tab. Confirm order: RMA Lines → Credit Memo Lines (RTV Lines/Debit Memo Lines may follow for non-Customer/NSO accounts — unchanged).
3. **Customer Quote Lines columns** — Confirm exact order/labels per spec FR-010; confirm "Customer Quote Line" and "Customer Quote #" are both clickable hyperlinks; confirm "Action" column is present.
4. **Sales Order Lines columns** — Confirm exact order/labels per FR-011; confirm Qty Picked/Back Order Qty no longer appear; confirm "Customer Quote Line" is a working hyperlink.
5. **Shipping Manifest Lines columns** — Confirm exact order/labels per FR-012, including Box Count → Box Length → Box Width → Box Height → Box Net Weight → Box Gross Weight in that order; confirm Tracking Number/Estimated Delivery Date/Tracking Status/Actual Delivery Date no longer appear; confirm "Shipping Manifest Line #" is a hyperlink and "Sales Order Line" is plain text; confirm "Action" column is present.
6. **Invoice Lines columns** — Confirm exact order/labels per FR-013, including Sales Order Line → Purchase Order Line → Customer Quote Line order; confirm "Total Order Qty" shows the `gtherp__Total_Order_Qty__c` value (not the old Invoiced Qty); confirm "Invoice Line" and "Invoice #" are both hyperlinks; confirm "Action" column is present.
7. **RMA Lines columns** — Confirm exact order/labels per FR-014; confirm "Customer Quote Line" is now a working hyperlink; confirm Tracking Number/Estimated Delivery Date/Tracking Status/Actual Delivery Date no longer appear; confirm "Goods Receipt Date" is still the last column.
8. **Credit Memo Lines columns** — Confirm exact order/labels per FR-015; confirm "Invoice Line" column no longer appears; confirm a new "Customer Quote Line" hyperlink column appears after "Sales Order Line".
9. **Header display** — In every sub-tab above, confirm headers render on a single line with no wrapping/ellipsis, while cell content may truncate with ellipsis.
10. **Sticky first column** — In every sub-tab, scroll the table horizontally and confirm the first column stays pinned.
11. **Pagination** — Load a sub-tab with >10 records; confirm pagination controls appear and page navigation works.
12. **Default sort** — Reload each sub-tab without manually sorting; confirm the first row shown has the lowest Record ID (ascending).
13. **Null-dash convention** — Confirm any empty/null field (e.g. Brand Name, since no line-item object has a dedicated Brand field per feature 019's research) renders as "-".

## Out-of-scope regression check

Confirm these are **unchanged**:
- RTV Lines and Debit Memo Lines sub-tabs on the Returns tab (still present for non-restricted accounts, still hidden for Customer/NSO).
- The parent Proposal Details page's Fulfillment/Returns tabs (feature 018) — since this feature only adds optional fields to shared types, the parent page's tables should render exactly as before.

## Expected outcome

All 6 sub-tabs on the Proposal Line page match their prescribed column specifications exactly, with correct hyperlinks, sticky first columns, no-wrap headers, working pagination, and ascending default sort — matching SC-001 through SC-008 in the spec.

# Quickstart: Validating the Sort Icon Overlap Fix

## Prerequisites

- Repo checked out on branch `125-header-sort-icon-overlap` (or with the fix applied locally).
- `npm install` completed.
- No live Salesforce connection required — services fall back to mock data automatically per the project's Constitution (Principle I).

## Setup

```bash
npm run dev
```

Open http://localhost:3000 and log in (or use whatever auth bypass/mock session the dev environment already provides).

## Validation scenarios

Run through each of these and confirm the label and sort icon never overlap, per spec FR-001/FR-002:

1. **Narrow fixed-width columns with long labels (core repro case)**
   - Navigate to an Order's line detail → **Taxes** tab (`app/orders/[id]/components/LineTaxesTab.tsx`, or the Quote/Proposal/Invoice equivalents).
   - Confirm headers like "Excise Tax Amount", "GRT Amount", "Sales Tax Rate" render fully, wrapping to a second line if needed, with the sort icon fully visible and never covered by label text.

2. **Box-dimension columns (Fulfillment tab)**
   - Navigate to a line's **Fulfillment** tab shipping sub-tab (`LineFulfillmentsTab.tsx`).
   - Confirm "Box Count", "Box Length", "Box Gross Weight", etc. render without overlap.

3. **Shipping Manifest lines ("menu details")**
   - Navigate to a Shipment's manifest lines table (`app/shipments/[id]/components/ShipmentLinesTab.tsx`) and the Quote equivalent (`QuoteShippingManifestsSubTab.tsx` / `QuoteLineShippingManifestLinesSubTab.tsx`).
   - Confirm no header overlap.

4. **User-resize to minimum width**
   - On any of the above tables, drag a column's resize handle to its narrowest allowed width.
   - Confirm the header still shows full label text (wrapping as needed) and the icon stays visible/clickable — no overlap reappears at the floor width.

5. **Sorted vs. unsorted state**
   - Click a column header to sort ascending, then descending, then back to unsorted.
   - Confirm label/icon spacing and alignment look identical in all three states (only the icon glyph changes).

6. **Cross-page consistency (spec FR-003 / User Story 2)**
   - Compare header layout on at least 3 different line/manifest detail pages (e.g. Order Taxes tab, Shipment manifest lines, Purchase Order line table).
   - Confirm spacing/alignment is visually identical across all three.

7. **No regression on landing/list pages (FR-006)**
   - Spot-check a landing page table (e.g. `/orders`, `/products`) with wide columns.
   - Confirm headers still render on one line exactly as before, with no unnecessary wrapping and no ellipsis reintroduced.

## Expected outcome

All 7 scenarios show no header label/icon overlap, no ellipsis truncation, and consistent layout — matching spec.md Success Criteria SC-001 through SC-004.

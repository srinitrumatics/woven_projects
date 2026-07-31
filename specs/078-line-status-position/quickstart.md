# Quickstart: Validating Line Status Indicator Repositioning

## Prerequisites

- Local dev server running (`npm run dev`).
- Logged in with a portal account that has at least one Invoice and one Shipment, each with one or more line items.
- Reference page open in a separate tab: any Supplier Bill line detail page (`/supplier-bills/[id]/lines/[lineid]`), and — since this feature follows directly from it — any Order/Proposal/Quote line detail page already fixed in `077-line-status-parity`.

## Scenario 1 — Invoice Line status position (P1)

1. Navigate to `/invoices`, open any invoice, then open any line item (`/invoices/[id]/lines/[lineid]`).
2. **Expected**: The status badge (e.g., "Paid", "Sent", "Draft", "Overdue" — whatever color/text it showed before) now appears immediately next to "Line X of Y", near the top-left.
3. **Expected**: No status badge appears anymore in the top-right area near "Back to Invoice" — only the button remains there.
4. Compare the badge's text and color against what it showed before this change (e.g., check a screenshot or the `077`/pre-existing behavior) — must be identical, only relocated.
5. Use the line-navigation controls to move to a different line. **Expected**: the badge updates to that line's own status, still in the new position.

## Scenario 2 — Shipment Line status position (P2)

1. Navigate to `/shipments`, open any shipment, then open any line item (`/shipments/[id]/lines/[lineid]`).
2. **Expected**: The status indicator (fixed green pill, unchanged styling) now appears immediately next to "(Line X of Y)", near the top-left.
3. **Expected**: No status indicator appears anymore in the top-right area near "Back to Shipment" — only the button remains there.
4. Navigate between lines; confirm the text still updates per line, unchanged in styling.

## Cross-cutting checks (both pages)

- Confirm the "Back to Invoice" / "Back to Shipment" button remains correctly positioned and styled in the top-right, with no leftover gap or misalignment from the removed sibling element.
- Toggle light/dark mode and confirm both indicators remain exactly as legible as they were before this change (no new dark-mode regressions, since no styling was touched).
- Resize to a narrow viewport and confirm the new placement doesn't cause overflow or wrapping issues in the "Line X of Y" row.
- Confirm no other page behavior changed: line navigation, any Edit/Save actions, tab switching, and loading-skeleton states should all behave exactly as before.

## Done when

- Both scenarios above pass.
- Side-by-side comparison across all six line-detail page types (Orders, Proposals, Quotes, Supplier Bills, Invoices, Shipments) shows the status indicator in the same position (next to "Line X of Y") on every one.

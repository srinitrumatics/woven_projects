# Quickstart: Validating Line Status Indicator Parity

## Prerequisites

- Local dev server running (`npm run dev` from repo root; see `CLAUDE.md` for env var requirements — Salesforce credentials must be configured for real data, otherwise mock data is used per Constitution Principle I).
- Logged in with a portal account that has at least one Order, one Proposal, and one Quote, each with one or more line items.
- Reference page open in a separate tab for side-by-side comparison: any `Supplier Bill → line detail` page (`/supplier-bills/[id]/lines/[lineid]`).

## Scenario 1 — Order Line status (P1)

1. Navigate to `/orders`, open any order, then open any line item (`/orders/[id]/lines/[lineId]`).
2. **Expected**: A status badge appears immediately to the right of the "Line X of Y" indicator, near the top-left of the page (not beside the Edit/Save/Back buttons on the top-right).
3. Compare the badge's color/shape against the Supplier Bill Line reference tab — they should be visually indistinguishable in style.
4. Use the line-navigation controls (prev/next) to move to a different line. **Expected**: the badge updates to that line's own status, not the previous line's.
5. If the order line's status field is unavailable from the data source (see `research.md` §2 risk note), confirm the badge still renders using the "Draft" fallback rather than disappearing or breaking the page.

## Scenario 2 — Proposal Line status (P2)

1. Navigate to `/proposals`, open any proposal, then open any line item (`/proposals/[id]/lines/[lineid]`).
2. **Expected**: The status badge next to "Line X of Y" (already present today) now shows a real, non-empty status value (e.g., "Draft", "Approved") instead of appearing blank/empty.
3. Navigate between lines using the line-navigation controls. **Expected**: the badge value changes correctly per line.
4. If a specific proposal line genuinely has no status set upstream, confirm the badge falls back to "Draft" rather than rendering empty.

## Scenario 3 — Quote Line status (P3)

1. Navigate to `/quotes`, open any quote, then open any line item (`/quotes/[id]/lines/[lineid]`).
2. **Expected**: A status badge now appears next to "Line X of Y" (previously absent entirely).
3. Confirm the displayed status matches what's shown for that same line elsewhere in the app (e.g., in the parent Quote's line table), and that the badge style matches the Supplier Bill Line reference.
4. Navigate between lines; confirm the badge updates per line.

## Cross-cutting checks (all three pages)

- Toggle light/dark mode and confirm the badge remains legible and correctly colored in both.
- Resize the browser window / test on a narrow viewport to confirm the badge doesn't break the existing header layout or cause overflow.
- Confirm no other page behavior changed: line navigation, Edit/Save (Orders only), Back-to-parent links, and the loading skeleton state should all behave exactly as before.

## Done when

- All three scenarios above pass.
- Side-by-side comparison with the Supplier Bill Line reference page shows consistent badge placement, shape, and color-per-status across all four line-detail page types.

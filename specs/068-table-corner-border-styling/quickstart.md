# Quickstart: Validate Consistent DataTable Corner & Border Styling

## Prerequisites

- `DATABASE_URL` and Salesforce env vars configured per `CLAUDE.md` (or rely on the automatic
  mock-data fallback when Salesforce credentials are absent).
- Dependencies installed (`npm install`).

## Setup

```bash
npm run dev
```

Open `http://localhost:3000` and log in (or use the app's existing auth flow).

## Validation Scenarios

For each location below, confirm: **(a)** the table/container has visibly rounded top corners,
**(b)** no border line runs around the outer perimeter, **(c)** every row has a bottom border.
Repeat in both light and dark mode.

| # | Page / Tab | What to check |
|---|---|---|
| 1 | Order → Configure Order (`/configure`) — Lines table | Populated table wrapper: rounded corners, no outer border (previously had `border border-gray-200`) |
| 2 | Proposal detail → Fulfillments tab, each sub-section (Customer Quotes, Sales Orders, Invoices, Shipping Manifests) filtered/loaded to zero results | Empty-state container: rounded corners, no outer border (previously had `border border-gray-100`) |
| 3 | Proposal detail → Purchases tab, both sub-sections, filtered/loaded to zero results | Empty-state container: rounded corners, no outer border |
| 4 | `/orders`, `/proposals` lists; Order detail → Returns tab; Proposal detail → Elements/Taxes tabs; Purchase Order detail → Lines tab | Spot-check regression: still correctly rounded/borderless per the prior `067` fix — should show no change |

## Additional checks

- **Sticky header**: Confirm the Configure Order Lines table's header (if pinned during vertical
  scroll) still renders with rounded corners after the border is removed.
- **Horizontal scroll**: Confirm the Configure Order Lines table's rounded corners are not clipped
  incorrectly when scrolled horizontally.
- **Empty-to-populated transition**: On the Fulfillments/Purchases tabs, toggle a filter so the
  view moves from empty-state to populated and back; confirm no layout shift or border flash
  occurs between the two states.

## Expected Outcome

All three corrected locations render with the same rounded-corner, borderless-outer-edge, and
row-bottom-border treatment as the rest of the app's tables, in both light and dark mode —
satisfying SC-001 through SC-005 in `spec.md`, and closing the two gaps identified by the prior
`/speckit-analyze` run against `specs/067-datatable-header-border-consistency`.

## Regression check

```bash
npm run lint
npm run build
```

Both must complete without new errors introduced by the styling change.

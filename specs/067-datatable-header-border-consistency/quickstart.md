# Quickstart: Validate Data Table Header Corners & Border Styling

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

For each page below, confirm: **(a)** header row has visibly rounded top-left/top-right corners,
**(b)** no border line runs around the full outer perimeter of the table, **(c)** every row —
including the last — has a visible bottom border. Repeat each check in both light and dark mode
(toggle via the app's theme control).

| # | Page / Tab | Reference for "before" state |
|---|---|---|
| 1 | `/orders` (Orders list) | Was "sharp corner", no border |
| 2 | `/proposals` (Proposals list) | Was "sharp corner", no border |
| 3 | `/inventory` (Inventory list) | Was ad-hoc `rounded-lg` only, no border |
| 4 | Order detail → Returns tab (RMA table) | Was rounded + full outer border |
| 5 | Proposal detail → Elements tab | Already correct — use as the visual reference |
| 6 | Proposal detail → Taxes tab | Was rounded + full outer border |
| 7 | Purchase Order detail → Lines tab | Was rounded + full outer border |
| 8 | Quote detail → Lines tab | Was "sharp corner", no border |
| 9 | Invoice detail → Files tab | Was "sharp corner", no border |
| 10 | Contacts / user management list | Raw markup outlier — verify manually updated |

## Additional checks

- **Sticky header**: On the Elements tab and Taxes tab (which pin the header while scrolling
  vertically), scroll the table body and confirm the header stays visible with correctly rounded
  corners (no square corners revealed).
- **Horizontal scroll**: On Inventory or PO Lines (wide tables), scroll horizontally and confirm
  the header's rounded corners remain clipped correctly at both scroll extremes.
- **Empty/loading states**: Trigger an empty result (e.g., filter to no matches) and confirm the
  surrounding container still shows rounded corners and no outer border.
- **Sort/resize interactions**: Click a sortable column header and drag a column resize handle;
  confirm both still work and the header's rounded-corner appearance is unaffected.

## Expected Outcome

All 10 pages/tabs above render with an identical header corner radius, no outer table border, and
a bottom border under every row (including the last), consistently in both light and dark mode —
satisfying SC-001 through SC-004 in `spec.md`.

## Regression check

```bash
npm run lint
npm run build
```

Both must complete without new errors introduced by the styling change.

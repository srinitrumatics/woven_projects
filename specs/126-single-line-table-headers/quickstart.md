# Quickstart: Validating Single-Line, Non-Ellipsis Data Table Headers

## Prerequisites

- `npm run dev` running locally (`http://localhost:3000`)
- A logged-in session (Salesforce-connected, or mock data if SF credentials aren't configured)
- Browser devtools open to inspect rendered header cell widths

## Setup

```bash
npm run dev
```

No database migration, env var, or seed data is needed — this is a presentational-only change to `components/ui/SortableHeader.tsx`.

## Validation scenarios

### 1. Single line on a detail-page table with long labels (FR-001, FR-003)

1. Open an order's line detail Taxes tab (e.g. `/orders/[id]/lines/[lineid]` → Taxes) or a Shipping Manifest lines table.
2. Resize the browser window narrower, or use the column resize handle to shrink a column with a long label (e.g. "Excise Tax Amount").
3. **Expected**: the label always renders on one line. The column widens (rather than the label wrapping to a second line) if the label needs more room than the current column width.
4. **Expected**: no visual overlap between the label text and the sort icon at any point during the resize.

### 2. No ellipsis anywhere (FR-002)

1. Repeat step 2 above on multiple pages: a landing/list page (e.g. `/orders`, `/quotes`) and a detail/manifest page (e.g. a Shipping Manifest lines table).
2. **Expected**: no header ever shows a trailing "…" or clipped text, regardless of column width.

### 3. Resize floor matches label width (FR-004)

1. On a resizable detail-page table, drag a column's resize handle as far left (narrow) as it will go.
2. **Expected**: the column stops shrinking once it reaches the label's natural single-line width — it does not go narrower and does not wrap or overlap the icon.

### 4. Consistency across pages (FR-005, SC-004)

1. Open one landing/list page and one detail/manifest/line page side by side (or in two tabs).
2. **Expected**: header label/icon spacing, alignment, and single-line behavior look identical on both.

### 5. No regressions (FR-006, FR-007, SC-005)

1. On any affected table: click a header to sort ascending, then again for descending, then a different column.
2. **Expected**: sort still works, sticky columns (if any) remain sticky, and the sort icon (`↑`/`↓`/`↕`) remains visible and clickable in both sorted and unsorted states.
3. Resize a column wider than its default.
4. **Expected**: the column honors the wider width as before (no regression to the "wider than needed" resize case).

## Static checks

```bash
npm run lint   # if an ESLint config is present in the repo — see prior session note; may need setup first
```

No automated visual/UI test harness exists in this repo for table headers (per the plan's Technical Context) — validation is manual, via the scenarios above.

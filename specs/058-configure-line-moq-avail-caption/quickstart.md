# Quickstart: Validate Configure Order Lines MOQ/Avail Caption

## Prerequisites

- Repo dependencies installed (`npm install`).
- Either live Salesforce credentials configured so `/configure`'s "Browse Catalog" panel and
  quick-add search load real products with varied MOQ/available-to-sell values, or rely on the
  app's automatic mock-data fallback when credentials are absent — either is sufficient since this
  feature only depends on `fetchProductDetails`'s existing `avail` field being present in the
  response.
- A logged-in session against the main portal (Configure Order is behind the Salesforce session
  middleware).
- Note from the most recent live-verification session (feature 057): this org's live product
  catalog may have `Available_To_Sell__c` unset (null) on most/all products. If so, the caption
  will correctly show "Avail: 0" for every line (the documented fallback), which still proves the
  caption renders and reads the right field — it just won't show a variety of non-zero values
  unless the org's catalog data changes.

## Setup

```bash
rm -rf .next   # avoid stale build artifacts from a previous session (skip if another `next dev` is already running against this project — see project verification notes)
npm run dev
```

Navigate to `http://localhost:3000/configure` (login first via `/auth` if redirected).

## Validation scenarios

Map directly to the spec's Acceptance Scenarios (`spec.md`).

1. **Caption appears under Order Qty for a product line** (User Story 1, scenario 1)
   - Add a product to the order lines table (via "Quick add product...", the "Browse Catalog"
     panel's "+" button, or drag-and-drop).
   - Confirm a caption reading "MOQ: {value} / Avail: {value}" appears directly beneath that line's
     Order Qty stepper (below the −/input/+ controls), in the same small gray text style already
     used for this purpose on the Order Detail page's My Order table.
   - Confirm the MOQ value shown matches the value already shown in that line's existing, separate
     "MOQ" column (SC-004) — the two must never disagree.

2. **Each line's caption is independent** (scenario 2)
   - Add two products with different MOQ and/or available-to-sell values.
   - Confirm each line's caption shows only its own product's values, and adjusting one line's
     Order Qty (via the existing +/− stepper) does not change the other line's caption.

3. **Group rows show no caption** (scenario 3)
   - Use "+ Add Group" to add a group row.
   - Confirm the group row shows no MOQ/Avail caption (and no Qty cell at all), matching existing
     group-row behavior.

4. **Missing/invalid MOQ defaults to 1** (scenario 4, Edge Cases)
   - If a product with a missing/blank MOQ is available in the catalog, add it and confirm its
     caption shows "MOQ: 1", matching its existing MOQ column value and the existing MOQ-default
     behavior from feature 053.

5. **No new availability ceiling** (FR-007)
   - Click the increase (+) control repeatedly on a line whose Avail is a small number (or 0).
     Confirm the Order Qty keeps incrementing with no block or error — the caption is informational
     only, consistent with this page's existing no-ceiling behavior.

6. **Draft round-trip carries `avail` forward** (data-model.md state transitions)
   - Add a product, confirm its caption shows a real (or 0) Avail value, then reload `/configure`.
   - Confirm the reloaded line (restored from the `gth-configured-draft` localStorage draft) still
     shows the same caption values — proving `avail` now survives the save/reload cycle instead of
     being silently dropped.

## Expected outcome

All six scenarios pass with no console errors, matching the acceptance scenarios and functional
requirements in `spec.md`. Since this repo has no automated component test runner, this manual pass
through `npm run dev` in a browser is the primary verification method (see Technical Context /
Testing in `plan.md`).

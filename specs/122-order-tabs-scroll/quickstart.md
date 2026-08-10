# Quickstart: Validating Scrollable Order Details Tab Row

## Prerequisites

- Local dev environment running (`npm run dev`), logged in with access to an order details page (`/orders/[id]`).
- A browser resizable to a width around 1024–1300px (or DevTools responsive mode, matching the reported screenshot's ~1200px width) — the bug is specific to the `lg` breakpoint and up, where the search box and tab row share one horizontal line.

## Validation steps

### 1. Reproduce the original clipping (before/regression baseline)

Open an order details page and resize the browser (or DevTools responsive view) to roughly 1100–1250px wide. Look at the row containing the search box and the tabs (Add Products / My Order / Taxes / Fulfillment / Returns / Files) directly above the tab content area.

**Expected before the fix**: the last tab ("Files") is visually cut off at the right edge of the card, matching the reported screenshot.

### 2. Confirm the tab row now scrolls (User Story 1, Scenarios 1–2)

At the same narrow width, after the fix.

**Expected**: a horizontal scrollbar (or scroll affordance) appears under the tab row when it doesn't fit; scrolling it reveals every tab including "Files"; clicking "Files" after scrolling to it switches to the Files section exactly as any other tab does.

### 3. No regression at wide viewport (Scenario 3)

Widen the browser to a normal desktop width (e.g. 1600px+) where all 6 tabs and the search box comfortably fit.

**Expected**: no scrollbar appears, and the row looks exactly as it did before this fix — same spacing, same tab positions.

### 4. Search box and refresh button unaffected (FR-004)

At the narrow width from Step 2, confirm the search input still spans its expected width and the catalog refresh button (when "Add Products" is the active tab) still renders and functions normally.

### 5. Sub-tab row already correct (Scenario 4, no change expected)

Switch to the "Fulfillment" tab and, at a narrow width, look at its sub-tab row (Proposals / Customer Quotes / Sales Orders / Shipping Manifests / Invoices).

**Expected**: this row already scrolls correctly (per `specs/117-subtab-header-scrollbar`) and shows no change from this feature.

### 6. Mobile/tablet layout below the `lg` breakpoint unaffected

Narrow the browser below ~1024px, where the row switches to a stacked column layout (search box above, tabs below, each full-width).

**Expected**: no change from today — this layout was already unaffected by the bug and remains unaffected by the fix.

## Static check

```bash
npx tsc --noEmit
```

No new automated tests are introduced (consistent with Constitution Principle V — no existing suite covers responsive tab-row layout); the steps above are the acceptance evidence for this feature.

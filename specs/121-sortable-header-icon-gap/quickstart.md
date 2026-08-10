# Quickstart: Validating the Header/Sort-Icon Gap

## Prerequisites

- Local dev environment running (`npm run dev`), logged in with access to at least two list pages (e.g. Orders and Invoices).

## Validation steps

### 1. Visual gap on a normal-width column (User Story 1, Scenario 1)

Open any list page (e.g. Orders) and look at a sortable column header with a comfortably wide column (e.g. "Customer Order #").

**Expected**: the label text and the sort icon (arrow/⇕ glyph) have a clearly visible gap between them — they no longer read as touching or crowded.

### 2. Consistency across pages (Scenario 2)

Compare the same header spacing on two different list pages (e.g. Orders vs. Invoices vs. Purchase Orders).

**Expected**: the gap looks identical on every page — expected, since all of them render through the same shared `SortableHeader` component.

### 3. Narrow / resized column (Scenario 3, FR-003, FR-005)

On a page with resizable columns, drag a column header's resize handle down to its minimum width (50px). Also try a column with a naturally long label (e.g. "Proposal Name") at a normal width.

**Expected**: the sort icon remains fully visible (not clipped, not pushed outside the header), the label truncates with an ellipsis rather than wrapping to a second line, and the gap between the (possibly truncated) label and the icon is still clearly visible — not collapsed to zero.

### 4. Alignment and sort states (FR-004)

Check a right-aligned or center-aligned header (if any list page has one), and check the same header in its sorted (arrow showing) and unsorted/hover (⇕ showing) states.

**Expected**: the gap looks the same in every alignment and sort state — only the icon's own appearance changes.

## Static check

```bash
npx tsc --noEmit
```

No new automated tests are introduced (consistent with Constitution Principle V — no existing suite covers header spacing); the steps above are the acceptance evidence for this feature.

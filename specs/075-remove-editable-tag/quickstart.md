# Quickstart: Remove "Editable" Tag and Align Field Styling on Purchase Order Line Page

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Prerequisites

- Dev server running: `npm run dev` (http://localhost:3000)
- Logged in as a user with access to Purchase Orders
- At least one Purchase Order with:
  - One line whose status is Draft, Approved, or Awarded (editable case)
  - One line whose status is something else, e.g., Closed/Cancelled (read-only case) — if none exists in the connected Salesforce/mock data, any status outside the editable set works

## Validation Scenarios

### 1. "Editable" badge is gone (User Story 1 / FR-001, FR-002 / SC-001)

1. Navigate to `/purchase-orders/{id}/lines/{lineid}` for a line with status Draft, Approved, or Awarded.
2. Inspect the Product Information card's Promise Date and Tracking Number fields.
3. **Expected**: No "Editable" text badge appears next to either label. The fields still render as editable inputs (white background, bordered, focusable).
4. Repeat for a non-editable-status line.
5. **Expected**: Fields render read-only exactly as before (this case had no badge to begin with — confirms no regression).

### 2. Save behavior is unchanged (FR-003, FR-005, FR-006 / SC-002)

1. On an editable line, change the Tracking Number and/or Promise Date.
2. Trigger the save (per existing UI — e.g., the Save button shown when there are unsaved changes).
3. **Expected**: Same request is sent, same success feedback, same persisted value on reload — identical to pre-change behavior (see `specs/074-purchase-order-line-update/quickstart.md` for the full save contract this must continue to satisfy).
4. Simulate/observe a failed save (e.g., temporarily break connectivity or use existing error path).
5. **Expected**: Same failure indication and retained unsaved input as before.

### 3. Visual consistency with the Order Line page reference (User Story 2 / FR-004 / SC-003)

1. Open `/purchase-orders/{id}/lines/{lineid}` and `/orders/{id}/lines/{lineId}` side by side (or in two tabs).
2. Compare label styling (weight, color, size) and input styling (height, border, background/read-only treatment) between the two pages' Product Information sections.
3. **Expected**: The two pages present a visually consistent field pattern — no jarring stylistic mismatch — while each still shows its own data and retains its own interaction model (Purchase Order Line: per-field inline editability gated by status; Order Line: page-level Edit/Save toggle — unchanged, per spec Assumptions).
4. Toggle dark mode and repeat the comparison.
5. **Expected**: Consistency holds in both light and dark themes.

## Static Checks

```bash
npm run lint
```

No new automated tests are introduced for this markup/styling-only change; verification is the manual scenarios above.

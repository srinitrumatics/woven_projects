# Quickstart Validation Guide: Modal Create Order Footer Button

## Prerequisites

- Dev server running: `npm run dev` (http://localhost:3000)
- A logged-in session with an account that has products visible
- At least one product accessible via `/products/[id]`

## Validation Scenarios

### Scenario A — Footer "Create Order" visible when draft orders exist

1. Navigate to any product detail page (`/products/[id]`).
2. Click **"Add to Order"** to open the modal.
3. **Wait** for the draft-orders list to load.
4. If draft orders are listed:
   - **Expected**: Footer shows three buttons left-to-right: **Cancel** | **Create Order** | **Add to Order**.
   - **Expected**: "Create Order" is enabled (not greyed out).
5. Click **"Create Order"**.
   - **Expected**: Button changes to "Creating..." and becomes disabled.
   - **Expected**: After success, user is redirected to the new order detail page with the product already added.

### Scenario B — Footer "Create Order" visible when no draft orders exist

1. Navigate to any product detail page.
2. Click **"Add to Order"**.
3. If no draft orders are found (empty state):
   - **Expected**: Footer shows **Cancel** | **Create Order** (no "Add to Order" button).
   - **Expected**: The empty-state content block may still show a "Create Order" button inside the modal body (acceptable; it is the same action).
4. Click **"Create Order"** in the footer.
   - **Expected**: Same redirect behavior as Scenario A.

### Scenario C — Footer "Create Order" hidden during initial load

1. Open the Add to Order modal.
2. While the loading spinner is shown (draft orders not yet fetched):
   - **Expected**: Only the **Cancel** button is visible in the footer ("Create Order" is hidden).
3. After loading completes, "Create Order" appears in the footer.

### Scenario D — Regression check: existing buttons unchanged

1. Open the modal with draft orders present.
2. Select a draft order and click **"Add to Order"**.
   - **Expected**: Product is added to the selected order; user is redirected.
3. Click **"Cancel"**.
   - **Expected**: Modal closes; no order is created or modified.

## Expected Outcomes

| Scenario | Pass Condition |
|---|---|
| A | Three footer buttons visible; Create Order redirects to new order |
| B | Two footer buttons visible; Create Order redirects to new order |
| C | Only Cancel visible during loading |
| D | Add to Order and Cancel still work correctly |

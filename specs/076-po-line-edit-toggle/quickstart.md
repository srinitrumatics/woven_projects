# Quickstart: Purchase Order Line Edit Toggle (Edit / Cancel / Save)

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Prerequisites

- Dev server running: `npm run dev` (http://localhost:3000)
- Logged in as a user with access to Purchase Orders
- A Purchase Order with lines covering at least these statuses: Draft or Approved (editable), Awarded (now non-editable — this is the behavior change to verify), and one other status (e.g., Closed/Cancelled/Pending)

## Validation Scenarios

### 1. Edit icon appears only for Draft/Approved (FR-001, FR-002 / SC-001)

1. Open `/purchase-orders/{id}/lines/{lineid}` for a Draft or Approved line.
2. **Expected**: An Edit icon is visible in the top-right of the page header; Promise Date and Tracking Number render read-only.
3. Open a line with status Awarded.
4. **Expected**: No Edit icon appears; Promise Date and Tracking Number render read-only with no way to edit them — this is the narrowed behavior vs. before this feature (Awarded used to be directly editable).
5. Repeat for any other non-editable status (e.g., Closed).
6. **Expected**: Same as Awarded — no Edit icon, read-only fields.

### 2. Entering and using edit mode (User Story 1 / FR-003, FR-004 / SC-002)

1. On a Draft/Approved line, click the Edit icon.
2. **Expected**: Promise Date and Tracking Number become editable inputs; the Edit icon is replaced by Cancel and Save buttons in the same top-right position; every other field on the page (Product Name, Description, Brand Name, Need by Date, Ship by Date, Tracking Status, Estimated Delivery Date) remains read-only.

### 3. Cancel discards changes (User Story 2 / FR-005 / SC-003)

1. While in edit mode, change Promise Date and/or Tracking Number to new values.
2. Click Cancel.
3. **Expected**: Both fields revert to their last-saved values; the page returns to read-only with the Edit icon shown again; no network request was sent for the change.

### 4. Save persists changes (User Story 3 / FR-006–FR-008 / SC-004)

1. Enter edit mode; change Promise Date and/or Tracking Number.
2. Click Save.
3. **Expected**: A `PATCH /api/purchase-orders?...` request is sent containing only the changed field(s) (see `contracts/purchase-order-line-patch.md`); on success the page shows the new value(s), exits edit mode, and displays the Edit icon again.
4. Change only one of the two fields and save again.
5. **Expected**: Only that field's persisted value changes; the other field's value is untouched.

### 5. Failed save keeps you in edit mode (FR-009 / SC-005)

1. Enter edit mode, change a value, and trigger a save failure (e.g., temporarily break connectivity, or simulate a non-2xx/`success:false` response).
2. **Expected**: A clear failure indication is shown; the page remains in edit mode; the entered (unsaved) value is still present in the field for retry.

### 6. Server-side enforcement matches the UI (FR-010)

1. With a valid session, send a direct request: `curl -i -X PATCH "http://localhost:3000/api/purchase-orders?lineId={awardedLineId}&purchaseOrderId={id}" -H "Content-Type: application/json" -H "Cookie: session=..." -d '{"accountId":"...","contactId":"...","trackingNumber":"TEST123"}'` for a line whose status is Awarded.
2. **Expected**: `403 { "error": "Purchase Order Line is not editable" }` — confirming the narrowed `EDITABLE_LINE_STATUSES` server-side check, matching `contracts/purchase-order-line-patch.md`.

### 7. Navigating away exits edit mode (FR-011)

1. Enter edit mode on a line, make an unsaved change, then click Prev or Next to navigate to a different line.
2. **Expected**: The newly loaded line starts in read-only mode (Edit icon shown if it qualifies), not still in edit mode; the discarded change is not present anywhere.

## Static Checks

```bash
npx tsc --noEmit -p tsconfig.json
```

`npm run lint` is not runnable non-interactively in this repo (no ESLint config present — see `specs/075-remove-editable-tag/tasks.md` T010); `tsc` is the available static check.

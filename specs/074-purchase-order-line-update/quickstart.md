# Quickstart: Validate Save on Purchase Order Line

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Contract**: [contracts/patch-purchase-order-line.md](./contracts/patch-purchase-order-line.md)

## Prerequisites

- `.env.local` configured with working Salesforce credentials (`SF_CLIENT_ID`, `SF_CLIENT_SECRET`, `SF_USERNAME`, `SF_PASSWORD`, `SF_TOKEN`, `SF_URL`) pointed at an org that has at least one Purchase Order with at least one line whose `Status__c` is `Draft`, `Approved`, or `Awarded`, and at least one line whose status is something else (e.g., `Paid`/`Closed`) for the negative case.
- `npm run dev` running locally, logged in through the normal `/auth` flow with an account that can see that purchase order.

## Scenario 1 — Save both fields successfully (User Story 1)

1. Navigate to `/purchase-orders/{id}/lines/{lineid}` for a line with status Draft, Approved, or Awarded.
2. Confirm the "Editable" badge is shown above both Tracking Number and Promise Date.
3. Change the Tracking Number value and pick a new Promise Date.
4. Trigger the save.
5. **Expect**: the page shows the new values with no error, without requiring a manual page refresh.
6. Reload the page (full browser refresh).
7. **Expect**: both fields still show the values saved in step 3–4, not the originals.

## Scenario 2 — Editing only one field leaves the other untouched (FR-005)

1. On the same line, note the current saved Tracking Number.
2. Edit only the Promise Date and save.
3. Reload the page.
4. **Expect**: Promise Date reflects the new value; Tracking Number is exactly what it was before this scenario — not blank, not stale.

## Scenario 3 — No-op when nothing changed (Acceptance Scenario 3, User Story 1)

1. Load the line detail page and do not touch either field.
2. **Expect**: no save request is ever issued (confirm via browser devtools Network tab — no `PATCH /api/purchase-orders` call fires without an edit).

## Scenario 4 — Non-editable line has no save path (User Story 2)

1. Navigate to a line whose status is not Draft/Approved/Awarded (e.g., a closed/paid line).
2. **Expect**: Tracking Number and Promise Date render as read-only text inputs, no "Editable" badge, and no save control is visible or reachable.

## Scenario 5 — Failed save retains user input (User Story 3)

1. On an editable line, open devtools and simulate a failure (e.g., block the `PATCH /api/purchase-orders` request, or temporarily point Salesforce credentials at an invalid value and restart the dev server).
2. Edit Tracking Number and/or Promise Date and trigger the save.
3. **Expect**: a clear failure indication appears, and the input field(s) still show the value(s) just typed — not the prior saved value, not blank.

## Verifying the contract directly (optional, for API-level debugging)

```bash
curl -X PATCH "http://localhost:3000/api/purchase-orders?lineId=<lineId>" \
  -H "Content-Type: application/json" \
  -H "Cookie: session=<your session cookie>" \
  -d '{
    "accountId": "<accountId>",
    "contactId": "<contactId>",
    "trackingNumber": "12345",
    "promiseDate": "2026-07-30"
  }'
```

Expect a `200` with `{"success": true, "trackingNumber": "12345", "promiseDate": "2026-07-30"}` per [contracts/patch-purchase-order-line.md](./contracts/patch-purchase-order-line.md).

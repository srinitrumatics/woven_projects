# Quickstart: Validate Configure Order Quantity Control by MOQ

## Prerequisites

- Repo dependencies installed (`npm install`).
- Either live Salesforce credentials configured (`SF_CLIENT_ID`, `SF_CLIENT_SECRET`,
  `SF_USERNAME`, `SF_PASSWORD`, `SF_TOKEN`, `SF_URL`) so `/configure` loads a real product
  catalog with varied MOQ values, or rely on the app's automatic mock-data fallback
  (`lib/salesforce-service.ts`) when credentials are absent — either is sufficient to exercise
  this feature since it only depends on each product's `moq`/`MOQ__c` field being present in
  the fetched catalog.
- A logged-in session against the main portal (Configure Order is behind the Salesforce
  session middleware).

## Setup

```bash
rm -rf .next   # avoid stale build artifacts from a previous session
npm run dev
```

Navigate to `http://localhost:3000/configure` (login first via `/auth` if redirected).

## Validation scenarios

Map directly to the spec's Acceptance Scenarios (`spec.md`).

1. **Increase steps by MOQ** (User Story 1)
   - Add a product with a known MOQ > 1 (use "Quick add product..." or drag from the catalog panel).
   - Confirm the line's initial Qty equals that product's MOQ.
   - Click the increase (+) control once. Expect Qty = `2 × MOQ` and the line's Ext. Price = `sell × 2×MOQ`.
   - Confirm the "Order Total" footer/summary card updates to match.

2. **Decrease steps by MOQ and floors at MOQ** (User Story 2)
   - On the same line (now at `2 × MOQ`), click the decrease (−) control once. Expect Qty back to `1 × MOQ`.
   - Click decrease again. Expect Qty to remain at `MOQ` (unchanged) and the decrease control to be disabled/inert.

3. **Independent MOQ per line** (User Story 3)
   - Add a second product whose MOQ differs from the first (e.g. MOQ 1 vs. MOQ 25).
   - Increase the MOQ-1 line; confirm only its Qty changes and the other line's Qty is untouched.
   - If the catalog has a product with a missing/blank MOQ, add it and confirm its Qty defaults to `1` and steps by `1`.

4. **No availability ceiling** (FR-012 resolution)
   - Pick a product whose `avail` (available-to-sell) is a small finite number.
   - Increase its Qty past that `avail` value repeatedly. Expect the increase control to keep working with no block or error — quantity may exceed `avail`.

5. **Group rows unaffected** (FR-011)
   - Use "+ Add Group" to add a group row.
   - Confirm the group row shows no Qty controls and its subtotal display is unchanged from current behavior.

6. **Order submission carries the adjusted quantity** (FR-009, SC-003)
   - After adjusting at least one line's quantity, click "Create Order".
   - Confirm the order is created successfully and, on the resulting order's detail page (`/orders/<id>`), the line quantity matches what was shown in the Configure Order table (not the original MOQ default).

7. **Stale draft normalization** (FR-010, Edge Cases)
   - In the browser devtools console, manually edit the `gth-configured-draft` localStorage entry for one product line to set `qty` to a value that is not a multiple of that product's MOQ (e.g. `qty: 7` for a MOQ-5 product).
   - Reload `/configure`. Confirm the line loads showing the stale value initially, then click increase or decrease once and confirm the result is MOQ-aligned and at/above the floor (e.g. from `7` with MOQ `5`: normalizes to `5`, then decrease is a no-op at the floor, or increase moves to `10`).

## Expected outcome

All seven scenarios pass with no console errors, matching the acceptance scenarios and
functional requirements in `spec.md`. Since this repo has no automated component test
runner, this manual pass through `npm run dev` in a browser is the primary verification
method (see Technical Context / Testing in `plan.md`).

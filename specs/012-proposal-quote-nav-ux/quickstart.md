# Quickstart: Proposal & Customer Quote Navigation UX

## Prerequisites

- Dev server running: `npm run dev` (localhost:3000)
- At least one order with associated Proposals and Customer Quotes
- Any permitted account type (Customer, NSO, Hybrid, or Super Admin)

---

## Scenario 1 — Proposal Link Opens in New Tab

**Setup**: Log in as any permitted account type (Customer, NSO, Hybrid, or Super Admin).

**Steps**:
1. Navigate to `/orders`
2. Open any order with proposals
3. Click the **Fulfillment** tab → **Proposals** sub-tab
4. Click a Proposal Number link

**Expected**:
- A **new browser tab** opens showing the proposal detail page
- The original order detail tab **remains open** (check the tab bar)
- The new tab displays the correct proposal

---

## Scenario 2 — Customer Quote Link Opens in New Tab

**Setup**: Same as Scenario 1.

**Steps**:
1. Navigate to `/orders`
2. Open any order with customer quotes
3. Click the **Fulfillment** tab → **Customer Quotes** sub-tab
4. Click a Customer Quote name link

**Expected**:
- A **new browser tab** opens showing the customer quote detail page
- The original order detail tab **remains open**

---

## Scenario 3 — Proposal Breadcrumb "Proposals" Is Plain Text

**Setup**: Any account type. Open a proposal detail page (e.g. from a new tab via Scenario 1, or by navigating directly to `/proposals/{id}`).

**Steps**:
1. Look at the breadcrumb at the top of the proposal detail page

**Expected**:
- Breadcrumb reads: **Proposals > Proposal Details > {Proposal Number}**
- "Proposals" is **plain, non-interactive text** — no underline on hover, no pointer cursor, no action on click
- The rest of the breadcrumb remains unchanged

---

## Scenario 4 — Customer Quote Breadcrumb "Quotes" Is Plain Text

**Setup**: Any account type. Open a customer quote detail page.

**Steps**:
1. Look at the breadcrumb at the top of the customer quote detail page

**Expected**:
- Breadcrumb reads: **Quotes > Quote Details > {Quote Name}**
- "Quotes" is **plain, non-interactive text** — no hover action, no click action
- The rest of the breadcrumb remains unchanged

---

## Scenario 5 — Shipment and Invoice Links Unchanged (Regression)

**Steps**:
1. Open an order → Fulfillment tab → Shipping Manifests sub-tab
2. Click a manifest link

**Expected**: The manifest detail page opens **in the same tab** (no new tab). Repeat for Invoice links.

---

## Scenario 6 — Footer "Back" Buttons Unchanged (Regression)

**Steps**:
1. Open a proposal detail page
2. Look at the fixed footer bar at the bottom
3. Click the "Back to Proposals" button

**Expected**: The button still navigates back to `/proposals` in the **same tab** (this button was not changed by this feature).

---

## Scenario 7 — Build Passes Clean

Run:
```bash
npm run build
```

**Expected**: Zero TypeScript errors. The build completes successfully.

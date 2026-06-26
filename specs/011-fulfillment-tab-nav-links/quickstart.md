# Quickstart: Fulfillment Tab Navigation Links — Proposals & Customer Quotes

## Prerequisites

- Dev server running: `npm run dev` (localhost:3000)
- At least one order with associated Proposals and Customer Quotes in Salesforce (or mock data)
- Test accounts available for: Customer, NSO, Hybrid, Super Admin

---

## Scenario 1 — Customer Account: Proposal Link Visible

**Setup**: Log in as a user with `Account_Record_Type__c = 'Customer'`.

**Steps**:
1. Navigate to `/orders`
2. Open any order with proposals
3. Click the **Fulfillment** tab → **Proposals** sub-tab
4. Observe the Proposal Number column

**Expected**: Each Proposal Number cell renders as a blue underlined link (primary colour). Clicking navigates to `/proposals/{proposalId}`.

---

## Scenario 2 — NSO Account: Proposal Link Visible

**Setup**: Log in as a user with `Account_Record_Type__c = 'NSO'`.

**Steps**: Same as Scenario 1.

**Expected**: Same as Scenario 1 — NSO users see clickable Proposal Number links.

---

## Scenario 3 — Hybrid Account: Proposal Link Visible

**Setup**: Log in as a user with `Account_Record_Type__c = 'Hybrid'`.

**Steps**: Same as Scenario 1.

**Expected**: Same as Scenario 1 — Hybrid users see clickable Proposal Number links.

---

## Scenario 4 — Customer Account: Customer Quote Link Visible

**Setup**: Log in as a user with `Account_Record_Type__c = 'Customer'`.

**Steps**:
1. Navigate to `/orders`
2. Open any order with customer quotes
3. Click the **Fulfillment** tab → **Customer Quotes** sub-tab
4. Observe the Customer Quote name column

**Expected**: Each Customer Quote name cell renders as a blue underlined link. Clicking navigates to `/quotes/{quoteId}`.

---

## Scenario 5 — NSO Account: Customer Quote Link Visible

**Setup**: Log in as a user with `Account_Record_Type__c = 'NSO'`.

**Steps**: Same as Scenario 4.

**Expected**: Same as Scenario 4.

---

## Scenario 6 — Hybrid Account: Customer Quote Link Visible

**Setup**: Log in as a user with `Account_Record_Type__c = 'Hybrid'`.

**Steps**: Same as Scenario 4.

**Expected**: Same as Scenario 4.

---

## Scenario 7 — Super Admin: Both Links Visible (Unchanged)

**Setup**: Log in as Super Admin (`isSuperAdmin = true` in localStorage).

**Steps**: Check both Proposals and Customer Quotes sub-tabs on any order.

**Expected**: Both columns show clickable links (same behaviour as before feature 010 — Super Admin always had access).

---

## Scenario 8 — Partner/Manufacturer Account: No Links

**Setup**: Log in as a user with `Account_Record_Type__c` = `'Supplier'`, `'Manufacturer'`, `'Manufacturer Rep'`, or `'Logistics Partner'`.

**Steps**: Open any order → Fulfillment tab → Proposals sub-tab, then Customer Quotes sub-tab.

**Expected**: Both columns render as plain text (no anchor links). Deny-by-default for non-permitted types.

---

## Scenario 9 — Missing Id: No Broken Links

**Setup**: Any permitted account type.

**Steps**: If any proposal row has a `null` or missing `Id`, observe that cell.

**Expected**: Cell shows a dash (—) as plain text with no `<a>` element rendered.

---

## Scenario 10 — Shipments and Invoices: Unchanged Behaviour

**Setup**: Customer or Hybrid account.

**Steps**: Open Fulfillment tab → Shipping Manifests sub-tab and Invoices sub-tab.

**Expected**: Links still appear for Shipments and Invoices (feature 010 behaviour unchanged). NSO check not needed here — Shipments/Invoices remain `isSuperAdmin || Customer || Hybrid` per feature 010.

---

## Regression Check

After verifying the above:
- Confirm Sales Orders sub-tab still shows plain text (no links — no portal route exists)
- Confirm row-click on a proposal or quote row still works without double-navigation (stop-propagation on link click)

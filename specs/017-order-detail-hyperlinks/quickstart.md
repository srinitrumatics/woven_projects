# Quickstart Validation Guide: Order & Quote Hyperlinks

**Feature**: `specs/017-order-detail-hyperlinks`
**Date**: 2026-06-30

## Prerequisites

- Dev server running: `npm run dev` (localhost:3000)
- Authenticated session as a **non-Customer/NSO account** (so Debit Memos and RTV tabs are visible)
- An Order that has at least one Debit Memo and one RTV with a related Customer Order record in Salesforce
- Optionally: a second session as a Customer account to verify link visibility for permitted accounts

---

## Scenario 1: Customer Order Link — Debit Memos

**Goal**: Confirm that the Customer Order Name in the Debit Memos sub-table is a clickable hyperlink.

1. Navigate to any Order Details page → Returns tab → Debit Memos sub-tab
2. Locate the "Customer Order" column in the table
3. **Expected**: The Customer Order value is rendered as a clickable hyperlink (underlined, blue text matching other hyperlinks)
4. Click the hyperlink → **Expected**: Opens the linked Customer Order's detail page (e.g., `/orders/{Id}`) in a new browser tab
5. Verify the opened page is the correct Customer Order record

**Pass**: Clicking any non-empty Customer Order value navigates to the correct Customer Order detail page.

---

## Scenario 2: Customer Order Link — RTV

**Goal**: Confirm that the Customer Order Name in the RTV sub-table is a clickable hyperlink.

1. Navigate to any Order Details page → Returns tab → RTV sub-tab
2. Locate the "Customer Order" column in the table
3. **Expected**: The Customer Order value is a clickable hyperlink
4. Click the hyperlink → **Expected**: Opens the linked Customer Order's detail page in a new browser tab

**Pass**: Clicking any non-empty Customer Order value navigates to the correct Customer Order detail page.

---

## Scenario 3: Null / Missing Customer Order ID — Debit Memos

**Goal**: Confirm empty Customer Order cells display `—` with no broken link.

1. Find a Debit Memo row where the Customer Order field is empty or null
2. **Expected**: The cell displays `—` as plain text (no `<a>` tag rendered, no broken link)

**Pass**: Empty Customer Order cells render `—` safely in both Debit Memos and RTV sub-tables.

---

## Scenario 4: Permission Guard — Customer Account

**Goal**: Confirm Customer Order links render for Customer-type accounts (canLinkOrders = true).

1. Log in as a Customer account
2. Navigate to Returns tab → Debit Memos or RTV sub-tab (if visible for this account type)
3. **Expected**: Customer Order cells with a valid ID render as hyperlinks

**Note**: Debit Memos and RTV may not be visible to Customer/NSO accounts per existing `isCustomerOrNSO` logic. If tabs are hidden, this scenario passes vacuously — hyperlinks would render if the tabs were shown.

---

## Scenario 5: No Regression — Existing Customer Quote Links

**Goal**: Confirm existing Customer Quote hyperlinks in Fulfillment and Returns tabs are unaffected.

1. Navigate to Order Details → Fulfillment tab → Sales Orders sub-tab
2. Verify "Customer Quote #" column values remain hyperlinks (blue, underlined)
3. Click one → confirms it opens the correct Customer Quote detail page
4. Repeat for Shipping Manifests, Invoices, RMAs, Credit Memos sub-tabs
5. Verify none of these Customer Quote links were broken by the changes in this feature

**Pass**: All Customer Quote # links continue to work exactly as they did after spec 016.

---

## Scenario 6: No Regression — Order Line Details Page

**Goal**: Confirm the Order Line Details page is unaffected.

1. Navigate to Order Details → click any order line item (or go to `/orders/[id]/lines/[lineId]`)
2. Verify the page renders correctly — product info, notes, taxes, pricing all display
3. No Customer Order or Customer Quote columns appear (they should not be on this page)
4. **Expected**: Page is unchanged; no added or broken elements

**Pass**: Order Line Details page renders identically to pre-feature state.

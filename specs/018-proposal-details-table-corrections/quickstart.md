# Quickstart Validation Guide: Proposal Details Page — Table Corrections (CO-113)

**Feature**: `specs/018-proposal-details-table-corrections`
**Date**: 2026-07-01

---

## Prerequisites

1. Dev server running: `npm run dev` (localhost:3000)
2. Valid session cookie (log in via `/auth`)
3. Access to at least one Proposal record with related Products, Orders, Fulfillment records, and Returns records in Salesforce
4. For pagination scenarios: a Proposal with > 10 records in at least one sub-tab

---

## Validation Scenarios

### SC-001 / SC-003 — Products tab column correctness

1. Navigate to any Proposal Detail page (`/proposals/[id]`)
2. Open the **Products** tab
3. Confirm columns appear left-to-right in this exact order: `Proposed Products | Status | Product Name | Product Description | Brand Name | Grouping | Unit Price | Total Order Qty | Total Price | Shipping | Taxes | Line Grand Total | Qty Shipped | Action`
4. Confirm all header labels render on a **single line with no ellipsis**
5. Confirm the first column (Proposed Products) **stays pinned** when scrolling right
6. Click a "Proposed Products" link → verify navigation to the correct Proposal Line record
7. Click a "Product Name" link → verify navigation to the correct Product record
8. Confirm any null/empty cells show **"-"** not blank

---

### SC-001 / SC-003 — Orders tab column correctness

1. Open the **Orders** tab
2. Confirm columns appear in this order: `Customer Order # | Status | Customer PO | Customer PO Date | Bill to Account | Bill to Location | Bill to Contact | Ship to Account | Ship to Location | Ship to Contact | Proposal Requested | Transfer Order | Drop Ship | Total Lines | Total Price | Shipping | Taxes | Grand Total | Request Date | Planned Ship Date | Ship Confirmed Date`
3. Confirm "Customer Order #" (not "Customer Order") and "Customer PO Date" (not "CPO Date") header labels
4. Click "Customer Order #" link → verify `/orders/[id]` navigation

---

### SC-005 — Fulfillment tab sub-tab order

1. Open the **Fulfillment** tab
2. Confirm sub-tab buttons appear in order: `Customer Quotes | Sales Orders | Shipping Manifests | Invoices`
3. Confirm the first tab (Customer Quotes) is active by default

---

### SC-001 / SC-003 — Fulfillment Customer Quotes column correctness

1. With the Customer Quotes sub-tab active, confirm columns: `Customer Quote | Status | Proposal # | Proposal Name | Customer Order # | Customer PO | Bill to Account | Bill to Location | Bill to Contact | Ship to Account | Ship to Location | Ship to Contact | Drop Ship | Total Lines | Total Price | Shipping | Taxes | Grand Total | Issued Date | Expiration Date | Request Date | Planned Ship Date | Ship Confirmed Date`
2. Confirm "Issued Date" (not "Issue Date")
3. Click "Proposal #" link → verify `/proposals/[id]` navigation

---

### SC-001 / SC-003 — Fulfillment Sales Orders column correctness

1. Click the **Sales Orders** sub-tab
2. Confirm columns: `Sales Order # | Status | Customer Quote # | Proposal # | Proposal Name | Customer Order # | Customer PO | Bill to Account | Bill to Location | Bill to Contact | Ship to Account | Ship to Location | Ship to Contact | Drop Ship | Total Lines | Total Price | Shipping | Taxes | Grand Total | Request Date | Planned Ship Date | Ship Confirmed Date`
3. Confirm "Pick Date" and "Pick Complete Date" columns are **absent**
4. Click "Sales Order #" link → verify `/orders/[id]` navigation (requires record with a populated Sales Order ID)

---

### SC-001 / SC-003 — Fulfillment Shipping Manifests column correctness

1. Click the **Shipping Manifests** sub-tab
2. Confirm columns include: `Shipping Manifest # | Status | Sales Order # | Customer Quote # | Proposal # | Proposal Name | Customer Order # | Customer PO | Ship to Account | Ship to Location | Ship to Contact | Drop Ship | Total Lines | Total Price | Box Count | Box Length | Box Width | Box Height | Box Net Weight | Box Gross Weight | Logistics Partner | Planned Ship Date | Ship Confirmed Date | Tracking Number | Tracking Status | Estimated Delivery Date | Actual Delivery Date`
3. Confirm "Shipping Method" and "Logistics Contact" columns are **absent**
4. Confirm Total Lines and Total Price appear **before** Box Count (not after)

---

### SC-001 / SC-003 — Fulfillment Invoices column correctness

1. Click the **Invoices** sub-tab
2. Confirm columns: `Invoice # | Status | Sales Order # | Purchase Order # | Customer Quote # | Proposal # | Proposal Name | Customer Order # | Customer PO | Bill to Account | Bill to Location | Bill to Contact | Total Lines | Total Price | Shipping | Taxes | Grand Total | Issued Date | Payment Terms | Due Date | Collection Status | Open Balance | Settled Date`
3. Confirm "Days Outstanding" column is **absent**
4. Confirm "Customer Order #" (not "Customer Orders")

---

### SC-005 — Returns tab sub-tab order

1. Open the **Returns** tab
2. Confirm sub-tab order: `RMAs | Credit Memos`

---

### SC-001 / SC-003 — Returns RMA column correctness

1. With the RMAs sub-tab active, confirm columns: `RMA # | Status | Type | Sales Order # | Customer Quote # | Proposal # | Proposal Name | Customer Order # | Customer PO | Ship from Account | Ship from Contact | Return to Account | Return to Contact | Drop Ship | Total Lines | Total Price | Issued Date | Return By Date | Shipping Method | Logistics Partner | Logistics Contact | Tracking Number | Tracking Status | Estimated Delivery Date | Actual Delivery Date | Goods Receipt Date`
2. Confirm "Type" appears at position 3 (not at the end)
3. Confirm "Goods Receipt Date" (not "Goods Receipts Date")
4. Confirm Tracking Status appears **before** Estimated Delivery Date
5. Click "Customer Quote #" link → verify `/quotes/[id]` navigation

---

### SC-001 / SC-003 — Returns Credit Memos column correctness

1. Click the **Credit Memos** sub-tab
2. Confirm columns: `Credit Memo # | Status | Invoice # | Sales Order # | Customer Quote # | Proposal # | Proposal Name | Customer Order # | Total Lines | Total Price | Shipping | Taxes | Total Credit Amount | Issued Date | Expiration Date | Available Credit Balance | Settled Date`
3. Confirm "Credit to Account" and "Credit to Contact" columns are **absent**
4. Confirm "Credit Memo #" (not "Credit Memo")

---

### SC-006 / SC-007 — Pagination and default sort

1. Open a Proposal with > 10 Products
2. Confirm only 10 rows appear and pagination controls are visible
3. Confirm the first row shows the **lowest Record ID** (e.g., `Q-00001` before `Q-00002`) — ascending sort
4. Navigate to page 2 and back to page 1 — confirm rows are correct on return

---

### SC-008 — Null/empty value rendering

1. On any sub-tab, locate a record where a new field (e.g., Brand Name, Proposal Name, Box Length) has no Salesforce value
2. Confirm the cell shows **"-"** and not blank, `null`, or `undefined`

---

## Build Verification

```bash
npm run build
```

Expected: zero TypeScript errors. Any type error in `types.ts`, `page.tsx`, or the four component files indicates a missing interface field or incorrect field name.

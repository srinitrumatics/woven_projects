# Quickstart Validation Guide: Table Empty/Null Dash Display

**Feature**: 015-table-null-dash  
**Date**: 2026-06-27

## Prerequisites

- Dev server running: `npm run dev` (localhost:3000)
- Logged in to the portal with a valid session
- At least one account with orders, invoices, shipments, and/or quotes where some fields are blank (common in Salesforce demo data)

## Validation Scenarios

### Scenario 1 — Orders list page: blank text cells show "-"

1. Navigate to `/orders`
2. Look at the **Proposal**, **Customer PO**, **Bill To**, **Ship To** columns
3. For any order row where these fields are not populated in Salesforce, the cell must display `"-"` (not blank/empty)
4. For rows where these fields have values, the real value must display unchanged

**Expected**: Consistent `"-"` in every empty text cell; no blank gaps in the table.

---

### Scenario 2 — Orders list page: formatted values unaffected

1. On `/orders`, find rows with a **Requested Date** and a **Total** value
2. Confirm dates still display in `MM-DD-YYYY` format
3. Confirm totals still display as `$X,XXX.XX`
4. Confirm **Status** badges still render coloured badges (not affected by this change)

**Expected**: No regression in formatted or component-rendered cells.

---

### Scenario 3 — Invoice detail sub-tabs: null fields show "-"

1. Navigate to any invoice detail page (`/invoices/[id]`)
2. Open **Line Items** tab → look at fields like description, unit of measure, discount
3. Open **Payments** tab → look at reference number, notes fields
4. Open **Taxes** tab → look at tax name, jurisdiction fields
5. Each empty/null plain text cell must show `"-"`

**Expected**: Consistent `"-"` across all invoice detail sub-tabs.

---

### Scenario 4 — Shipment detail: empty serial numbers or tracking show "-"

1. Navigate to any shipment detail page (`/shipments/[id]`)
2. Open **Serial Numbers** tab → serial number and related fields
3. Open **Shipment Lines** tab → tracking number, carrier fields
4. Confirm `"-"` for any empty cells

**Expected**: `"-"` in all empty text cells; no blanks.

---

### Scenario 5 — Zero numeric values are NOT replaced

1. Find an order line with a quantity of `0` or a total of `$0.00`
2. Confirm the cell shows `0` or `$0.00` (not `"-"`)

**Expected**: Zero values are preserved; only truly null/undefined/empty values become `"-"`.

---

### Scenario 6 — Whitespace-only fields

This scenario may require a Salesforce record with a whitespace-only text field. If not available in test data, verify via code review that `displayCell("   ")` returns `"-"`.

**Expected**: Whitespace-only strings resolve to `"-"`.

---

## Regression Check

After applying the feature:

1. Run the app and spot-check **5 different table pages** (orders, invoices, quotes, shipments, supplier bills)
2. Confirm no table shows `"[object Object]"`, `"NaN"`, `"undefined"`, or `"null"` in any cell
3. Confirm no column widths or table layouts appear broken

## Reference

- Formatter utility: `lib/utils/formatting.ts` — see `displayCell`, `formatDate`, `formatCurrency`, `formatNumber`, `formatTime`
- Data model: [data-model.md](./data-model.md)
- Full file list: see `plan.md` Project Structure section

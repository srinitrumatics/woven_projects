# Quickstart: Validate Consistent Bold Hyperlinks in Datatables

## Prerequisites

- Local dev environment set up per `CLAUDE.md` (`npm install` already run).
- Portal login credentials (this app's main portal authenticates against a live Salesforce org — no offline/mock login path exists). No new environment variables required.

## Setup

```bash
npm run dev
```

Open `http://localhost:3000` and sign in.

## Validation Scenarios

1. **Primary record links across list pages**
   - Visit each of: `/orders`, `/proposals`, `/quotes`, `/invoices`, `/purchase-orders`, `/supplier-bills`, `/shipments`, `/inventory`, `/products`.
   - **Expected**: the primary record-number link in each row (e.g., order number, proposal number) renders at the same bold weight on every page — no page's links look lighter or bolder than another's.

2. **Secondary/cross-reference links inside detail-page tabs**
   - Open a detail page for an object with multiple related-record tabs (e.g., a Quote's Sales Orders / Shipping Manifests / Credit Memo / Debit Memo / Invoices / Purchases / RMA / RTV sub-tabs, or a Purchase Order's Debit Memo / RTV / Serial Numbers / Supplier Bills tabs).
   - **Expected**: every cross-reference link inside each sub-tab's table renders at the same bold weight as the primary record links checked in Scenario 1 — no visible difference between "primary" and "secondary" table links.

3. **Non-table content is unaffected**
   - On any list page, compare a table's plain (non-link) cell content (status badges, dates, quantities) before and after — it should look unchanged.
   - Check the page's breadcrumb, sidebar navigation, and any KPI/summary card links — they should also look unchanged.

4. **Spot check the known outliers from `research.md`**
   - `app/proposals/[id]/components/ProductsTab.tsx` (previously `font-bold` on one link) — should now match the rest of the app's table-link weight, not look heavier.
   - `app/products/ProductClientPage.tsx` product-name cell (previously `font-bold` on a sibling `<div>`, not the link) — should now match.
   - `app/orders/[id]/components/FulfillmentTab.tsx` and `ReturnsTab.tsx` (previously several links had no explicit weight, inheriting default/normal) — should now be visibly bold like every other table link.

5. **Dark mode**
   - Toggle dark mode (moon/sun icon in the header) and repeat Scenario 1 on at least one page — the link weight should look identical to light mode; only color/background changes with the theme.

## Expected Outcome

All hyperlinks inside datatable cells, across every checked page, render at a uniform bold weight (600/`font-semibold`), with zero change to non-table hyperlinks or non-link table content — consistent with spec success criteria SC-001–SC-003.

# Quickstart: Replace Manufacturer with Brand Across All Tables

**Prerequisites**: `npm run dev`, a logged-in session (Salesforce-connected), and access to at least one record per module with populated line items (Inventory, Configure/Product list, an Order, a Quote, an Invoice, a Purchase Order, a Shipment, a Supplier Bill).

## How to validate

For each module below: open the page, locate the column that used to read "Manufacturer" or "Manufacturer DBA", and confirm it now reads "Brand" with the correct value (or "-" if empty). Then hover a truncated cell to confirm the tooltip also says "Brand", sort by the column, and resize it — all three must behave exactly as before.

## Scenarios

1. **Inventory list** (`/inventory`) — column reads "Brand".
2. **Product Configuration table** (`/configure`) — column reads "Brand".
3. **Order line table** (`/orders/[id]`, MyOrderTable) — column reads "Brand"; Product Catalog card grid used when adding products also reads "Brand".
4. **Order line detail tooltip** (`/orders/[id]`, hover a line's info icon) — label reads "Brand".
5. **Quote line table** (`/quotes/[id]`, QuoteLinesTab) — column reads "Brand".
6. **Quote line detail sub-tabs** (`/quotes/[id]/lines/[lineid]` — Fulfillments, Returns, Purchases, and each of the ~11 sub-tab tables) — every sub-tab's column reads "Brand".
7. **Invoice line table** (`/invoices/[id]`, InvoiceLineItems) — column reads "Brand".
8. **Invoice line detail** (`/invoices/[id]/lines/[lineid]` — Credit Memo sub-tab) — column reads "Brand".
9. **Purchase Order line tables** (`/purchase-orders/[id]` — Lines, Debit Memo, RTV tables) — every table's column reads "Brand".
10. **Purchase Order line detail sub-tabs** (`/purchase-orders/[id]/lines/[lineid]` — Debit Memo, RTV, Supplier Bill tables) — column reads "Brand".
11. **Shipment tables** (`/shipments/[id]` — Inventory, Shipment Lines) — column reads "Brand".
12. **Shipment line detail** (`/shipments/[id]/lines/[lineid]` — Inventory tab, Product Information card) — label reads "Brand".
13. **Supplier Bill line table** (`/supplier-bills/[id]`, SupplierBillLinesTable) — column reads "Brand".
14. **Supplier Bill line detail** (`/supplier-bills/[id]/lines/[lineid]` — Debit Memo sub-tab) — column reads "Brand".
15. **Proposal line detail sub-tabs** (`/proposals/[id]/lines/[lineid]` — Fulfillments, Purchases, Returns tabs) — column reads "Brand".

## Out-of-scope regression check

Confirm these are **unchanged** (still say "Manufacturer" or still gate on the Manufacturer account type — this is intentional, not a bug):

- Every top-level list page's partner-visibility logic (`isManufacturer` check) — e.g. `/orders`, `/quotes`, `/invoices`, `/purchase-orders`, `/shipments`, `/supplier-bills`, `/proposals`, `/home`, `/program360`.
- Add/Edit Product modal's "Manufacturer" field (`app/products/components/AddProductModal.tsx`, `app/products/[id]/components/EditProductTabs.tsx`).
- Product Info detail-panel labels (`app/products/[id]/components/ProductInfoCard.tsx`, `app/orders/[id]/lines/[lineId]/components/ProductInfo.tsx`).
- Product Catalog's `manufacturer` Algolia filter behavior (`app/products/ProductClientPage.tsx`) — filtering logic unchanged.

## Expected outcome

Zero remaining "Manufacturer" labels in any table/tab/sub-tab across the 8 in-scope modules, with sort/resize/pagination behavior unchanged and correct brand values (or "-") displayed per SC-001 through SC-004 in the spec.

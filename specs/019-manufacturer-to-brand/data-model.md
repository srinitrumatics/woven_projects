# Data Model: Replace Manufacturer with Brand Across All Tables

This feature has no database schema changes (Salesforce remains the sole source of truth — Principle I). This document instead catalogues, per Salesforce object type, the field-mapping change: which field the "Brand" column now reads, replacing the legacy manufacturer field.

## Field mapping catalogue

Populated from the live Salesforce org schema check (`research.md` §2) plus confirmed object API names found in the codebase's fetch calls (`objectName=` query params). Per the user's decision (`research.md` §3), every row uses a genuinely distinct Brand field where one exists, and renders "-" where it doesn't — no manufacturer-value fallback.

| # | UI Module / Tab | Salesforce Object (API name) | Legacy field (Manufacturer) | Dedicated Brand field? | New field (Brand) / behavior |
|---|------------------|-------------------------------|------------------------------|-------------------------|-------------------------------|
| 1 | Order Product Catalog (card grid / picker) | `Product2` | `gtherp__Manufacturer_Name__c` | **YES** | `gtherp__Product_Brand_Name__c` — real value displayed |
| 2 | Inventory list | Inventory line object (backed by `Product2` data per line) | `Manufacturer_DBA__c` | No (line object) | Renders "-"; the underlying `Product2` brand field is not currently surfaced on this line object — would require the same backend addition as rows 4-10 |
| 3 | Product Configuration table | `Product2`-backed config rows | `Manufacturer_Name__r.Name` / `Manufacturer__c` / `Manufacturer_Name__c` | Depends on whether this table reads `Product2` directly or a config line object — confirm during implementation; if it reads `Product2` directly, treat like row 1 (real value); otherwise renders "-" | See note |
| 4 | Order line table (`MyOrderTable.tsx`) | `gtherp__Customer_Order_Line__c` | `Manufacturer_DBA__c` (formula) | No | Renders "-" |
| 5 | Quote line table + line-detail sub-tabs | `gtherp__Customer_Quote_Line__c` | `Manufacturer_DBA__c` (formula) | No | Renders "-" |
| 6 | Invoice line table + line-detail sub-tab | `gtherp__Invoice_Line__c` | `Manufacturer_DBA__c` (formula) | No | Renders "-" |
| 7 | Purchase Order line tables + line-detail sub-tabs | `gtherp__Purchase_Order_Line__c` | `Manufacturer_DBA__c` (formula) | No | Renders "-" |
| 8 | Shipment tables + line-detail sub-tab | `gtherp__Shipping_Manifest_Line__c` | `Manufacturer_DBA__c` (formula) | No | Renders "-" |
| 9 | Supplier Bill line table + line-detail sub-tab | `gtherp__Supplier_Bill_Line__c` | `Manufacturer_DBA__c` (formula) | No | Renders "-" |
| 10 | Proposal Products tab (already shipped in 018) | `gtherp__Proposed_Product__c` | `Manufacturer_DBA__c` (formula) | No — live describe found no `Brand_Name__c`-style field on this object in the connected scratch org, despite feature 018 having implemented `brandName: item.gtherp__Brand_Name__c` per the original CO-113 ticket's stated API name | ⚠️ Discrepancy to confirm — see Note below; not touched by this feature (018 already shipped), but flagged here since it affects the same object family |
| 11 | Proposal line-detail sub-tabs (Fulfillments/Purchases/Returns) | Same objects as rows 5-8, reached from `/proposals/[id]/lines/[lineid]` | `Manufacturer_DBA__c` (formula) | No | Renders "-" |
| 12 | Debit Memo / RTV / RMA / Credit Memo / Sales Order line tables (wherever they appear as sub-tabs) | `gtherp__Debit_Memo_Line__c`, `gtherp__RTV_Line__c`, `gtherp__RMA_Line__c`, `gtherp__Credit_Memo_Line__c`, `gtherp__Sales_Order_Line__c` | `Manufacturer_DBA__c` (formula) | No | Renders "-" |

**Fallback rule (FR-008)**: for every row marked "No", the "Brand" column renders `displayCell()`'s empty-value output ("-"). This is the expected, intentional result for the majority of tables in this feature until a Salesforce admin adds Brand formula fields to the line-item objects (out of scope — see `research.md` §3).

**Note on row 10 (Proposal Products / feature 018)**: The live schema check connected to `ruby-ruby-7045-dev-ed.scratch.my.salesforce.com` (a scratch org) and found no `Brand_Name__c`-pattern field on `gtherp__Proposed_Product__c`, contradicting the field name given in the original CO-113 ticket and already implemented in feature 018. This could mean the scratch org used for this research doesn't match the environment where the field was actually created, or the field genuinely isn't deployed yet. This is called out as a risk to verify against the correct target org before assuming 018's "Brand Name" column is displaying real data — it is NOT part of this feature's task list, since 018 is already shipped, but should be flagged to the team.

## Affected TypeScript interfaces

No new interfaces are introduced. Existing interfaces (in each module's local `types.ts` or inline page-level type, e.g. `app/quotes/[id]/lines/[lineid]/page.tsx`'s inline product line type) gain a `brand?: string` (or `brandName?: string`, matching the naming convention already used in `app/proposals/[id]/types.ts`) field alongside — not replacing — the existing `manufacturer`/`manufacturerDBA` field, so the legacy field remains available for any other read (e.g. Add/Edit Product forms, which stay on "Manufacturer" per FR-006).

## Full file inventory (component/page files requiring changes)

See `plan.md`'s Project Structure section for the grouped list of ~35 files. Exact per-file header/label/data-cell edits will be enumerated by `/speckit-tasks`.

## Scope refinement found during file-level audit

Several `lines/[lineid]/page.tsx` orchestrator files serve dual purposes: they both (a) map data for in-scope sub-tab **tables** (e.g. `InvoiceLineCreditMemoTab.tsx`, `PODebitMemoLinesTab.tsx`, `LineFulfillmentsTab.tsx`) and (b) render a read-only single-record "Product Info" style detail panel using a `<label>`/`InfoField label="Manufacturer DBA">` pattern — the same non-tabular pattern already excluded for `ProductInfo.tsx`/`ProductInfoCard.tsx` under FR-006.

**Decision**: The `InfoField`/`<label>` single-record display blocks in these files are OUT OF SCOPE and stay as "Manufacturer DBA" — only the data-mapping lines that feed the in-scope sub-tab tables are touched. Affected files with this dual nature (touch the mapping, leave the InfoField untouched):

- `app/invoices/[id]/lines/[lineid]/page.tsx` — mapping in scope (feeds `InvoiceLineCreditMemoTab.tsx`); the `<label>Manufacturer DBA</label>` block at ~line 356 stays as-is.
- `app/purchase-orders/[id]/lines/[lineid]/page.tsx` — mapping in scope (feeds `PODebitMemoLinesTab.tsx`, `PORtvLinesTab.tsx`, `POSupplierBillLinesTable.tsx`); the `<InfoField label="Manufacturer DBA">` at ~line 347 stays as-is.
- `app/supplier-bills/[id]/lines/[lineid]/page.tsx` — mapping in scope (feeds `SBLDebitMemoLinesTab.tsx`); the `<InfoField label="Manufacturer DBA">` at ~line 321 stays as-is.
- `app/proposals/[id]/lines/[lineid]/page.tsx` — mapping in scope (feeds `LineFulfillmentsTab.tsx`, `LinePurchasesTab.tsx`, `LineReturnsTab.tsx`); the `<label>Manufacturer DBA</label>` block at ~line 787-788 stays as-is.
- `app/shipments/[id]/lines/[lineid]/components/ProductInformationCard.tsx` — entirely an info-panel component (no table), OUT OF SCOPE in full, same as `ProductInfo.tsx`.

## Confirmed real-value case: Order Product Catalog

`app/orders/[id]/page.tsx:611` already contains `brand: item.Brand__c || item.brand || item.Brand || item['Manufacturer_Name__r.Name'] || ""` — an existing but broken fallback chain (guesses an unprefixed `Brand__c` field that the live schema check did not confirm exists; the real field is `gtherp__Product_Brand_Name__c`). This mapping must be corrected to prioritize the confirmed real field name, then `MyOrderTable.tsx` and `ProductCatalog.tsx` (which both already have a `manufacturer`-bound `SortableHeader`/label sitting next to this now-fixed `brand` field) can switch to it directly.

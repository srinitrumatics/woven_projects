# Phase 0 Research: Replace Manufacturer with Brand Across All Tables

## 1. Where "Manufacturer" appears in the codebase — scope confirmation

A full-repo grep for "Manufacturer" surfaced 65+ files, but most matches are **not** in scope. Two unrelated concepts share the word:

1. **Product/line-item manufacturer data** (IN SCOPE) — table columns showing a product's manufacturer, sourced from `Manufacturer_DBA__c` / `Manufacturer_Name__c`-style fields.
2. **Partner account type** (OUT OF SCOPE) — `Account_Record_Type__c === 'Manufacturer'` / `isManufacturer` checks that gate partner-visibility logic on every list page (`app/orders/page.tsx`, `app/invoices/page.tsx`, `app/quotes/page.tsx`, `app/purchase-orders/page.tsx`, `app/shipments/page.tsx`, `app/supplier-bills/page.tsx`, `app/proposals/page.tsx`, `app/home/page.tsx`, `app/program360/page.tsx`). This is a completely different business concept (an Account's role in the supply chain) and must not be touched.

Also out of scope per the spec's Question 2 answer ("Tables/tabs only"):
- Standalone edit/create forms: `app/products/components/AddProductModal.tsx`, `app/products/[id]/components/EditProductTabs.tsx`.
- Non-tabular detail-panel labels: `app/products/[id]/components/ProductInfoCard.tsx`, `app/orders/[id]/lines/[lineId]/components/ProductInfo.tsx`.
- `app/products/ProductClientPage.tsx`'s `manufacturer` Algolia filter field — this stores an **Account ID** for supplier-based product filtering, not a display column; unrelated data shape entirely.

**Decision**: Scope is the ~35 files enumerated in `plan.md`'s Project Structure — table column headers/cells (including mobile-card and tooltip equivalents) within list pages and record-detail tabs/sub-tabs across Inventory, Configure, Orders, Quotes, Invoices, Purchase Orders, Shipments, Supplier Bills, and Proposal line-details.

## 2. Live Salesforce schema check — does a dedicated Brand field exist per object?

Authenticated directly against the org (OAuth2 client-credentials flow, `SF_AUTH_URL`/`SF_CLIENT_ID`/`SF_CLIENT_SECRET` from `.env`, instance `ruby-ruby-7045-dev-ed.scratch.my.salesforce.com`) and ran `sobjects/<Object>/describe` for every relevant object. All custom objects live under the `gtherp__` managed-package namespace.

| Object | Dedicated Brand field? | Manufacturer field(s) present |
|---|---|---|
| `Product2` | **YES** — `gtherp__Product_Brand_Name__c` (plain string field) | `gtherp__Manufacturer_Name__c` (lookup/reference) |
| `gtherp__Proposed_Product__c` (Proposal Line) | No | `Manufacturer_DBA__c`, `Manufacturer_Name__c` (formula) |
| `gtherp__Customer_Quote_Line__c` | No | `Manufacturer_DBA__c`, `Manufacturer_Name__c`, `Manufacturer_ID__c` (formula) |
| `gtherp__Invoice_Line__c` | No | `Manufacturer_DBA__c`, `Manufacturer_Name__c` (formula) |
| `gtherp__Shipping_Manifest_Line__c` | No | `Manufacturer_DBA__c`, `Manufacturer_Name__c` (formula) |
| `gtherp__Purchase_Order_Line__c` | No | `Manufacturer_DBA__c`, `Manufacturer_ID__c`, `Manufacturer_Name__c` (formula) |
| `gtherp__Supplier_Bill_Line__c` | No | `Manufacturer_DBA__c`, `Manufacturer_Name__c` (formula) |
| `gtherp__Customer_Order_Line__c` | No | `Manufacturer_DBA__c`, `Manufacturer_Name__c` (formula) |
| `gtherp__RMA_Line__c`, `gtherp__RTV_Line__c`, `gtherp__Credit_Memo_Line__c`, `gtherp__Debit_Memo_Line__c`, `gtherp__Sales_Order_Line__c` | No (all) | `Manufacturer_DBA__c`, `Manufacturer_Name__c` (formula, all) |
| Header objects (Proposal, Customer Order, Customer Quote, Invoice, etc.) | No | No manufacturer field either (not applicable — headers don't carry line-level product data) |

`Manufacturer_DBA__c` is a **formula field** everywhere it appears on a line-item object (calculated, not directly editable/stored); `Manufacturer_Name__c` is likewise a formula on every line object, but a true lookup/reference on `Product2` — confirming `Product2` is the actual master record for both manufacturer and brand identity, and every line-item object's manufacturer field is a rollup/formula pointing back to it.

**Finding**: No line-item object currently has an equivalent Brand rollup/formula field. Only `Product2` carries real Brand data (`gtherp__Product_Brand_Name__c`).

## 3. Decision — how to implement FR-007/FR-008 given this finding

Presented this finding to the user with three options: (a) revert to relabel-only, (b) proceed with the spec as written (real field where available, "-" elsewhere), (c) split scope by module. **User selected (b) — proceed with the spec as written.**

**Decision**: Each affected table's "Brand" column reads a genuinely distinct brand field where the underlying object exposes one, and renders "-" (via the existing `displayCell()` null-dash convention) everywhere it doesn't. Concretely:

- **Product-level views** (the Order page's Product Catalog card grid, which already queries `Product2` and even has an existing-but-unused `Brand__c` fallback mapping) — MUST resolve to `Product2.gtherp__Product_Brand_Name__c` and display a real value.
- **Every line-item table** (Quote Line, Invoice Line, PO Line, Shipping Manifest Line, Supplier Bill Line, Sales Order Line, Customer Order Line, RMA/RTV/Credit/Debit Memo Line, Proposed Product Line already shipped in 018) — no dedicated Brand field exists at the line-item level today, so these columns render "-" for every record until a Salesforce admin adds an equivalent Brand formula field on each object (mirroring the existing `Manufacturer_Name__c` pattern, pointed at `Product2.gtherp__Product_Brand_Name__c` instead of `gtherp__Manufacturer_Name__c`).

**Rationale**: The user explicitly accepted this tradeoff after seeing the concrete blank-column impact, prioritizing spec correctness (a genuinely distinct Brand data source, not a manufacturer value wearing a new label) over short-term visual completeness. This also creates a clear, visible signal (the "-" cells) for the business to prioritize the backend field additions, rather than silently keeping stale manufacturer data mislabeled as "Brand."

**Out of scope for this feature (backend/Apex work)**: Adding the missing Brand formula fields to the ~14 line-item objects in Salesforce. This repo has no Apex/metadata source under version control, so that work must happen directly in the Salesforce org by an admin/developer with metadata access — tracked as a follow-up, not a blocking task for this feature's frontend delivery.

## 4. Confirmed Salesforce object API names (for reference during implementation)

Found directly in existing `objectName=` query parameters in the codebase's fetch calls (not guessed):

- `gtherp__Proposed_Product__c` — Proposal Line (already migrated in feature 018)
- `gtherp__Customer_Quote_Line__c` — Quote Line
- `gtherp__Invoice_Line__c` — Invoice Line
- `gtherp__Purchase_Order_Line__c` — Purchase Order Line
- `gtherp__Supplier_Bill_Line__c` — Supplier Bill Line
- `gtherp__Shipping_Manifest_Line__c` — Shipping Manifest Line
- `gtherp__Customer_Order_Line__c` — Order Line (confirmed to exist via live describe; not found as an explicit `objectName=` param in the Order page, which resolves it server-side for the `orderlines` action)

## 5. Existing UI patterns to reuse (no new primitives needed)

Confirmed via the 018 feature: `SortableHeader`, `useSortableData`, `useResizableColumns`, `displayCell()` are already used consistently across every affected table. This feature only changes `label` props, field-mapping source expressions, and (where a TS interface needs a new field) adds an additional optional field (`brand?: string`) alongside the existing manufacturer field — it does not touch any shared component or hook.

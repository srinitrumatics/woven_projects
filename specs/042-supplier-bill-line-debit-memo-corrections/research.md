# Phase 0 Research: Supplier Bill Line Page — Debit Memo Lines Tab Corrections

## Current-state audit

**File**: `app/supplier-bills/[id]/lines/[lineid]/components/SBLDebitMemoLinesTab.tsx`

**Columns today** (lines 90-103, 14 total): Debit Memo Line (sticky, plain text) → Status → Debit Memo (plain text; label lacks "#") → **Supplier Bill Line** (redundant self-reference to the page's own parent record — not in the requested column list at all) → Customer Quote Line (plain text, no gating) → **Purchase Order Line** (the column the request implicitly displaces — "Proposed Product" belongs in this position instead, matching the exact bug pattern already found and fixed in feature 031's Debit Memo Lines tab) → Product Name (plain text, not a hyperlink despite a linkable product existing) → Product Description → Brand (label should be "Brand Name"; sourced from `line.brand` only, no `Product_Brand_Name__c` fallback) → Unit Cost → Debit Qty → Total Cost → Shipping → Line Grand Total.

**Decision**: Treat this as the same correction recipe already proven on `PODebitMemoLinesTab.tsx` (feature 031): remove the two extraneous related-record columns, swap in Proposed Product, relabel two headers, add the missing hyperlinks, force `truncate={false}` on every header, and set an initial ascending sort.

**Rationale**: This tab is structurally identical to the pre-031 `PODebitMemoLinesTab.tsx` — same bug shapes (self-referencing column, mislabeled parent-record column standing in for Proposed Product, no gating, no default sort, default-truncating headers). Reusing the exact same fix recipe minimizes risk and keeps the two Debit Memo Lines tabs consistent across the portal.

**Alternatives considered**: Introducing a shared `DebitMemoLinesTable` component used by both the Purchase Order Line page and the Supplier Bill Line page. Rejected per Constitution Principle V (Simplicity & Phase-Driven Scope) — the two components have different data-fetch wiring (`/api/purchase-orders` vs `/api/supplier-bills`) and different parent `page.tsx` files; introducing a shared component now would require prop-drilling or a new shared-types module for a one-tab fix, which is out of proportion to the change.

## Sort default

**Current**: `useSortableData<DebitMemoLine>(debitMemos)` — no initial `SortConfig` is passed, so `sortConfig` starts `null` and rows render in whatever order the Salesforce endpoint returns them (no sort at all, not even a wrong one).

**Decision**: Pass `{ key: 'Name', direction: 'asc' }` as the initial config, identical to the pattern used in all four already-corrected tables on the Purchase Order Line page.

## Header truncation

**Current**: No `SortableHeader` call in this file passes `truncate={false}`. `SortableHeader`'s default (`components/ui/SortableHeader.tsx:24`) is `truncate = true`, so every header in this tab is subject to truncation/wrapping today.

**Decision**: Add `truncate={false}` to every `SortableHeader` call in the corrected column set, matching the fix already applied to every other corrected table in this portal (features 016-031).

## Hyperlink field availability (live-data verification)

Queried the exact live endpoint this component's data flows through (`GET /api/supplier-bills?...&objectId=<Supplier Bill Line Id>&action=returns&objectName=Supplier_Bill_Line__c&tabName=Returns`) against a real Salesforce org record with populated debit memo data. Confirmed the following fields ARE present on the returned `Debit_Memo_Line__c` array items:

- `Product_Name__c` (product id) + `Product_Name` (display name) — safe to build `/products/{Product_Name__c}` unconditionally.
- `Proposed_Product__c` (product id) + `Proposed_Product_Name` (display name) — safe to build `/products/{Proposed_Product__c}` when gated hyperlink applies.
- `Product_Brand_Name__c` — the correct brand source (the REST layer's name for the Salesforce field `gtherp__Brand_Name__c` called out in the request).
- `Customer_Quote_Line__c` (quote line id) + `Customer_Quote_Line_Name` (display name).

Confirmed the following field is **NOT** present anywhere in the payload, flat or nested:

- `Customer_Quote__c` (parent quote id) — required as the first URL segment of `/quotes/{Customer_Quote__c}/lines/{Customer_Quote_Line__c}`.

**Why this matters**: This exact gap was discovered and left unguarded in feature 031's `PODebitMemoLinesTab.tsx`, `PORtvLinesTab.tsx`, and `POSupplierBillLinesTable.tsx` — those components build the Customer Quote Line link from `Customer_Quote__c` without checking it's present, producing `/quotes/undefined/lines/{id}` for any non-Supplier account today (confirmed live, not yet fixed as of this writing).

**Decision**: Guard the Customer Quote Line hyperlink on **both** `Customer_Quote_Line__c` and `Customer_Quote__c` being truthy before rendering a `Link`; render plain text otherwise. Since `Customer_Quote__c` is confirmed absent on every live record checked, this means Customer Quote Line will render as plain text in practice until a backend change adds the field — this is the correct, spec-required behavior (FR-008: no broken links) rather than a regression, since a non-functional link is strictly worse than an honest plain-text cell.

**Alternatives considered**: Falling back to a quote-line-only route (`/quotes/lines/{id}` with no parent quote segment). Rejected — no such route exists in this app (`app/quotes/[id]/lines/[lineid]/page.tsx` requires both the quote id and line id as URL segments); adding one is out of scope for a tab-column-correction feature and would require backend/routing changes beyond this plan's constraints.

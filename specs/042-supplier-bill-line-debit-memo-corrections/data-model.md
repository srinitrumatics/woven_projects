# Phase 1 Data Model: Supplier Bill Line Page — Debit Memo Lines Tab Corrections

## `SBLDebitMemoLinesTab.tsx` — Debit Memo Line column set

| # | Column (target) | Source field | Hyperlink behavior |
|---|---|---|---|
| 1 | Debit Memo Line | `Name` | None (sticky, plain text — no dedicated route change) |
| 2 | Status | `Status__c` | None (status badge) |
| 3 | Debit Memo # | `Debit_Memo_Name` | None — relabel only (was "Debit Memo") |
| 4 | Customer Quote Line | `Customer_Quote_Line_Name` | **New gated hyperlink** → `/quotes/{Customer_Quote__c}/lines/{Customer_Quote_Line__c}`, rendered only when **both** `Customer_Quote_Line__c` and `Customer_Quote__c` are present **and** account is not Supplier-type; plain text otherwise (see research.md — `Customer_Quote__c` is confirmed absent today, so this renders as plain text until the backend adds the field) |
| 5 | Proposed Product | `Proposed_Product_Name` | **New column, replaces "Purchase Order Line"**; gated hyperlink → `/products/{Proposed_Product__c}` when populated and account is not Supplier-type; plain text otherwise |
| 6 | Product Name | `Product_Name` | **New unconditional hyperlink** → `/products/{Product_Name__c}` when populated, regardless of account type |
| 7 | Product Description | `Product_Description__c` | None |
| 8 | Brand Name | `Product_Brand_Name__c` (fallback `brand`) | None — relabel only (was "Brand"); field source corrected to the value confirmed present on live records |
| 9 | Unit Cost | `Unit_Cost__c` (fallback `UnitCost__c`) | None |
| 10 | Debit Qty | `Debit_Qty__c` (fallback `DebitQty__c`) | None |
| 11 | Total Cost | `Total_Cost__c` (fallback `TotalCost__c`) | None |
| 12 | Shipping | `Shipping_Charges__c` (fallback `Shipping__c`) | None |
| 13 | Line Grand Total | `Line_Grand_Total__c` | None |

**Removed** (present today, not in the target list): "Supplier Bill Line" (`Supplier_Bill_Line_Name`) — a redundant self-reference to the page's own parent record.

**Gating**: add `useUserSession` import + local `isManufacturer` computation (`['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '')`), mirroring the exact pattern already shipped in `PODebitMemoLinesTab.tsx` (feature 031) — applies to Customer Quote Line and Proposed Product only.

**Sort**: initial `useSortableData` config changes from `null` (unsorted) to `{ key: 'Name', direction: 'asc' }`.

**Headers**: every `SortableHeader` call in the corrected set gets `truncate={false}`.

**Interface additions** (`DebitMemoLine` type): add `Proposed_Product_Name?: string`, `Proposed_Product__c?: string`, `Product_Name__c?: string`, `Product_Brand_Name__c?: string`.

## Key Entities

- **Debit Memo Line**: unchanged from spec.md — a line item on a Debit Memo tied to this supplier bill line's underlying purchase order line and a product.
- **Customer Quote Line / Proposed Product**: unchanged from spec.md — visibility of their hyperlink is conditional on account type AND on whether the record can be fully resolved to a detail page (both IDs present).

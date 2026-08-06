# Data Model: Product Brand Field Rename

This feature has no new business entity. The relevant "entity" is the Salesforce field itself and its reference sites across the codebase.

## Entity: Product Brand Field

| Attribute | Old value | New value |
|---|---|---|
| API name (non-namespaced) | `Product_Brand_Name__c` | `Brand_Name__c` |
| API name (namespaced, sync object) | `gtherp__Product_Brand_Name__c` | `gtherp__Brand_Name__c` |
| Represents | A product's brand name | (unchanged) |
| Consumed by | Two independent pipelines (below) | (unchanged) |

## Reference-site inventory (30 files, 60 lines, 63 occurrences)

Legend: **Read** = object-property access on already-fetched data · **Type** = TypeScript interface/type declaration · **SOQL** = Salesforce query text · **Key** = internal sort-field/column-width identifier (not a Salesforce field itself, but must stay in sync with the renamed property) · **Dedup** = this site already contains `Brand_Name__c`/`gtherp__Brand_Name__c` in the same expression or interface and must be collapsed after rename (see `research.md` Decision 2).

### Pipeline A — Apex REST-backed line-item pages (27 files)

| File | Line(s) | Kind | Dedup? |
|---|---|---|---|
| `app/inventory/page.tsx` | 95 | Read | — |
| `app/invoices/[id]/lines/[lineid]/components/InvoiceLineCreditMemoTab.tsx` | 77 | Read | — |
| `app/invoices/[id]/lines/[lineid]/page.tsx` | 108 | Read | — |
| `app/invoices/[id]/page.tsx` | 53 | Read | — |
| `app/proposals/[id]/lines/[lineid]/page.tsx` | 44 | Type | Yes — duplicate of existing `Brand_Name__c?: string;` (line 45) |
| `app/proposals/[id]/lines/[lineid]/page.tsx` | 141, 163, 190, 210, 249, 274, 323, 350, 371, 392 | Read (×10) | — |
| `app/proposals/[id]/lines/[lineid]/page.tsx` | 446 | Read | Yes — chain already has `item.Brand_Name__c` |
| `app/proposals/[id]/page.tsx` | 477 | Read | — |
| `app/purchase-orders/[id]/components/POLinesTable.tsx` | 39 | Read | — |
| `app/purchase-orders/[id]/components/POSerialNumbersTable.tsx` | 25 | Type | Yes — duplicate of existing `Brand_Name__c?: string;` (line 23); `gtherp__Brand_Name__c?: string;` (line 24) is untouched |
| `app/purchase-orders/[id]/components/POSerialNumbersTable.tsx` | 50 | Read | — |
| `app/purchase-orders/[id]/lines/[lineid]/components/PODebitMemoLinesTab.tsx` | 36 | Type | Yes — duplicate of existing `Brand_Name__c?: string;` (line 35) |
| `app/purchase-orders/[id]/lines/[lineid]/components/PODebitMemoLinesTab.tsx` | 148 | Read (×2 in line) | — |
| `app/purchase-orders/[id]/lines/[lineid]/components/PORtvLinesTab.tsx` | 36 | Type | Yes — duplicate of existing `Brand_Name__c?: string;` (line 35) |
| `app/purchase-orders/[id]/lines/[lineid]/components/PORtvLinesTab.tsx` | 145 | Read (×2 in line) | — |
| `app/purchase-orders/[id]/lines/[lineid]/components/POSerialNumberLogLinesTab.tsx` | 21 | Type | Yes — duplicate of existing `Brand_Name__c?: string;` (line 20) |
| `app/purchase-orders/[id]/lines/[lineid]/components/POSerialNumberLogLinesTab.tsx` | 111, 112 | Read | — |
| `app/purchase-orders/[id]/lines/[lineid]/components/POSupplierBillLinesTable.tsx` | 28 | Type | Yes — duplicate of existing `Brand_Name__c?: string;` (line 27) |
| `app/purchase-orders/[id]/lines/[lineid]/components/POSupplierBillLinesTable.tsx` | 163, 164 | Read | — |
| `app/purchase-orders/[id]/lines/[lineid]/page.tsx` | 85 | Read | — |
| `app/quotes/[id]/lines/[lineid]/components/QuoteLineFulfillmentsTab.tsx` | 142, 173, 201 | Read (×3) | — |
| `app/quotes/[id]/lines/[lineid]/components/QuoteLinePurchasesTab.tsx` | 101, 132 | Read (×2) | — |
| `app/quotes/[id]/lines/[lineid]/components/QuoteLineReturnsTab.tsx` | 159, 183, 209, 237 | Read (×4) | — |
| `app/quotes/[id]/lines/[lineid]/page.tsx` | 31 | Type | Yes — duplicate of existing `Brand_Name__c?: string;` (line 32) |
| `app/quotes/[id]/lines/[lineid]/page.tsx` | 191 | Read | Yes — chain already has `item.Brand_Name__c` |
| `app/quotes/[id]/page.tsx` | 276 | Read | — |
| `app/shipments/[id]/components/InventoryTab.tsx` | 60 | Read | — |
| `app/shipments/[id]/components/SerialNumbersTab.tsx` | 49 | Read | — |
| `app/shipments/[id]/components/ShipmentLinesTab.tsx` | 98 | Read | — |
| `app/shipments/[id]/lines/[lineid]/components/InventoryTab.tsx` | 54 | Read | — |
| `app/shipments/[id]/lines/[lineid]/components/ProductInformationCard.tsx` | 77, 79 | Read (×2) | Yes — chain already has `product.Brand_Name__c` (both lines) |
| `app/shipments/[id]/lines/[lineid]/components/SerialNumbersTab.tsx` | 53 | Read | — |
| `app/supplier-bills/[id]/lines/[lineid]/components/SBLDebitMemoLinesTab.tsx` | 33 | Type | — |
| `app/supplier-bills/[id]/lines/[lineid]/components/SBLDebitMemoLinesTab.tsx` | 64 | Key (`columnWidths` object key) | — |
| `app/supplier-bills/[id]/lines/[lineid]/components/SBLDebitMemoLinesTab.tsx` | 104 | Key (`SortableHeader field` prop + `columnWidths` lookup, ×2 in line) | — |
| `app/supplier-bills/[id]/lines/[lineid]/components/SBLDebitMemoLinesTab.tsx` | 154 | Read | — |
| `app/supplier-bills/[id]/lines/[lineid]/page.tsx` | 63 | Read | Yes — chain already has `item.Brand_Name__c` |
| `app/supplier-bills/[id]/page.tsx` | 126 | Read | — |

### Pipeline B — SOQL / Algolia product-sync (3 files)

| File | Line(s) | Kind | Dedup? |
|---|---|---|---|
| `lib/product-load-service.ts` | 53 | SOQL (namespaced: `gtherp__Product_Brand_Name__c` → `gtherp__Brand_Name__c`) | — |
| `lib/product-load-service.ts` | 97 | Read (namespaced) | — |
| `lib/products-service.ts` | 48 | Read | Yes — chain already has `sfProduct.Brand_Name__c` |
| `lib/product-sync-service.ts` | 187 | Read | Yes — chain already has `productData.Brand_Name__c` |

## Validation rules

- After the rename, `grep -rn "Product_Brand_Name__c" --include="*.ts" --include="*.tsx" .` (excluding `node_modules`) MUST return zero results.
- No fallback expression or TypeScript interface in the codebase MUST contain `Brand_Name__c` (non-namespaced) listed more than once; the same rule applies to `gtherp__Brand_Name__c`.
- `app/supplier-bills/[id]/lines/[lineid]/components/SBLDebitMemoLinesTab.tsx`'s `columnWidths` key and `SortableHeader` `field` prop MUST match the renamed property name exactly (`Brand_Name__c`), or column sorting/width-persistence for that column breaks silently.

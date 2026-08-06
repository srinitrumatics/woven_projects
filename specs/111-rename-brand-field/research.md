# Research: Product Brand Field Rename

## Decision 1: Full literal-string scope, including the namespaced sync variant

**Decision**: Rename every occurrence of the exact strings `Product_Brand_Name__c` → `Brand_Name__c` and `gtherp__Product_Brand_Name__c` → `gtherp__Brand_Name__c`, wherever they appear as a Salesforce field key: object-property access on data returned from Salesforce, SOQL query text, and TypeScript type/interface declarations that model that data.

**Rationale**: The user's request and confirmation (`/speckit-specify` clarification) is that the Salesforce org itself renamed this field. A complete inventory (`grep -rn "Product_Brand_Name__c"`) found 60 matching lines (63 total substring occurrences — a few lines reference the field twice) across 30 files, split into two independent pipelines:
- **Apex REST-backed line-item pages** (27 files: Orders, Invoices, Proposals, Quotes, Purchase Orders, Shipments, Supplier Bills, Inventory) — read the field as a plain object property on JSON already returned by `/services/apexrest/gtherp/generic/tab` (or similar) endpoints.
- **SOQL/Algolia product-sync pipeline** (3 files: `lib/product-load-service.ts`, `lib/products-service.ts`, `lib/product-sync-service.ts`) — one of these (`lib/product-load-service.ts:53`) selects the namespaced field directly in a SOQL `SELECT` clause; the other two read it as a fallback among several possible field-name shapes on already-fetched product data.

**Alternatives considered**:
- *Rename only the SOQL-query site, leave the Apex REST consumer sites untouched*: Rejected — inconsistent with the user's explicit instruction ("all pages across the web app") and the confirmed premise that the org renamed the field everywhere it is exposed, not just in one query.
- *Timestamp/feature-flag the rename behind a fallback (keep both old and new names indefinitely)*: Rejected per Constitution Principle V (Simplicity & Phase-Driven Scope) — no speculative dual-support is needed once the org-side rename is confirmed as already-live; a clean rename is simpler and matches YAGNI.

## Decision 2: Dedup fallback chains that would otherwise repeat the new name

**Decision**: Where a fallback expression (`??` or `||` chain) already lists `Brand_Name__c` (or `gtherp__Brand_Name__c`) alongside `Product_Brand_Name__c`, collapse the resulting duplicate reference to a single occurrence after the rename, preserving the relative order of all other fallback terms in that expression. The same applies to TypeScript interfaces that declare both field names as separate optional properties — collapse to one declaration.

**Rationale**: Several call sites were written defensively to try multiple possible field-name shapes returned by different endpoints (e.g. `item.Product_Brand_Name__c || item.Brand_Name__c || item.Brand__c || "-"`). Once the old name is renamed to match one of the names already in the same chain, leaving both produces a literal `x || x` — dead, confusing code with no behavioral difference, but it fails a plain read of "does this code make sense." Per FR-005 in the spec, this must be cleaned up.

**Alternatives considered**:
- *Leave duplicate fallback terms in place*: Rejected — technically harmless (a no-op) but leaves obviously dead code that misrepresents intent to future readers, and directly contradicts spec FR-005 / SC-004.

**Confirmed sites requiring dedup** (from the full occurrence inventory):
| File | Line(s) | Expression before → after |
|---|---|---|
| `app/proposals/[id]/lines/[lineid]/page.tsx` | 44–45 (type decl), 446 (read) | `Product_Brand_Name__c?: string; Brand_Name__c?: string;` → one declaration; `item.Product_Brand_Name__c \|\| item.Brand_Name__c \|\| "-"` → `item.Brand_Name__c \|\| "-"` |
| `app/purchase-orders/[id]/lines/[lineid]/components/PODebitMemoLinesTab.tsx` | 35–36 (type decl) | two declarations → one |
| `app/purchase-orders/[id]/lines/[lineid]/components/PORtvLinesTab.tsx` | 35–36 (type decl) | two declarations → one |
| `app/purchase-orders/[id]/lines/[lineid]/components/POSupplierBillLinesTable.tsx` | 27–28 (type decl) | two declarations → one |
| `app/purchase-orders/[id]/lines/[lineid]/components/POSerialNumberLogLinesTab.tsx` | 20–21 (type decl) | two declarations → one |
| `app/purchase-orders/[id]/components/POSerialNumbersTable.tsx` | 23, 25 (type decl) | two declarations → one (line 24's `gtherp__Brand_Name__c?: string;` is untouched — different field) |
| `app/quotes/[id]/lines/[lineid]/page.tsx` | 31–32 (type decl), 191 (read) | two declarations → one; `item.Product_Brand_Name__c \|\| item.Brand_Name__c \|\| item.Brand__c \|\| "-"` → `item.Brand_Name__c \|\| item.Brand__c \|\| "-"` |
| `app/shipments/[id]/lines/[lineid]/components/ProductInformationCard.tsx` | 77, 79 (read, two attrs) | `product.Product_Brand_Name__c \|\| product.Brand_Name__c \|\| product.Brand__c \|\| "—"` → `product.Brand_Name__c \|\| product.Brand__c \|\| "—"` (both occurrences) |
| `app/supplier-bills/[id]/lines/[lineid]/page.tsx` | 63 (read) | `item.Product_Brand_Name__c \|\| item.Brand_Name__c \|\| item.Brand__c` → `item.Brand_Name__c \|\| item.Brand__c` |
| `lib/products-service.ts` | 48 (read) | `...?? sfProduct.Brand_Name__c ?? sfProduct.Product_Brand_Name__c ?? "—"` → `...?? sfProduct.Brand_Name__c ?? "—"` |
| `lib/product-sync-service.ts` | 187 (read) | `...?? productData.Brand_Name__c ?? productData.Product_Brand_Name__c ?? ''` → `...?? productData.Brand_Name__c ?? ''` |

All other occurrence sites have no existing `Brand_Name__c` in the same expression/interface and are a direct 1:1 rename with no dedup needed.

## Decision 3: Internal sort-key / column-width identifiers must be renamed in lockstep

**Decision**: In `app/supplier-bills/[id]/lines/[lineid]/components/SBLDebitMemoLinesTab.tsx`, the string `"Product_Brand_Name__c"` is also used as: (a) a `columnWidths` object key (line 64), and (b) the `field` prop passed to `SortableHeader` plus a matching `columnWidths.Product_Brand_Name__c` lookup (line 104). These are not Salesforce field reads themselves, but they must key off the same property name as the renamed data field (line 154's `line.Product_Brand_Name__c` read, line 33's type declaration) for column sorting and width persistence to keep working. All four sites in this file are renamed together.

**Rationale**: `useSortableData`'s `field` prop is used to look up the property to sort by on each row object; if the row object's property is renamed but the `field` string is not, sorting by the Brand Name column silently breaks (sorts by an always-`undefined` key). This was confirmed by inspecting the file directly — no other file in the inventory has this same internal-key pattern.

**Alternatives considered**: None — this is a direct consequence of Decision 1, not a separate design choice; called out here only because it's easy to miss in a naive string-replace pass scoped only to "Salesforce field reads."

## Decision 4: No automated regression test exists — verification is grep + manual browser check

**Decision**: Verify the rename via (a) `grep -rn "Product_Brand_Name__c"` returning zero matches project-wide, and (b) manually loading one representative page from each of the two pipelines (e.g. an Order line detail page and the Product Catalog) in a browser and confirming Brand Name still displays a value for a product known to have one.

**Rationale**: Per `CLAUDE.md` and prior specs in this repo (e.g. `110-fix-add-to-order-null-crash`), there is no automated UI test suite (`npm run test:rbac` and `npm run test:product-sync` cover unrelated domains). This matches the project's existing convention: type-check + manual verification in a browser is the standard bar for UI/data-mapping changes here.

**Alternatives considered**: Writing a new automated test harness for this — rejected as disproportionate to a field-name rename, and inconsistent with Constitution Principle V (no speculative infrastructure beyond what the active work needs).

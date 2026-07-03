# Quickstart: Purchase Order Line Page Corrections

**Prerequisites**: `npm run dev`, a logged-in session, access to both a Supplier-type and a Hybrid-type test account, and a purchase order line with more than 10 records on each of the four tables (Supplier Bill Lines, Serial Number Logs, RTV Lines, Debit Memo Lines), including populated Customer Quote Line, Proposed Product, brand, and (for Serial Number Logs) Purchase Order data.

## Validation scenarios — Supplier Bill Lines tab

1. **Column order & labels** — Open a purchase order line, select the Supplier Bill Lines tab. Confirm columns appear in this exact order: Supplier Bill Line, Status, Supplier Bill #, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Cost, Billed Qty, Bill Amount, Shipping, Total Bill Amount, Goods Receipt Date.
2. **Label error fixed** — Confirm "Purchase Order Line" is no longer shown anywhere on this tab.
3. **New hyperlinks** — Click a populated Supplier Bill Line and Product Name value; confirm both navigate to the correct record detail pages.
4. **Supplier account gating** — As a Supplier-type account, confirm Customer Quote Line and Proposed Product render as plain text.
5. **Hybrid account gating** — As a Hybrid-type account, confirm Customer Quote Line and Proposed Product render as working hyperlinks (where populated).
6. **Brand Name** — Confirm a populated brand shows correctly (not blank).
7. **Default sort** — Reload without sorting; confirm rows appear in ascending Supplier Bill Line order (this is a fix — previously unsorted).
8. **Pagination / headers / sticky column** — Regression check: confirm all three still work as before.

## Validation scenarios — Serial Number Logs tab

1. **Column order & labels** — Select the Serial Number Logs tab. Confirm columns appear in this exact order: Serial Number Log, Serial Number #, Product Serial Number, Product Name, Product Description, Brand Name, Purchase Order #, RMA #, Received Date, Active.
2. **Renamed to match** — Confirm labels read "Serial Number #," "Purchase Order #," and "RMA #" (not the previous "Serial Number," "Purchase Order," "RMA"); confirm "Purchase Order Lines" and "RMA Line" no longer appear.
3. **Brand Name (new)** — Confirm the previously-absent Brand Name column now shows a real value for a populated record.
4. **New hyperlinks** — Click a populated Product Name and Purchase Order # value; confirm both navigate correctly (Purchase Order # is unconditional — no account-type gating on this column).
5. **Default sort** — Reload without sorting; confirm rows appear in ascending Serial Number Log order.
6. **Pagination / headers / sticky column** — Regression check.

## Validation scenarios — RTV Lines tab

1. **Column order & labels** — Select the Returns tab's RTV Lines sub-tab. Confirm columns appear in this exact order: RTV Line, Status, RTV #, Customer Quote Line, Proposed Product, Reason Code, Product Name, Product Description, Brand Name, Unit Cost, Return Qty, Total Cost.
2. **Label error fixed** — Confirm "Purchase Order Line" is no longer shown.
3. **Supplier/Hybrid gating** — Same check as Supplier Bill Lines: Supplier sees plain text, Hybrid sees hyperlinks on Customer Quote Line and Proposed Product.
4. **RTV # stays plain text** — Confirm RTV # is not a hyperlink (no dedicated RTV detail page exists in this portal).
5. **Brand Name & Product Name hyperlink** — Confirm both work correctly.
6. **Default sort** — Reload without sorting; confirm rows appear in ascending RTV Line order (this is the "Returns Tab Sort Order" fix explicitly called out in the request).
7. **Pagination / headers / sticky column** — Regression check.

## Validation scenarios — Debit Memo Lines tab

1. **Column order & labels** — Select the Returns tab's Debit Memo Lines sub-tab. Confirm columns appear in this exact order: Debit Memo Line, Status, Debit Memo #, Customer Quote Line, Proposed Product, Product Name, Product Description, Brand Name, Unit Cost, Debit Qty, Total Cost, Shipping, Line Grand Total.
2. **Columns removed** — Confirm "Supplier Bill Line" and "Purchase Order Line" (shown previously) are no longer present.
3. **Debit Memo # stays plain text** — Confirm it is not a hyperlink (no dedicated Debit Memo detail page exists in this portal).
4. **Supplier/Hybrid gating** — Same check as the other tabs.
5. **Default sort** — Reload without sorting; confirm rows appear in ascending Debit Memo Line order.
6. **Pagination / headers / sticky column** — Regression check.

## Fields to verify against the live org during implementation

Per `research.md`, several field mappings are inferred from precedent elsewhere in the codebase rather than confirmed directly on these exact objects:
- The Proposed Product id field (assumed `Proposed_Product__c`) on all three tables where it's added.
- Whether `brand`/`Brand_Name__c`/`gtherp__Brand_Name__c` is actually populated by the live API on Supplier Bill Lines, RTV Lines, and Debit Memo Lines (the interfaces already declare it, but this table family has no mapping layer to confirm the value is ever set).
- The Supplier Bill Line's own hyperlink target (assumed `/supplier-bills/{Supplier_Bill__c}/lines/{Id}`).
- The Purchase Order # field on Serial Number Logs (assumed `Purchase_Order__c`, referenced in the header's sort key today but never actually read in a cell).

If any of these fields/routes are unavailable, the corresponding column should render as plain text or "-" rather than a broken link — confirm this degrades gracefully.

## Expected outcome

All four tabs show their prescribed column layouts with the "Purchase Order Line" mislabel corrected to "Proposed Product" (Bills, RTV, Debit Memo), the Serial Number Logs tab renamed to match the portal-wide convention with a new Brand Name column, Supplier/Hybrid-conditional hyperlinks working correctly on Customer Quote Line and Proposed Product across all three applicable tabs, and all four tabs defaulting to ascending sort by their own record identifier — matching SC-001 through SC-009 in the spec.

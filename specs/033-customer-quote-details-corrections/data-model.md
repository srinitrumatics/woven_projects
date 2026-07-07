# Data Model: Customer Quote Details Page — Lines, Fulfillment, Returns Corrections

## Customer Quote Lines tab — `QuoteLinesTab.tsx`

| # | Column | Current field | Change |
|---|--------|----------------|--------|
| 1 | Customer Quote Line | `Name` (hyperlink) | No change — already hyperlinked to `/quotes/{quoteId}/lines/{id}` |
| 2 | Status | `status` | No change |
| 3 | Proposed Product | **new**: `proposedProductName`/`proposedProductId` | New column; new gated-free hyperlink → `/products/{proposedProductId}` (no account-type gating requested for this tab, unlike feature 031's PO Line tables) |
| 4 | Product Name | `productName` (+ **new** `productId` as id) | **New hyperlink** → `/products/{productId}` (currently plain text) |
| 5 | Product Description | `description` | No change |
| 6 | Brand Name | **fix**: `brand` currently unpopulated → map from `Brand_Name__c` | Relabel "Brand" → "Brand Name"; fixes dead field |
| 7 | Grouping | **new**: `grouping` ← `Groupings__c` | New column |
| 8 | Unit Price | `unitPrice` | No change |
| 9 | Total Order Qty | `quantity` | Relabel "Total Qty" → "Total Order Qty" |
| 10 | Total Price | `totalPrice` | No change |
| 11 | Shipping | `shipping` | No change |
| 12 | Taxes | `taxes` | No change |
| 13 | Line Grand Total | `lineGrandTotal` | No change |
| 14 | Qty Shipped | `qtyShipped` | No change |
| 15 | Action | n/a (Eye icon → line detail) | No change |

**Interface (`QuoteLine`) additions**: `proposedProductName?: string`, `proposedProductId?: string`, `productId?: string`, `grouping?: string`. **Interface change**: `brand?: string` retained but now actually populated (mapping fix, not a rename).

**Sort**: `page.tsx:42-43` — `useState<keyof QuoteLine>("productName")` → `useState<keyof QuoteLine>("Name")`; direction stays `'asc'`.

## Sales Orders sub-tab — `QuoteSalesOrdersSubTab.tsx`

| # | Column | Current field | Change |
|---|--------|----------------|--------|
| 1 | Sales Order # | `salesOrderNumber` (plain text) | **New hyperlink** → `/orders/{id}` using the row's own `id` (see spec Assumptions: this app has no separate Sales Order record page; the existing Orders detail page is the established target per feature 021 precedent) |
| 2 | Status | `status` | No change |
| 3 | Customer Quote # | `customerQuote`/`customerQuoteId` | Relabel "Customer Quote" → "Customer Quote #"; already hyperlinked (gated `!isManufacturer`) |
| 4 | Proposal # | **new**: `proposalName`/`proposalId` | New column; new gated hyperlink → `/proposals/{proposalId}` (gated `!isManufacturer`, matching the Customer Quote # pattern) |
| 5 | Proposal Name | **new**: `proposalName` | New column, plain text (same source value as Proposal #'s link label) |
| 6 | Customer Order # | `customerOrder`/`customerOrderId` | Relabel "Customer Order" → "Customer Order #"; already hyperlinked (gated `!isManufacturer && !isRestricted`) |
| 7-21 | Customer PO ... Grand Total, Request Date, Planned Ship Date, Ship Confirmed Date | unchanged | No change (already correct per audit) |

**Removed**: "Pick Date" (`pickDate`) and "Pick Complete Date" (`pickCompleteDate`) — not in FR-012's list.

**Interface (`QuoteSalesOrder`) additions**: `proposalName?: string`, `proposalId?: string`. **Interface removals**: `pickDate`, `pickCompleteDate` (become unused).

**Sort**: `QuoteFulfillmentTab.tsx:25-26` — direction `'desc'` → `'asc'`; field (`salesOrderNumber`) unchanged.

## Shipping Manifests sub-tab — `QuoteShippingManifestsSubTab.tsx`

| # | Column | Current field | Change |
|---|--------|----------------|--------|
| 1 | Shipping Manifest # | `manifestNumber` (hyperlink) | No change — already hyperlinked to `/shipments/{id}` |
| 2 | Status | `status` | No change |
| 3 | Sales Order # | `salesOrder` | Relabel "Sales Order" → "Sales Order #"; stays plain text (no hyperlink requested) |
| 4 | Customer Quote # | `customerQuote`/`customerQuoteId` | Relabel; already hyperlinked |
| 5 | Proposal # | **new**: `proposalName`/`proposalId` | New column; new gated hyperlink, same pattern as Sales Orders sub-tab |
| 6 | Proposal Name | **new**: `proposalName` | New column, plain text |
| 7 | Customer Order # | `customerOrder`/`customerOrderId` | Relabel; already hyperlinked (gated) |
| 8-13 | Customer PO, Ship to Account/Location/Contact, Drop Ship, Total Lines, Total Price | unchanged | Reorder only: these six move to immediately follow Customer Order #, ahead of the Box columns (currently Box columns come first) |
| 14 | Box Count | `boxCount` | No change (reordered) |
| 15 | Box Length | **new**: `boxLength` ← `Case_Length__c` | New column |
| 16 | Box Width | **new**: `boxWidth` ← `Case_Width__c` | New column |
| 17 | Box Height | **new**: `boxHeight` ← `Case_Height__c` | New column (was never present despite being listed as an existing field name in the request — not found in current mapping, added here) |
| 18 | Box Net Weight | `boxNetWeight` | No change; drop the hardcoded `" kg"` suffix in favor of `formatNumber()` for consistency with Box Count |
| 19 | Box Gross Weight | `boxGrossWeight` | No change; same formatting fix as Box Net Weight |
| 20 | Logistics Partner | `logisticsPartner` | No change (reordered, now follows Box Gross Weight directly, "Logistics Contact" removed from between) |
| 21-24 | Planned Ship Date, Ship Confirmed Date, Tracking Number, Tracking Status | unchanged | "Tracking Status" moves to immediately follow "Tracking Number" (currently after Estimated Delivery Date) |
| 25 | Estimated Delivery Date | `estimatedDeliveryDate` | Moves to follow Tracking Status |
| 26 | Actual Delivery Date | `actualDeliveryDate` | No change |

**Removed**: "Shipping Method" (`shippingMethod`) and "Logistics Contact" (`logisticsContact`) — not in FR-016's list.

**Interface (`QuoteShippingManifest`) additions**: `proposalName?: string`, `proposalId?: string`, `boxLength?: number`, `boxWidth?: number`, `boxHeight?: number`. **Interface removals**: `shippingMethod`, `logisticsContact` (become unused).

**Sort**: `QuoteFulfillmentTab.tsx:29-30` — direction `'desc'` → `'asc'`; field (`manifestNumber`) unchanged.

## Invoices sub-tab — `QuoteInvoicesSubTab.tsx`

| # | Column | Current field | Change |
|---|--------|----------------|--------|
| 1 | Invoice # | `invoiceNumber` (hyperlink) | No change — already hyperlinked to `/invoices/{id}` |
| 2 | Status | `status` | No change |
| 3 | Sales Order # | `salesOrder` | Relabel; stays plain text |
| 4 | Purchase Order # | **new**: `purchaseOrder`/`purchaseOrderId` ← `Purchase_Order_Name`/`Purchase_Order__c` | New column, plain text (no hyperlink requested) |
| 5 | Customer Quote # | `customerQuote`/`customerQuoteId` | Relabel; already hyperlinked |
| 6 | Proposal # | **new**: `proposalName`/`proposalId` | New column; new gated hyperlink, same pattern |
| 7 | Proposal Name | **new**: `proposalName` | New column, plain text |
| 8 | Customer Order # | `customerOrder`/`customerOrderId` | Relabel; already hyperlinked (gated) |
| 9-19 | Customer PO ... Grand Total, Issued Date, Payment Terms, Due Date, Collection Status, Open Balance, Settled Date | unchanged | No change |

**Removed**: "Days Outstanding" (`daysOutstanding`) — not in FR-021's list.

**Interface (`QuoteInvoice`) additions**: `purchaseOrder?: string`, `purchaseOrderId?: string`, `proposalName?: string`, `proposalId?: string`. **Interface removal**: `daysOutstanding` (becomes unused).

**Sort**: `QuoteFulfillmentTab.tsx:33-34` — direction `'desc'` → `'asc'`; field (`invoiceNumber`) unchanged.

## RMAs sub-tab — `QuoteRMASubTab.tsx`

| # | Column | Current field | Change |
|---|--------|----------------|--------|
| 1 | RMA # | `rmaNumber` (plain text) | No change — no RMA detail route exists in this app (documented, unchanged posture) |
| 2 | Status | `status` | No change |
| 3 | Type | `rmaType` | Relabel "RMA Type" → "Type"; **reposition** to immediately follow Status (currently positioned after Customer Order) |
| 4 | Sales Order # | `salesOrder` | Relabel; stays plain text |
| 5 | Customer Quote # | `customerQuote`/`customerQuoteId` | Relabel; already hyperlinked |
| 6 | Proposal # | **new**: `proposalName`/`proposalId` | New column; new gated hyperlink, same pattern |
| 7 | Proposal Name | **new**: `proposalName` | New column, plain text |
| 8 | Customer Order # | `customerOrder`/`customerOrderId` | Relabel; **fix gating** — see below |
| 9-15 | Ship from Account/Contact, Return to Account/Contact, Drop Ship, Total Lines, Total Price | unchanged | No change |
| 16-17 | Issued Date, Return By Date | unchanged | Relabel "Return by Date" → "Return By Date" (capitalization) |
| 18-20 | Shipping Method, Logistics Partner, Logistics Contact | unchanged | No change |
| 21 | Tracking Number | `trackingNumber` | No change |
| 22 | Tracking Status | `trackingStatus` | **Reorder** to immediately follow Tracking Number (currently after Estimated Delivery Date) |
| 23 | Estimated Delivery Date | `estimatedDeliveryDate` | Moves to follow Tracking Status |
| 24 | Actual Delivery Date | `actualDeliveryDate` | No change |
| 25 | Goods Receipt Date | `goodsReceiptsDate` | Relabel "Goods Receipts Date" → "Goods Receipt Date" (typo fix); rename interface field to `goodsReceiptDate` (singular) to match the `QuotePurchase` convention |

**Bug fix — access gating (FR-029)**: `QuoteRMASubTab.tsx:37` currently has `const isRestricted = '';` (always falsy — the Customer Order # link is therefore never restricted for any account type). Fix to compute it the same way as every sibling sub-tab: `const isRestricted = accountType === 'Customer' || accountType === 'NSO';` (requires reading `accountType` from `selectedAccount?.Account_Record_Type__c || selectedAccount?.Type`, already computed at line 36 but currently unused for this purpose).

**Bug fix — pagination label (FR-030)**: `QuoteRMASubTab.tsx:158` — `itemName=""` → `itemName="RMAs"`.

**Interface (`QuoteRMA`) additions**: `proposalName?: string`, `proposalId?: string`. **Interface rename**: `goodsReceiptsDate` → `goodsReceiptDate`.

**Sort**: `QuoteReturnsTab.tsx:40-41` — direction `'desc'` → `'asc'`; field (`rmaNumber`) unchanged.

## Credit Memos sub-tab — `QuoteCreditMemoSubTab.tsx`

| # | Column | Current field | Change |
|---|--------|----------------|--------|
| 1 | Credit Memo # | `memoNumber` (plain text) | No change — no Credit Memo detail route exists |
| 2 | Status | `status` | No change |
| 3 | Invoice # | `invoice`/`invoiceId` | Relabel "Invoice" → "Invoice #"; already hyperlinked (gated `!isManufacturer`) |
| 4 | Sales Order # | **newly rendered**: `salesOrder` (already mapped, `page.tsx:512-513`, just never displayed) | New column render, plain text — no new field mapping required |
| 5 | Customer Quote # | `customerQuote`/`customerQuoteId` | Relabel; already hyperlinked |
| 6 | Proposal # | **new**: `proposalName`/`proposalId` | New column; new gated hyperlink, same pattern |
| 7 | Proposal Name | **new**: `proposalName` | New column, plain text |
| 8 | Customer Order # | `customerOrder`/`customerOrderId` | Relabel; **fix broken/ungated link** — see below |
| 9-16 | Total Lines ... Settled Date | unchanged | No change |

**Removed**: "Credit to Account" (`creditToAccount`) and "Credit to Contact" (`creditToContact`) — not in FR-031's list.

**Bug fix — broken/ungated link (FR-035, FR-036)**: `QuoteCreditMemoSubTab.tsx:114-119` currently renders:
```
<Link href={`/orders/${memo.customerOrderId}`} target="_blank" ...>{memo.customerOrder}</Link>
```
unconditionally — no `customerOrderId` truthiness check and no `isManufacturer`/`isRestricted` gating. Fix to match the pattern already used for Customer Quote # two rows above (and for Customer Order # on all four other Fulfillment/Returns tables):
```
{memo.customerOrderId ? (
  !isManufacturer && !isRestricted ? (
    <Link href={`/orders/${memo.customerOrderId}`} target="_blank" ...>{memo.customerOrder}</Link>
  ) : displayCell(memo.customerOrder)
) : displayCell(memo.customerOrder)}
```
`isRestricted` is already correctly computed at `QuoteCreditMemoSubTab.tsx:36` (unlike RMAs) but was simply never applied to this cell.

**Interface (`QuoteCreditMemo`) additions**: `proposalName?: string`, `proposalId?: string`. **Interface removals**: `creditToAccount`, `creditToContact` (become unused). No change needed for `salesOrder`/`salesOrderId` (already present).

**Sort**: `QuoteReturnsTab.tsx:44-45` — direction `'desc'` → `'asc'`; field (`memoNumber`) unchanged.

## Cross-cutting: widths configuration

Each affected sub-tab's parent (`QuoteFulfillmentTab.tsx` for Sales Orders/Shipping Manifests/Invoices; `QuoteReturnsTab.tsx` for RMAs/Credit Memos; `app/quotes/[id]/page.tsx` for Quote Lines) owns a `useResizableColumns({...})` call whose initial config object must gain a width entry for every new column (`proposalName`, `proposalId` is not rendered so no width needed for it, `boxLength`, `boxWidth`, `boxHeight`, `purchaseOrder`, `grouping`, `proposedProductName`, `productId`) and drop entries for removed columns (`pickDate`, `pickCompleteDate`, `shippingMethod` on Shipping Manifests only, `logisticsContact` on Shipping Manifests only, `daysOutstanding`, `creditToAccount`, `creditToContact`). Exact key lists are enumerated per-table above.

## Relationships (all six sub-tables)

- **Sales Order / Shipping Manifest / Invoice / RMA / Credit Memo → Proposal**: optional many-to-one, newly exposed via Proposal #/Proposal Name. When absent, both columns render "-" per the spec's edge cases.
- **Sales Order / Shipping Manifest / Invoice / RMA / Credit Memo → Customer Order**: optional many-to-one, already present; RMAs/Credit Memos fixes bring their gating/null-handling in line with the other tables.
- **Customer Quote Line → Proposed Product / Product**: optional many-to-one each, newly exposed as two distinct hyperlinked columns.

## Validation rules

- All fields render `"-"` when the underlying Salesforce value is null/empty (portal-wide null-dash convention, spec 015), via `displayCell()`/`formatCurrency()`/`formatDate()`/`formatNumber()`.
- Customer Order # (RMAs, Credit Memos) and Proposal #/Customer Quote # (all five sub-tables) render as plain text for restricted/manufacturer account types — no client-side validation beyond existing gating logic.

## State transitions

Not applicable — these are read-only display tables with no record state machine.

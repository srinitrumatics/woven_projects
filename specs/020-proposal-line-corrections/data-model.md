# Data Model: Proposal Line Page — Fulfillment & Returns Corrections

## Interface change catalogue

All changes are additive to the shared interfaces already declared in `app/proposals/[id]/types.ts` (also consumed by the parent Proposal Detail page — additive fields are non-breaking there).

**`SalesOrder`** — no new field needed (`customerQuoteLineId?: string` already declared); only the **mapping** in `page.tsx` needs to populate it.

**`ShippingManifest`** — no new field needed (`boxLength?`, `boxWidth?`, `boxHeight?: number` already declared from a prior feature); only the **mapping** in `page.tsx` needs to populate them from `Case_Length__c`/`Case_Width__c`/`Case_Height__c`.

**`Invoice`** — add 1 field:
```ts
totalOrderQty?: number;    // gtherp__Total_Order_Qty__c — distinct from existing invoiceQty (Invoiced_Qty__c)
```

**`CreditMemo`** — add 2 fields (net-new relationship, does not exist today):
```ts
customerQuoteLineName?: string;
customerQuoteLineId?: string;
```

## Data-mapping changes in `app/proposals/[id]/lines/[lineid]/page.tsx`

| Line type | Mapping block (fetch function) | Change |
|---|---|---|
| Sales Order Line | `fetchFulfillmentData` — sales order mapping | Added `customerQuoteLineId: so.Customer_Quote_Line__c \|\| so.gtherp__Customer_Quote_Line__c \|\| ''` |
| Shipping Manifest Line | `fetchFulfillmentData` — shipping manifest mapping | Added `boxLength: sm.Case_Length__c \|\| sm.gtherp__Case_Length__c \|\| 0`, `boxWidth: sm.Case_Width__c \|\| sm.gtherp__Case_Width__c \|\| 0`, `boxHeight: sm.Case_Height__c \|\| sm.gtherp__Case_Height__c \|\| 0` |
| Invoice Line | `fetchFulfillmentData` — invoice mapping | Added `totalOrderQty: inv.Total_Order_Qty__c \|\| inv.gtherp__Total_Order_Qty__c \|\| 0` (new field; existing `invoiceQty` mapping unchanged) |
| Credit Memo Line | `fetchReturnsData` — credit memo mapping | Added `customerQuoteLineName: item.Customer_Quote_Line_Name \|\| ''`, `customerQuoteLineId: item.Customer_Quote_Line__c \|\| item.gtherp__Customer_Quote_Line__c \|\| ''` |

### Post-implementation live verification (namespace-prefix hedge)

A live Salesforce `describe` check confirmed `Customer_Quote_Line__c`, `Case_Length__c`, `Case_Width__c`, `Case_Height__c`, and `Total_Order_Qty__c` exist on their respective objects only under the `gtherp__` managed-package namespace (bare names 404 at the SF schema level) — but this app never queries Salesforce directly; every field is delivered through a custom Apex REST layer this repo has no source for. Three pre-existing, already-shipped analogous mappings in this same file (Purchase Order Line, RMA Line, RTV Line — none touched by this feature) already use the identical *unprefixed* convention for the same `Customer_Quote_Line__c` field, which is strong evidence the Apex layer strips the namespace before returning JSON, matching the pattern used by literally every other field in this codebase. Each new field mapping above therefore tries the unprefixed name first (matching codebase convention and the 3 pre-existing sibling usages), then the `gtherp__`-prefixed name as a zero-cost hedge, since these specific fields were newly introduced by this feature and had no prior confirmed usage elsewhere.

## Column specification per sub-tab (target state)

See `spec.md` FR-010 through FR-015 for the authoritative, exact column lists, labels, and API field annotations. This section only notes the **delta** from current state (full detail in `research.md` §3):

- **Customer Quote Lines**: make first column a hyperlink; add "Action" column.
- **Sales Order Lines**: remove Qty Picked, Back Order Qty columns.
- **Shipping Manifest Lines**: reorder Box fields (Box Count → Box Length → Box Width → Box Height → Box Net Weight → Box Gross Weight, positioned after Qty Shipped); remove Tracking Number/Estimated Delivery Date/Tracking Status/Actual Delivery Date; add "Action" column; make first column a hyperlink; change Sales Order Line from hyperlink to plain text.
- **Invoice Lines**: swap Purchase Order Line ↔ Customer Quote Line order; replace "Invoice Qty" column with "Total Order Qty" (new field); add "Action" column; make first column a hyperlink.
- **RMA Lines**: make Customer Quote Line a hyperlink; remove Tracking Number/Estimated Delivery Date/Tracking Status/Actual Delivery Date (keep Goods Receipt Date as last column).
- **Credit Memo Lines**: remove Invoice Line column; add new Customer Quote Line hyperlink column after Sales Order Line.

## Sub-tab ordering

- Fulfillment: swap Shipping Manifest Lines and Invoice Lines button order → Customer Quote Lines, Sales Order Lines, Shipping Manifest Lines, Invoice Lines.
- Returns: no reorder needed (RMA Lines, Credit Memo Lines already first two; RTV/Debit Memo correctly follow and stay hidden for restricted accounts).

## Default sort

Both `LineFulfillmentsTab.tsx` and `LineReturnsTab.tsx`: `useSortableData` init `direction: 'desc'` → `'asc'` (sort key `'name'` unchanged).

## Full file inventory

- `app/proposals/[id]/lines/[lineid]/page.tsx` — type additions (via shared `types.ts`) + 4 data-mapping additions
- `app/proposals/[id]/lines/[lineid]/components/LineFulfillmentsTab.tsx` — sub-tab button reorder, default sort, 4 sub-tab column corrections + resizable-width config updates
- `app/proposals/[id]/lines/[lineid]/components/LineReturnsTab.tsx` — default sort, 2 sub-tab (RMA, Credit Memo) column corrections + resizable-width config updates
- `app/proposals/[id]/types.ts` — additive field changes to `Invoice` and `CreditMemo` interfaces only

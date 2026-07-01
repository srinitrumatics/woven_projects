# Data Model: Proposal Details Page — Table Corrections (CO-113)

**Feature**: `specs/018-proposal-details-table-corrections`
**Date**: 2026-07-01

No new entities, no DB schema changes, no new API routes. All changes are additive field additions to existing TypeScript interfaces in `app/proposals/[id]/types.ts`.

---

## Interface Changes

### `ProposedProduct`

Add 3 fields:

```ts
status?: string;          // item.Status__c
brandName?: string;       // item.gtherp__Brand_Name__c
qtyShipped?: number;      // item.Qty_Shipped__c
```

### `Order`

Add 2 fields:

```ts
proposalRequested?: boolean;   // order.Proposal_Requested__c
transferOrder?: boolean;       // order.Transfer_Order__c
```

### `CustomerQuote`

Add 2 fields:

```ts
proposalId?: string;     // cq.Proposal__c
proposalName?: string;   // cq.Proposal_Name || cq.Proposal__r?.Name
```

### `SalesOrder`

Add 2 fields (fix existing: `salesOrderId` was declared but never populated — now set to `so.Id`):

```ts
proposalId?: string;     // so.Proposal__c
proposalName?: string;   // so.Proposal_Name || so.Proposal__r?.Name
```

### `ShippingManifest`

Add 5 fields:

```ts
proposalId?: string;     // sm.Proposal__c
proposalName?: string;   // sm.Proposal_Name || sm.Proposal__r?.Name
boxLength?: number;      // sm.Case_Length__c
boxWidth?: number;       // sm.Case_Width__c
boxHeight?: number;      // sm.Case_Height__c
```

### `Invoice`

Add 3 fields:

```ts
proposalId?: string;         // inv.Proposal__c
proposalName?: string;       // inv.Proposal_Name || inv.Proposal__r?.Name
purchaseOrderName?: string;  // inv.Purchase_Order_Name || inv.Purchase_Order__r?.Name
```

### `RMA`

Add 2 fields:

```ts
proposalId?: string;     // r.Proposal__c
proposalName?: string;   // r.Proposal_Name || r.Proposal__r?.Name
```

### `CreditMemo`

Add 3 fields (`salesOrderName` was declared but never set in page.tsx mapping — now fixed):

```ts
proposalId?: string;     // c.Proposal__c
proposalName?: string;   // c.Proposal_Name || c.Proposal__r?.Name
```

*(Note: `salesOrderName` is already declared on `CreditMemo`; only the page.tsx mapping line `salesOrderName: c.Sales_Order_Name || ''` is missing and will be added.)*

---

## Column Width Objects in `page.tsx`

Width objects drive `useResizableColumns`. The following objects need updating:

| Object | Add fields | Remove fields |
|--------|-----------|--------------|
| `productWidths` | `status: 120`, `brandName: 170`, `qtyShipped: 130` | `manufacturerDBA: 170` |
| `orderWidths` | `proposalRequested: 160`, `transferOrder: 160` | — |
| `fulfillmentWidths.quotes` | `proposalId: 180`, `proposalName: 180` | — |
| `fulfillmentWidths.sales` | `proposalId: 180`, `proposalName: 180` | `pickDate: 190`, `pickCompleteDate: 190` |
| `fulfillmentWidths.shipping` | `proposalId: 180`, `proposalName: 180`, `boxLength: 130`, `boxWidth: 120`, `boxHeight: 120` | `shippingMethod: 150`, `logisticsContactName: 180` |
| `fulfillmentWidths.invoices` | `purchaseOrderName: 180`, `proposalId: 180`, `proposalName: 180` | `daysOutstanding: 180` |
| `returnsWidths.rma` | `proposalId: 180`, `proposalName: 180` | — |
| `returnsWidths.credit` | `salesOrderName: 180`, `proposalId: 180`, `proposalName: 180` | `creditToAccountName: 180`, `creditToContactName: 180` |

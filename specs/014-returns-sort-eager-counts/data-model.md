# Data Model: Returns Table Sorting, Resizing & Eager Tab Counts

**Date**: 2026-06-26

No new data entities. This feature adds derived state and new component prop types only.

## New Prop Types

### `FulfillmentPreloadedData`

Defined in `app/orders/[id]/components/FulfillmentTab.tsx`

```
FulfillmentPreloadedData
  invoices:       Invoice[]
  manifests:      ShippingManifest[]
  salesOrders:    SalesOrder[]
  proposals:      Proposal[]
  customerQuotes: CustomerQuote[]
```

Used by: `FulfillmentTab` prop `preloadedData?: FulfillmentPreloadedData`

Populated by: eager fetch `useEffect` in `page.tsx`

### `ReturnsPreloadedData`

Defined in `app/orders/[id]/components/ReturnsTab.tsx`

```
ReturnsPreloadedData
  rmaList:     RMA[]
  creditMemos: CreditMemo[]
  debitMemos:  DebitMemo[]
  rtvList:     RTV[]
```

Used by: `ReturnsTab` prop `preloadedData?: ReturnsPreloadedData`

Populated by: eager fetch `useEffect` in `page.tsx`

## New State Variables (page.tsx)

| Variable | Type | Default | Purpose |
|----------|------|---------|---------|
| `fulfillmentData` | `FulfillmentPreloadedData \| null` | `null` | Pre-fetched data passed to FulfillmentTab |
| `returnsData` | `ReturnsPreloadedData \| null` | `null` | Pre-fetched data passed to ReturnsTab |

Note: `fulfillmentCount` and `returnsCount` state already exist from feature 013. Their values will now be set by the eager fetch in `page.tsx` rather than waiting for the tab callback.

## New Sort State (ReturnsTab)

Four independent sort configurations, one per sub-tab:

| Hook call | Array | Default key | Default direction |
|-----------|-------|-------------|-------------------|
| `useSortableData(rmaList, ...)` | `sortedRmaList` | `Name` | `desc` |
| `useSortableData(creditMemos, ...)` | `sortedCreditMemos` | `Name` | `desc` |
| `useSortableData(debitMemos, ...)` | `sortedDebitMemos` | `Name` | `desc` |
| `useSortableData(rtvList, ...)` | `sortedRtvList` | `Name` | `desc` |

## New Column Width State (ReturnsTab)

One `useResizableColumns({})` instance, width keys prefixed by sub-tab:

| Prefix | Sub-tab | Example key |
|--------|---------|-------------|
| `rma` | RMA | `widths.rmaName`, `widths.rmaStatus`, `widths.rmaType`, etc. |
| `cm` | Credit Memos | `widths.cmName`, `widths.cmStatus`, etc. |
| `dm` | Debit Memos | `widths.dmName`, `widths.dmStatus`, etc. |
| `rtv` | RTV | `widths.rtvName`, `widths.rtvStatus`, etc. |

## No Schema Changes

No Drizzle schema changes. No Salesforce field additions. No API route changes.

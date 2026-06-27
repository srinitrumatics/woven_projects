# Data Model: Order Details Tab Counts & Empty Value Dash

**Date**: 2026-06-26

No new data entities are introduced. This feature adds derived display state only.

## Derived State (frontend only)

### `fulfillmentCount` — `number`

- **Location**: `app/orders/[id]/page.tsx` (new `useState(0)`)
- **Source**: Received via `FulfillmentTab`'s `onCountChange` callback after its data fetch resolves
- **Value**: Sum of `proposals.length + customerQuotes.length + salesOrders.length + manifests.length + invoices.length` (role-aware — same visibility rules as the sub-tabs)
- **Default**: `0` (before load or when tab has never been opened)

### `returnsCount` — `number`

- **Location**: `app/orders/[id]/page.tsx` (new `useState(0)`)
- **Source**: Received via `ReturnsTab`'s `onCountChange` callback after its data fetch resolves
- **Value**: `rmaList.length + creditMemos.length + (isCustomerOrNSO ? 0 : debitMemos.length + rtvList.length)`
- **Default**: `0`

### `taxesCount` — derived inline

- **Location**: `app/orders/[id]/page.tsx` (computed inline from existing `orderData` + `loadingOrder`)
- **Formula**: `(!loadingOrder && !!orderData) ? 1 : 0`
- **Not a state variable** — re-computed on each render from existing state

## Component Interface Changes

### `FulfillmentTab`

```typescript
// Added prop
interface FulfillmentTabProps {
  orderId: string;
  accountId: string;
  contactId: string;
  onCountChange?: (count: number) => void;  // NEW
}
```

Call site: after `setProposals` / `setSalesOrders` / etc. arrays are all set, call `onCountChange?.(totalCount)`.

### `ReturnsTab`

```typescript
// Added prop
interface ReturnsTabProps {
  orderId: string;
  accountId: string;
  contactId: string;
  onCountChange?: (count: number) => void;  // NEW
}
```

Call site: after `setRmaList` / `setCreditMemos` / etc. arrays are all set, call `onCountChange?.(totalCount)`.

## No Schema Changes

No Drizzle schema changes. No Salesforce field additions. No API route changes.

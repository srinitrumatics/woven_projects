# Component Interface Contracts

**Feature**: Order Details Tab Counts & Empty Value Dash
**Date**: 2026-06-26

This document records the component prop interface changes introduced by this feature.

---

## FulfillmentTab

**File**: `app/orders/[id]/components/FulfillmentTab.tsx`

### Before

```typescript
interface FulfillmentTabProps {
    orderId: string;
    accountId: string;
    contactId: string;
}
```

### After

```typescript
interface FulfillmentTabProps {
    orderId: string;
    accountId: string;
    contactId: string;
    onCountChange?: (count: number) => void;
}
```

### Behaviour

- `onCountChange` is called once after the data fetch resolves successfully
- Count value = `proposals.length + customerQuotes.length + salesOrders.length + manifests.length + invoices.length`
- If the fetch fails, `onCountChange` is NOT called (count remains at parent's default of 0)
- The prop is optional (`?`) — existing usage without the prop continues to work

---

## ReturnsTab

**File**: `app/orders/[id]/components/ReturnsTab.tsx`

### Before

```typescript
interface ReturnsTabProps {
    orderId: string;
    accountId: string;
    contactId: string;
}
```

### After

```typescript
interface ReturnsTabProps {
    orderId: string;
    accountId: string;
    contactId: string;
    onCountChange?: (count: number) => void;
}
```

### Behaviour

- `onCountChange` is called once after the data fetch resolves successfully
- Count value = `rmaList.length + creditMemos.length + (isCustomerOrNSO ? 0 : debitMemos.length + rtvList.length)`
- Count respects the same role gating as the sub-tab visibility
- The prop is optional (`?`)

---

## page.tsx — New Call Sites

**File**: `app/orders/[id]/page.tsx`

### New state

```typescript
const [fulfillmentCount, setFulfillmentCount] = useState(0);
const [returnsCount, setReturnsCount] = useState(0);
```

### Taxes count (inline, not state)

```typescript
const taxesCount = !loadingOrder && !!orderData ? 1 : 0;
```

### Updated JSX — tab labels

```tsx
// Taxes tab
Taxes {taxesCount > 0 && `(${taxesCount})`}

// Fulfillment tab
<FulfillmentTab
  orderId={id}
  accountId={SF_ACCOUNT_ID}
  contactId={SF_CONTACT_ID}
  onCountChange={setFulfillmentCount}
/>
// Tab button:
Fulfillment {fulfillmentCount > 0 && `(${fulfillmentCount})`}

// Returns tab
<ReturnsTab
  orderId={id}
  accountId={SF_ACCOUNT_ID}
  contactId={SF_CONTACT_ID}
  onCountChange={setReturnsCount}
/>
// Tab button:
Returns {returnsCount > 0 && `(${returnsCount})`}
```

---

## Empty-value dash changes (no interface changes)

These are render-only changes in existing cell JSX. No props or state added.

| File | Cell | Change |
|------|------|--------|
| `MyOrderTable.tsx` | `product.manufacturer` | `{product.manufacturer}` → `{product.manufacturer || "—"}` |
| `MyOrderTable.tsx` | `product.productFamily` | `{product.productFamily}` → `{product.productFamily \|\| "—"}` |
| `ProductCatalog.tsx` | `product.manufacturer` | `{product.manufacturer}` → `{product.manufacturer || "—"}` |
| `ProductCatalog.tsx` | `product.productFamily` | `{product.productFamily}` → `{product.productFamily \|\| "—"}` |
| `ProductCatalog.tsx` | `product.description` | invisible placeholder span → `{product.description ? truncateText(...) : "—"}` |

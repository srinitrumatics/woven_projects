# Component Interface Contracts

**Feature**: Returns Table Sorting, Resizing & Eager Tab Counts
**Date**: 2026-06-26

---

## FulfillmentTab

**File**: `app/orders/[id]/components/FulfillmentTab.tsx`

### Before (post-013)

```typescript
interface FulfillmentTabProps {
    orderId: string;
    accountId: string;
    contactId: string;
    onCountChange?: (count: number) => void;
}
```

### After

```typescript
interface FulfillmentPreloadedData {
    invoices: Invoice[];
    manifests: ShippingManifest[];
    salesOrders: SalesOrder[];
    proposals: Proposal[];
    customerQuotes: CustomerQuote[];
}

interface FulfillmentTabProps {
    orderId: string;
    accountId: string;
    contactId: string;
    onCountChange?: (count: number) => void;
    preloadedData?: FulfillmentPreloadedData | null;
}
```

### Behaviour when `preloadedData` is provided

- State arrays are initialised directly: `useState<Invoice[]>(preloadedData?.invoices || [])`
- The internal `useEffect` fetch is skipped (guard: `if (preloadedData) return;`)
- `loading` is initialised to `false` when `preloadedData` is non-null
- `onCountChange` is still called from the parent (not the component) when preloaded data is used

### Backward compatibility

- `preloadedData` is optional — existing usages without it continue to self-fetch

---

## ReturnsTab

**File**: `app/orders/[id]/components/ReturnsTab.tsx`

### Before (post-013)

```typescript
interface ReturnsTabProps {
    orderId: string;
    accountId: string;
    contactId: string;
    onCountChange?: (count: number) => void;
}
```

### After

```typescript
interface ReturnsPreloadedData {
    rmaList: RMA[];
    creditMemos: CreditMemo[];
    debitMemos: DebitMemo[];
    rtvList: RTV[];
}

interface ReturnsTabProps {
    orderId: string;
    accountId: string;
    contactId: string;
    onCountChange?: (count: number) => void;
    preloadedData?: ReturnsPreloadedData | null;
}
```

### New imports added

```typescript
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";
import { useResizableColumns } from "../../../../hooks/useResizableColumns";
```

### Sort hooks added

```typescript
const { items: sortedRmaList, requestSort: requestSortRma, sortConfig: sortConfigRma } =
    useSortableData(rmaList, { key: 'Name', direction: 'desc' });
const { items: sortedCreditMemos, requestSort: requestSortCm, sortConfig: sortConfigCm } =
    useSortableData(creditMemos, { key: 'Name', direction: 'desc' });
const { items: sortedDebitMemos, requestSort: requestSortDm, sortConfig: sortConfigDm } =
    useSortableData(debitMemos, { key: 'Name', direction: 'desc' });
const { items: sortedRtvList, requestSort: requestSortRtv, sortConfig: sortConfigRtv } =
    useSortableData(rtvList, { key: 'Name', direction: 'desc' });
```

### Resize hook added

```typescript
const { widths, handleResize } = useResizableColumns({});
// Keys: rmaName, rmaStatus, rmaType, rmaIssuedDate, rmaReturnBy, rmaShippingMethod,
//        rmaTracking, rmaCustomerOrder, rmaSalesOrder, rmaTotal,
//       cmName, cmStatus, cmIssuedDate, cmExpiryDate, cmCreditTo, cmInvoice,
//        cmCustomerOrder, cmCreditAmount, cmAvailBalance,
//       dmName, dmStatus, dmIssuedDate, dmSettledDate, dmDebitTo, dmCustomerOrder,
//        dmPurchaseOrder, dmSupplierBill, dmDebitAmount, dmAvailBalance,
//       rtvName, rtvStatus, rtvType, rtvIssuedDate, rtvReturnBy, rtvSupplier,
//        rtvSupplierRma, rtvCustomerOrder, rtvPurchaseOrder, rtvTotal
```

---

## page.tsx — New State and Fetch Logic

**File**: `app/orders/[id]/page.tsx`

### New state variables

```typescript
const [fulfillmentData, setFulfillmentData] = useState<FulfillmentPreloadedData | null>(null);
const [returnsData, setReturnsData] = useState<ReturnsPreloadedData | null>(null);
```

### New eager fetch useEffects

Two new `useEffect`s, triggered by `[id, SF_ACCOUNT_ID, SF_CONTACT_ID]`, running in parallel (separate effects):

**Fulfillment eager fetch:**
```typescript
useEffect(() => {
    if (!id || id === "new" || !SF_ACCOUNT_ID || !SF_CONTACT_ID) return;
    async function fetchFulfillmentEager() {
        try {
            const res = await fetch(`/api/salesforce/orders?accountId=${...}&contactId=${...}&orderId=${...}&action=fulfillment`);
            if (!res.ok) return;
            const data = await res.json();
            const parsed: FulfillmentPreloadedData = {
                invoices: data.Invoice__c || [],
                manifests: data.Shipping_Manifest__c || [],
                salesOrders: data.Sales_Order__c || [],
                proposals: data.Proposal__c || [],
                customerQuotes: data.Customer_Quote__c || [],
            };
            setFulfillmentData(parsed);
            setFulfillmentCount(parsed.invoices.length + parsed.manifests.length +
                               parsed.salesOrders.length + parsed.proposals.length +
                               parsed.customerQuotes.length);
        } catch (e) { /* silent — count stays 0 */ }
    }
    fetchFulfillmentEager();
}, [id, SF_ACCOUNT_ID, SF_CONTACT_ID]);
```

**Returns eager fetch:**
```typescript
useEffect(() => {
    if (!id || id === "new" || !SF_ACCOUNT_ID || !SF_CONTACT_ID) return;
    async function fetchReturnsEager() {
        try {
            const res = await fetch(`/api/salesforce/orders?accountId=${...}&contactId=${...}&orderId=${...}&action=returns`);
            if (!res.ok) return;
            const data = await res.json();
            const parsed: ReturnsPreloadedData = {
                rmaList: data.RMA__c || [],
                creditMemos: data.Credit_Memo__c || [],
                debitMemos: data.Debit_Memo__c || [],
                rtvList: data.RTV__c || [],
            };
            setReturnsData(parsed);
            // role-aware count computed in page using isCustomerOrNSO from session
            const isCustomerOrNSO = /* same logic as ReturnsTab */;
            setReturnsCount(parsed.rmaList.length + parsed.creditMemos.length +
                           (isCustomerOrNSO ? 0 : parsed.debitMemos.length + parsed.rtvList.length));
        } catch (e) { /* silent — count stays 0 */ }
    }
    fetchReturnsEager();
}, [id, SF_ACCOUNT_ID, SF_CONTACT_ID]);
```

### Updated JSX — pass preloaded data to tab components

```tsx
<FulfillmentTab
    orderId={id}
    accountId={SF_ACCOUNT_ID}
    contactId={SF_CONTACT_ID}
    onCountChange={setFulfillmentCount}
    preloadedData={fulfillmentData}
/>

<ReturnsTab
    orderId={id}
    accountId={SF_ACCOUNT_ID}
    contactId={SF_CONTACT_ID}
    onCountChange={setReturnsCount}
    preloadedData={returnsData}
/>
```

Note: `onCountChange` is kept on both components but will only be called by the tab's internal fetch path (when `preloadedData` is null). The parent's eager fetch sets the count directly.

# Data Model: Reposition Line Status Indicator

No database, API, or data-fetching changes. This feature only moves already-rendered presentational JSX within two existing pages — every field below is unchanged in name, type, and value; only its position in the DOM/JSX changes.

## Entities

### Invoice Line (`app/invoices/[id]/lines/[lineid]/page.tsx`)

| Field | Type | Change |
|---|---|---|
| `product.status` | `InvoiceStatus` (existing local type) | None — same value, same `StatusBadge` component, same color mapping. Only the JSX location of `{product.status && <StatusBadge status={product.status} />}` moves. |

### Shipment Line (`app/shipments/[id]/lines/[lineid]/page.tsx`)

| Field | Type | Change |
|---|---|---|
| `product.Status__c` | `string \| undefined` | None — same `|| "Draft"` fallback, same fixed-color `<div>` styling. Only the JSX location of the status `<div>` moves. |

## Layout Structure (before → after)

Both pages share the same before/after shape:

**Before**: 
```
<div flex justify-between>
  <div>breadcrumb + title</div>
  <div flex-col items-end>
    <button>Back to X</button>
    <StatusElement />   <!-- under the button -->
  </div>
</div>
<div flex items-center>
  <span>Line X of Y</span>
</div>
```

**After**:
```
<div flex justify-between>
  <div>breadcrumb + title</div>
  <div flex-col items-end>
    <button>Back to X</button>   <!-- StatusElement removed from here -->
  </div>
</div>
<div flex items-center gap-2>
  <span>Line X of Y</span>
  <StatusElement />   <!-- now here -->
</div>
```

No new entities, no new component, no new state. `StatusElement` refers to `<StatusBadge status={product.status} />` on Invoices and the fixed-color `<div>{product.Status__c || "Draft"}</div>` on Shipments — both are moved verbatim.

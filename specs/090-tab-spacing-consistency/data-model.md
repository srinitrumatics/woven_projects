# Data Model: Tab & Pagination Spacing Consistency

No database, API, or Salesforce data changes. No new component, prop, or type is introduced. The only shape-level change is `components/ui/SubTabs.tsx`'s `className` rendering behavior — its `SubTabsProps` field set (`tabs`, `activeKey`, `onChange`, `className?`) is unchanged; only how `className` combines with the component's base styling changes.

## `SubTabs` className semantics change

```ts
// Before (override — any caller className fully replaces the default)
className={className ?? "flex gap-6 mb-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto"}

// After (append — matches Tabs.tsx's existing pattern; base always applies)
className={`flex gap-6 mb-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto ${className ?? ""}`}
```

## Per-call-site `className` normalization

| # | File:Line | Before | After |
|---|---|---|---|
| 1-5 | `InvoicePayments.tsx:190`, `FulfillmentTab.tsx:292` (orders), `ReturnsTab.tsx:248` (orders), `FulfillmentsTab.tsx:76` (proposals), `PurchasesTab.tsx:67` (proposals) | *(no className)* | *(unchanged — no className)* |
| 6 | `app/proposals/[id]/components/ReturnsTab.tsx:81` | `"flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto mb-6"` | *(remove className prop entirely — base now provides identical layout plus the standard `mb-4`)* |
| 7 | `app/proposals/[id]/lines/[lineid]/components/LineFulfillmentsTab.tsx:155` | `"mb-6"` | *(remove className prop entirely — restores `flex`/`gap-6`/`border-b`/`overflow-x-auto` that this call site currently lacks)* |
| 8 | `app/proposals/[id]/lines/[lineid]/components/LinePurchasesTab.tsx:108` | `"flex gap-8 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto px-6 pt-6"` | `"px-6 pt-6"` *(structural inset only, appended to base)* |
| 9 | `app/proposals/[id]/lines/[lineid]/components/LineReturnsTab.tsx:169` | `"flex gap-8 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto"` | *(remove className prop entirely)* |
| 10 | `app/purchase-orders/[id]/components/POReturnsTab.tsx:28` | `"flex gap-4 border-b border-gray-100 dark:border-gray-700 overflow-x-auto pb-2"` | *(remove className prop entirely)* |
| 11 | `app/purchase-orders/[id]/lines/[lineid]/components/POReturnsTab.tsx:26` | `"flex gap-4 border-b border-gray-100 dark:border-gray-700 overflow-x-auto pb-2"` | *(remove className prop entirely)* |
| 12 | `app/quotes/[id]/components/QuoteFulfillmentTab.tsx:198` | `"flex gap-8 mb-0 border-b border-gray-200 dark:border-gray-700 overflow-x-auto px-4"` | *(remove className prop entirely)* |
| 13 | `app/quotes/[id]/components/QuotePurchasesTab.tsx:160` | `"flex gap-8 mb-0 border-b border-gray-200 dark:border-gray-700 overflow-x-auto px-4"` | *(remove className prop entirely)* |
| 14 | `app/quotes/[id]/components/QuoteReturnsTab.tsx:204` | `"flex gap-8 mb-0 border-b border-gray-200 dark:border-gray-700 overflow-x-auto px-4"` | *(remove className prop entirely)* |
| 15 | `app/quotes/[id]/lines/[lineid]/components/QuoteLineFulfillmentsTab.tsx:279` | `"flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto mb-3"` | *(remove className prop entirely)* |
| 16 | `app/quotes/[id]/lines/[lineid]/components/QuoteLinePurchasesTab.tsx:201` | `"flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto mb-6"` | *(remove className prop entirely)* |
| 17 | `app/quotes/[id]/lines/[lineid]/components/QuoteLineReturnsTab.tsx:317` | `"flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto mb-3"` | *(remove className prop entirely)* |
| 18 | `app/supplier-bills/[id]/components/SupplierBillPaymentsTab.tsx:81` | `"flex gap-4 border-b border-gray-100 dark:border-gray-700 overflow-x-auto pb-2"` | *(remove className prop entirely)* |

Every normalized call site (#6–7, #9–18) ends up passing no `className` prop at all except #8 (`LinePurchasesTab.tsx`), which keeps its genuinely-needed `px-6 pt-6` horizontal/top inset appended to the new shared base.

## Detail-page tab-content wrapper fix

| File:Line | Before | After |
|---|---|---|
| `app/proposals/[id]/page.tsx:1438` | `className="px-4"` | `className="p-4"` |
| `app/quotes/[id]/page.tsx:733` | `className="px-4"` | `className="p-4"` |

## Shipments list pagination wrapper fix

| File:Lines | Before | After |
|---|---|---|
| `app/shipments/page.tsx:634-643` | `<div className="p-4 bg-gray-50/50 dark:bg-gray-800/50"><Pagination ... /></div>` | `<Pagination ... />` (wrapper `<div>` removed, matching every other list page) |

## Explicitly untouched (confirmed via research.md, not to be modified)

- `components/ui/DataTable.tsx` and `components/ui/Pagination.tsx` — read in full, no internal defect found.
- `components/ui/Tabs.tsx` — already append-style; used as the reference pattern for the `SubTabs.tsx` fix, not itself modified.
- The 5 `SubTabs` call sites already passing no `className` (rows 1-5 above) — already correctly spaced today and remain visually unchanged after the fix.
- Purchase Order, Invoice, Supplier Bill, and Order Detail pages' own tab-content wrappers — already have adequate top padding, confirmed during investigation, not touched.
- The redundant nested rounded/shadow wrapper on Shipments/Invoices/Orders list pages around their tables — confirmed inert, out of scope per spec Assumptions.

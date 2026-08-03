# Data Model: Shared Underline SubTabs Component

No database, API, or Salesforce data changes. This is a new frontend component (zero new dependencies) plus 18 sub-tab-bar migrations and 3 pill-tab-duplicate fixes.

## `components/ui/SubTabs.tsx` — proposed API

```ts
import type { TabItem } from "./Tabs"; // reused, not redeclared

interface SubTabsProps {
  tabs: TabItem[];             // { key, label, count?, disabled? } — identical shape to Tabs.tsx
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;          // escape hatch for the wrapper div, e.g. callers needing extra margin
}
```

- Deliberately mirrors `Tabs.tsx`'s exact prop shape (`tabs`/`activeKey`/`onChange`/`className`) and reuses its exported `TabItem` type rather than redeclaring an equivalent one — this is the concrete form of FR-002 ("visually match the existing shared pill component's API shape").
- Renders each tab as a `<button>` with `pb-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px` plus the ternary: active → `border-primary text-primary`; inactive → one single, canonical variant (settled in this migration, replacing the 5 drifting ones found in research.md §1) that includes full `dark:` support for every caller, closing the 3-file dark-mode gap.
- `count` renders exactly as `Tabs.tsx` already does — `` `${label}${count !== undefined && count > 0 ? ` (${count})` : ''}` `` — so callers stop baking the count suffix into their own JSX children (research.md §2) and instead pass it as data.
- Wrapper `<div>` uses `flex gap-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto` by default (the most common existing wrapper pattern among the 18), with `className` available to override for the 2 files whose gap/border differs slightly (`POReturnsTab.tsx` ×2, `SupplierBillPaymentsTab.tsx` use `gap-4 border-gray-100`).

## Per-file migration mapping (18 sub-tab bars)

| File | Current inactive-state gap | New usage |
|---|---|---|
| `orders/[id]/components/FulfillmentTab.tsx` | none (already has full dark: support) | Collect 5 hardcoded buttons into a `tabs` array, render `<SubTabs tabs={...} activeKey={activeSubTab} onChange={setActiveSubTab} />` |
| `orders/[id]/components/ReturnsTab.tsx` | none | Same restructuring |
| `proposals/[id]/components/FulfillmentsTab.tsx` | none | Same restructuring |
| `proposals/[id]/components/PurchasesTab.tsx` | none | Same restructuring |
| `proposals/[id]/components/ReturnsTab.tsx` | none | Same restructuring |
| `proposals/[id]/lines/[lineid]/components/LineFulfillmentsTab.tsx` | none | Same restructuring |
| `proposals/[id]/lines/[lineid]/components/LinePurchasesTab.tsx` | none | Same restructuring |
| `proposals/[id]/lines/[lineid]/components/LineReturnsTab.tsx` | none | Same restructuring |
| `purchase-orders/[id]/components/POReturnsTab.tsx` | **zero dark: classes today** | Collect 2 buttons into a `tabs` array; migration adds dark-mode support as a side effect |
| `purchase-orders/[id]/lines/[lineid]/components/POReturnsTab.tsx` | **zero dark: classes today** | Same, same fix |
| `quotes/[id]/components/QuoteFulfillmentTab.tsx` | none | Collect buttons into a `tabs` array |
| `quotes/[id]/components/QuotePurchasesTab.tsx` | none | Same |
| `quotes/[id]/components/QuoteReturnsTab.tsx` | none | Same |
| `quotes/[id]/lines/[lineid]/components/QuoteLineFulfillmentsTab.tsx` | none | Already `.map()`s a `tabs`-shaped array — swap the inline `<button>` render for `<SubTabs tabs={tabs} .../>` directly |
| `quotes/[id]/lines/[lineid]/components/QuoteLinePurchasesTab.tsx` | none | Same, direct swap |
| `quotes/[id]/lines/[lineid]/components/QuoteLineReturnsTab.tsx` | **`dark:hover:white` typo** | Same, direct swap; migration corrects the typo as a side effect |
| `supplier-bills/[id]/components/SupplierBillPaymentsTab.tsx` | **zero dark: classes today** | Collect 2 buttons into a `tabs` array; migration adds dark-mode support as a side effect |
| `invoices/[id]/components/InvoicePayments.tsx` | none | Collect buttons into a `tabs` array |

## Pill-tab duplicate fixes (3 files — no new component, just adopt the existing `Tabs.tsx`)

| File | Current drift | Fix |
|---|---|---|
| `app/orders/[id]/OrderClientPage.tsx` | `border-gray-300` (should be `border-gray-200`) across 6 hardcoded buttons | Collect the 6 buttons (Add Products/My Order/Taxes/Fulfillment/Returns/Files, each with its own count) into a `tabs` array; render `<Tabs tabs={...} activeKey={viewMode} onChange={setViewMode} />` |
| `app/quotes/[id]/lines/[lineid]/page.tsx` | `border-gray-300` + stray double-space in className | Already computes a filtered `tabs` array (Customer/NSO role-filtering logic preserved unchanged) — swap the inline `.map()` render for `<Tabs tabs={filteredTabs} activeKey={activeTab} onChange={setActiveTab} />` |
| `app/purchase-orders/[id]/lines/[lineid]/page.tsx` | inactive state missing `border` class entirely | Collect the "Related Items" buttons into a `tabs` array; render `<Tabs tabs={...} activeKey={...} onChange={...} />` |

## Removed per-file (superseded by the shared components)

- Every migrated sub-tab bar's own inline `<button>` markup with its own drifting active/inactive className ternary — replaced by `<SubTabs>`.
- Every migrated sub-tab bar's own inline count-suffix JSX expression (e.g. `` {x.length > 0 && `(${x.length})`} `` ) — replaced by a `count` field on that tab's `TabItem`.
- The 3 pill-tab sites' own hand-rolled duplicate of `Tabs.tsx`'s markup — replaced by a direct `import Tabs from "@/components/ui/Tabs"`.
- The confirmed invalid `dark:hover:white` class in `QuoteLineReturnsTab.tsx`.
- The stray double-space artifact in `app/quotes/[id]/lines/[lineid]/page.tsx`'s className string.

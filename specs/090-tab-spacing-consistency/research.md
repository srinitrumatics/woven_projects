# Phase 0 Research: Tab & Pagination Spacing Consistency

No `[NEEDS CLARIFICATION]` markers remain. This phase documents the direct code investigation — an initial Explore sub-agent pass, followed by a full manual re-verification of every `SubTabs` call site's exact `className` value before committing to the plan — since the original screenshot-driven complaint only pointed at symptoms, not root causes.

## 0. Screenshot 1 root cause — Proposal/Quote Detail tab-content wrapper

`app/proposals/[id]/page.tsx:1438` and `app/quotes/[id]/page.tsx:733` both render their active tab's content inside `<div className="px-4">` — horizontal padding only, zero top padding. Every other detail page with the same tab-bar-then-content structure (`app/purchase-orders/[id]/page.tsx`, `app/invoices/[id]/page.tsx`, `app/supplier-bills/[id]/page.tsx`) uses `p-4` (or `p-3` on Orders), giving top padding these two pages lack. This is the exact "tabs flush against content" defect in the screenshot.

## 1. Screenshot 1's deeper cause — `SubTabs.tsx`'s override-style `className`

`components/ui/SubTabs.tsx:14` renders `className={className ?? "flex gap-6 mb-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto"}` — any caller-supplied `className` **fully replaces** the default, rather than appending to it (contrast `components/ui/Tabs.tsx:19`, the sibling pill-tabs component, which always appends: `` `flex flex-nowrap gap-2 overflow-x-auto w-full ${className}` ``). This asymmetry is a known, deliberate choice from spec 088 (made to solve a different bug — conflicting Tailwind utility stacking) but its side effect is that every call site must re-specify the *entire* base styling, and 13 of the 18 current call sites have each independently arrived at a different value.

## 2. Full direct re-verification of all 18 `SubTabs` call sites

Re-grepped and read every call site directly (not trusted from an earlier pass) — one call site was missed in an earlier count (`LineReturnsTab.tsx`, proposals lines), bringing the true total to 18, not 17.

| # | File:Line | `className` prop | Effective vs. default |
|---|---|---|---|
| 1 | `app/invoices/[id]/components/InvoicePayments.tsx:190` | *(none)* | Uses default (`mb-4`, `gap-6`) |
| 2 | `app/orders/[id]/components/FulfillmentTab.tsx:292` | *(none)* | Uses default |
| 3 | `app/orders/[id]/components/ReturnsTab.tsx:248` | *(none)* | Uses default |
| 4 | `app/proposals/[id]/components/FulfillmentsTab.tsx:76` | *(none)* | Uses default |
| 5 | `app/proposals/[id]/components/PurchasesTab.tsx:67` | *(none)* | Uses default |
| 6 | `app/proposals/[id]/components/ReturnsTab.tsx:81` | `"flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto mb-6"` | `mb-6` (not `mb-4`); **also drops `gap-6` entirely** — tab buttons currently render with zero horizontal gap between them |
| 7 | `app/proposals/[id]/lines/[lineid]/components/LineFulfillmentsTab.tsx:155` | `"mb-6"` | **Drops everything but the margin** — no `flex`, `gap`, `border-b`, or `overflow-x-auto` at all. This is a more serious layout bug than spacing alone: the sub-tab buttons here render without their underline-tab container styling. |
| 8 | `app/proposals/[id]/lines/[lineid]/components/LinePurchasesTab.tsx:108` | `"flex gap-8 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto px-6 pt-6"` | `gap-8`, `mb-6`, plus genuinely-needed `px-6 pt-6` structural inset (this panel has no other padding source) |
| 9 | `app/proposals/[id]/lines/[lineid]/components/LineReturnsTab.tsx:169` | `"flex gap-8 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto"` | `gap-8`, `mb-6` |
| 10 | `app/purchase-orders/[id]/components/POReturnsTab.tsx:28` | `"flex gap-4 border-b border-gray-100 dark:border-gray-700 overflow-x-auto pb-2"` | `gap-4`, lighter border (`gray-100` not `gray-200`), `pb-2` instead of margin, **no `mb-*` at all** — zero space below the row |
| 11 | `app/purchase-orders/[id]/lines/[lineid]/components/POReturnsTab.tsx:26` | `"flex gap-4 border-b border-gray-100 dark:border-gray-700 overflow-x-auto pb-2"` | Same as #10 |
| 12 | `app/quotes/[id]/components/QuoteFulfillmentTab.tsx:198` | `"flex gap-8 mb-0 border-b border-gray-200 dark:border-gray-700 overflow-x-auto px-4"` | `gap-8`, `mb-0` (explicit zero), non-standard `px-4` |
| 13 | `app/quotes/[id]/components/QuotePurchasesTab.tsx:160` | `"flex gap-8 mb-0 border-b border-gray-200 dark:border-gray-700 overflow-x-auto px-4"` | Same as #12 |
| 14 | `app/quotes/[id]/components/QuoteReturnsTab.tsx:204` | `"flex gap-8 mb-0 border-b border-gray-200 dark:border-gray-700 overflow-x-auto px-4"` | Same as #12 |
| 15 | `app/quotes/[id]/lines/[lineid]/components/QuoteLineFulfillmentsTab.tsx:279` | `"flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto mb-3"` | `gap-2`, `mb-3` |
| 16 | `app/quotes/[id]/lines/[lineid]/components/QuoteLinePurchasesTab.tsx:201` | `"flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto mb-6"` | `gap-2`, `mb-6` |
| 17 | `app/quotes/[id]/lines/[lineid]/components/QuoteLineReturnsTab.tsx:317` | `"flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto mb-3"` | `gap-2`, `mb-3` |
| 18 | `app/supplier-bills/[id]/components/SupplierBillPaymentsTab.tsx:81` | `"flex gap-4 border-b border-gray-100 dark:border-gray-700 overflow-x-auto pb-2"` | Same as #10 |

Observed bottom-spacing values across the 13 overridden call sites: `mb-6` (×4), `mb-0` (×3), `mb-3` (×2), no margin at all (×4, relying only on `pb-2`, which sits *inside* the border rather than below it). Observed `gap` values: `gap-6` (default, ×5 unmodified), `gap-8` (×3), `gap-4` (×3), `gap-2` (×3), no gap (×1, #6). This is the full scope of "0 to noticeably large" divergence referenced in the spec.

## 3. Chosen fix approach — append, not re-litigate every value

`SubTabs.tsx` is changed to always apply its base classes (`flex gap-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto`) plus a single fixed bottom-margin default (`mb-4`, matching `Tabs.tsx`'s sibling detail pages' rhythm and the 5 call sites already relying on today's default), and appends any caller `className` on top — mirroring `Tabs.tsx`'s existing pattern exactly. Each of the 13 non-default call sites then has its `className` reduced to *only* the extra, non-standard pieces it genuinely still needs (e.g., `LinePurchasesTab.tsx` keeps `px-6 pt-6`; the 3 Quote call sites' non-standard `px-4` is dropped since no structural reason for it was found — it was introduced as part of the same ad-hoc override, not a deliberate inset). This fixes all 13 divergent call sites in one component change plus 13 small className edits, rather than guessing at "the right value" 13 separate times.

## 4. Screenshot 2 root cause — Shipments list page's shaded pagination wrapper

`app/shipments/page.tsx:634` wraps its `<Pagination>` in `<div className="p-4 bg-gray-50/50 dark:bg-gray-800/50">` (lines 634-643) — a light gray background band plus extra padding. Confirmed via direct comparison that no other list page does this: `app/proposals/page.tsx:669`, `app/purchase-orders/page.tsx:407`, `app/supplier-bills/page.tsx:394`, `app/quotes/page.tsx:628`, and `app/orders/page.tsx:1025` all render `<Pagination>` directly with no wrapper; `app/inventory/page.tsx:694` uses a plain unshaded `mt-4 pt-4 border-t` divider. `components/ui/Pagination.tsx` itself was read in full and has no internal defect — this is purely a page-level wrapper unique to Shipments.

## 5. Confirmed out of scope

`components/ui/DataTable.tsx` and `components/ui/Pagination.tsx` were both read in full; neither has an internal styling defect. The redundant nested rounded/shadow `<div>` wrapper visible identically around the table on Shipments, Invoices, and Orders list pages is inert (no visible effect) and is excluded per the spec's Assumptions section.

# Phase 0 Research: Shared Underline SubTabs Component

No `[NEEDS CLARIFICATION]` markers remain. This phase documents the direct code investigation (a dedicated Explore sub-agent pass plus follow-up direct verification) that grounded the plan, including the correction to the original audit's own scope claim.

## 0. The audit's "six modules" grep claim was wrong — real search found 18 instances

**Investigation**: The original audit's evidence for its underline-sub-tab finding was a grep for the literal substring `border-b-2 border-primary`. Re-running that exact grep against the current codebase returns 24 files — but inspecting them shows every single hit is `animate-spin rounded-full ... border-b-2 border-primary`, a **loading spinner**, not a tab bar. Real hand-rolled underline sub-tab bars structure their className as a template-literal ternary — `border-b-2` sits in the static prefix, `border-primary` sits inside the *active* branch on a separate line (e.g. `` `...border-b-2 ${active ? "border-primary text-primary" : "border-transparent ..."}` ``) — so the two substrings are never adjacent, and the naive grep never matches them.

**Corrected method**: searching for co-occurrence of `border-transparent` and `border-b-2` within the same file found the real pattern: **18 genuine hand-rolled underline sub-tab bars**, three times the audit's "six modules" estimate.

## 1. The 18 in-scope sub-tab bars — current state and drift

| File | Active className | Inactive className | Dark mode? |
|---|---|---|---|
| `orders/[id]/components/FulfillmentTab.tsx` | `border-primary text-primary` | `border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200` | Yes |
| `orders/[id]/components/ReturnsTab.tsx` | same | same | Yes |
| `proposals/[id]/components/FulfillmentsTab.tsx` | same | `...hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300` | Yes |
| `proposals/[id]/components/PurchasesTab.tsx` | same | same as above | Yes |
| `proposals/[id]/components/ReturnsTab.tsx` | same | same as above | Yes |
| `proposals/[id]/lines/[lineid]/components/LineFulfillmentsTab.tsx` | same | `...hover:text-gray-700 dark:hover:text-gray-200` (no `hover:border-gray-300`) | Yes |
| `proposals/[id]/lines/[lineid]/components/LinePurchasesTab.tsx` | same | same | Yes |
| `proposals/[id]/lines/[lineid]/components/LineReturnsTab.tsx` | same | same | Yes |
| `purchase-orders/[id]/components/POReturnsTab.tsx` | `text-primary border-primary` | `text-gray-400 border-transparent hover:text-gray-600` | **No — zero dark: classes** |
| `purchase-orders/[id]/lines/[lineid]/components/POReturnsTab.tsx` | same | same | **No — zero dark: classes** |
| `quotes/[id]/components/QuoteFulfillmentTab.tsx` | `border-primary text-primary` | `...hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300` | Yes |
| `quotes/[id]/components/QuotePurchasesTab.tsx` | same | same | Yes |
| `quotes/[id]/components/QuoteReturnsTab.tsx` | same | same | Yes |
| `quotes/[id]/lines/[lineid]/components/QuoteLineFulfillmentsTab.tsx` | same | `...dark:text-gray-400 hover:text-gray-900 dark:hover:text-white` | Yes |
| `quotes/[id]/lines/[lineid]/components/QuoteLinePurchasesTab.tsx` | same | same | Yes |
| `quotes/[id]/lines/[lineid]/components/QuoteLineReturnsTab.tsx` | same | `...dark:hover:white` ← **invalid class, confirmed at line 319** | Broken (typo) |
| `supplier-bills/[id]/components/SupplierBillPaymentsTab.tsx` | `text-primary border-primary` | `text-gray-400 border-transparent hover:text-gray-600` | **No — zero dark: classes** |
| `invoices/[id]/components/InvoicePayments.tsx` | `border-primary text-primary` | `border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300` | Yes |

**At least 5 distinct inactive-state variants** are in use, differing in: dark: presence/absence (3 files have none), `hover:border-gray-300` presence/absence, gray shade 500 vs 400, hover-target shade 700 vs 900. Active-state className is consistent (`border-primary text-primary` / equivalent) across all 18 — not part of the drift, confirmed via direct inspection, so the shared component's active state needs no variant handling.

**Two confirmed real bugs, both fixed by migration**:
1. `QuoteLineReturnsTab.tsx:319` — `dark:hover:white` (missing `text-` prefix) silently no-ops; sibling files `QuoteLineFulfillmentsTab.tsx`/`QuoteLinePurchasesTab.tsx` correctly use `dark:hover:text-white`, confirming this is an isolated typo, not a systemic pattern to preserve.
2. `POReturnsTab.tsx` (both order-level and line-level copies) and `SupplierBillPaymentsTab.tsx` have **zero** dark-mode classes on this control, unlike every other sibling file in the same module family — a real, visible gap in dark mode today.

**Not confirmed** (audit's own suspicion, checked and ruled out): a `border-gray-300` vs `border-gray-200` clash among the underline sub-tabs themselves. That drift is real, but it lives in the 3 **pill-tab duplicate sites** (§3 below), not the underline sub-tabs.

## 2. `components/ui/Tabs.tsx` — existing shape to mirror

**Investigation**: `Tabs.tsx` exports `TabItem { key, label, count?, disabled? }` and `TabsProps { tabs, activeKey, onChange, className? }`. Its render logic already handles the `count` suffix (`` `${label}${count > 0 ? ` (${count})` : ''}` ``) and a `disabled` state. It is correctly imported by 8 existing components (`InvoiceTabs`, `ProductTabs`, `ProposalTabs`, `POTabs`, `QuoteTabs`, `ShipmentTabs`, `BottomTabs`, `SupplierBillTabs`).

**Decision**: `SubTabs.tsx` reuses the exact same `TabItem`/`tabs`/`activeKey`/`onChange`/`className` shape (importing `TabItem` from `Tabs.tsx` rather than redeclaring it), rendering the underline visual style instead of the pill style. This is a new, separate component — not a `variant` prop added to `Tabs.tsx` — since the two are intentionally different navigation tiers used side-by-side on the same page in several modules (e.g. Quote Detail has pill top-tabs and underline Fulfillment/Purchases/Returns sub-tabs simultaneously); a single component with a variant flag would blur that distinction rather than clarify it.

**Migration mechanics vary by file**: some of the 18 already compute their buttons from a local array before rendering (`QuoteLineFulfillmentsTab.tsx`/`QuoteLinePurchasesTab.tsx`/`QuoteLineReturnsTab.tsx` already `.map()` over a `tabs` array with `{key, label, count}` shape — these migrate almost directly, just swapping the inline `<button>` render for `<SubTabs tabs={...} .../>`). Others hardcode each `<button>` individually with an inline conditional count suffix baked into JSX children (e.g. `FulfillmentTab.tsx`'s 5 separate buttons like `Proposals {proposals.length > 0 && `(${proposals.length})`}`) — these require first collecting the buttons into a `tabs` array (`{key: "proposals", label: "Proposals", count: proposals.length}`, etc.) before handing it to `SubTabs`. This is a mechanical restructuring of markup, not a behavior change — the rendered output (label + optional count, active/inactive styling, click-to-switch) is identical either way.

## 3. The 3 pill-tab duplicate sites — confirmed exact drift

**Investigation**: all 3 hand-roll the identical pill pattern (`bg-primary text-white` active / `bg-primary-light dark:bg-gray-700 ... border ... hover:bg-gray-100 dark:hover:bg-gray-600` inactive) as `Tabs.tsx`, but each has drifted from it in a different concrete way, confirmed by direct file inspection:

1. **`app/orders/[id]/OrderClientPage.tsx`** (view-mode tabs, lines ~1791-1846) — 6 hardcoded buttons (Add Products / My Order / Taxes / Fulfillment / Returns / Files, each with its own conditional count suffix). Inactive state uses `border-gray-300 dark:border-gray-600` where `Tabs.tsx` uses `border-gray-200 dark:border-gray-600` — confirmed at lines 1796, 1805, 1814, 1823, 1832, 1841 (one per button).
2. **`app/quotes/[id]/lines/[lineid]/page.tsx`** (top tab row, lines ~660-685) — already computes a filtered `tabs` array (with existing Customer/NSO role-based filtering logic, preserved unchanged) and `.map()`s over it. Confirmed: line 675 has a stray double space (`transition-colors  flex-shrink-0`), and line 677 has the same `border-gray-300` drift as above (`Tabs.tsx` uses `border-gray-200`).
3. **`app/purchase-orders/[id]/lines/[lineid]/page.tsx`** ("Related Items" tabs, lines ~648-665) — confirmed inactive state is `bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600` with **no `border` class at all** (line 662) — missing the border entirely, not just a wrong shade of it.

**Decision**: all 3 are replaced with a direct `import Tabs from "@/components/ui/Tabs"` call, passing the same tab data each already computes (a `tabs` array with `{key/label/count}`) straight through as `TabItem[]`. No new component work — `Tabs.tsx` already exists and is already correctly used by 8 other components; this is purely deleting 3 duplicates in favor of the real thing, per FR-006.

## 4. Explicitly out-of-scope files — confirmed not tab bars

**Investigation**: the `quotes/[id]/lines/[lineid]/components/` directory contains 14 files total. Besides the 3 real sub-tab-bar files migrated in this feature (`QuoteLineFulfillmentsTab.tsx`, `QuoteLinePurchasesTab.tsx`, `QuoteLineReturnsTab.tsx`), the remaining 11 (`QuoteLine*LinesSubTab.tsx` ×9, `QuoteLineFilesTab.tsx`, `QuoteLineTaxesTab.tsx`) are content panels only — their only `border-b` occurrences are unrelated `<Tr>` table-row borders (`border-b border-gray-200 dark:border-gray-700`), not a nav bar of any kind, confirmed via direct inspection of each file rather than inferred from the "SubTab"/"Tab" naming convention in their filenames. Per FR-007, none of these 11 are touched.

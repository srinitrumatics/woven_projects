# Research: Card Consistency Fixes

All findings below are grounded in a direct read of every affected file before planning. No `NEEDS CLARIFICATION` markers remain in the spec.

## 1. Icon-bubble color fix (US1)

**Decision**: Change the `<svg>` className in `app/orders/[id]/components/BillingInfo.tsx:19`, `app/quotes/[id]/components/QuoteBillingInfo.tsx:13`, and `app/proposals/[id]/components/BillingInfo.tsx:13` from `"w-5 h-5 text-green-600 dark:text-green-400"` to `"w-5 h-5 text-blue-600 dark:text-blue-400"`. No other line changes — the bubble (`bg-blue-50 dark:bg-blue-900/20`) is already correct in all 3 files and is left untouched.

**Rationale**: Confirmed via direct read that all 3 files are byte-identical in this region (same bubble div, same icon SVG path, same wrong `text-green-600 dark:text-green-400` class) — a clear single-source copy-paste bug, not 3 independent decisions. Confirmed via `app/invoices/[id]/components/InvoiceBillingInfo.tsx:30-31` that the already-correct reference pattern is exactly `bg-blue-50 dark:bg-blue-900/20` + `text-blue-600 dark:text-blue-400` — the fix reuses this exact, already-proven-correct color pair rather than inventing a new one.

**Alternatives considered**: Changing the bubble to green instead of the icon to blue — rejected per FR-002/the spec's Assumptions; the blue-based convention is already used by 2 of the 3 already-correct sibling files (Invoice, Supplier Bill) vs. only 1 using green (Purchase Orders), and the bubble color is already correct today in all 3 buggy files — changing the icon is the smaller, more targeted fix.

## 2. Product Detail card reconciliation (US2)

**Decision**: Change `app/products/[id]/components/ProductInfoCard.tsx:24` from `"bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-5 xl:p-6 h-full flex flex-col transition-all duration-300 hover:shadow-2xl"` to `"bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 xl:p-6 h-full flex flex-col"` — matching the catalog card's `rounded-xl`/`shadow-sm`/`border-gray-200` exactly, and removing the `hover:shadow-2xl`/`transition-all duration-300` pair entirely (not toning it down to a smaller hover effect).

**Rationale**: Confirmed via direct read that `ProductInfoCard`'s root `<div>` has no `onClick` of its own (only its internal quantity-stepper buttons and "Add to Order" trigger do, at lines 73/82/91) — it is a static info container, not a clickable navigation card, unlike the catalog card (`app/products/ProductClientPage.tsx:543`, wrapped in a `<Link>` with `cursor-pointer` and a legitimate `hover:shadow-lg` affordance for the thing it actually does: navigate somewhere on click). Since `ProductInfoCard` has nothing to affirmatively hover-invite a click *toward*, FR-005 requires it not gain a hover effect merely by association with the catalog card's styling — removing the hover entirely (rather than keeping a smaller version of it) is the correct, honest treatment for a non-interactive element.

**Alternatives considered**: Keeping `rounded-2xl` (a more "premium" radius) while just reducing the shadow intensity — rejected; the goal is visual reconciliation with the catalog card as the *same conceptual surface*, not inventing a third intermediate treatment; matching the catalog card's exact tokens is the more literal, verifiable fix per SC-003's "direct side-by-side comparison" criterion.

## 3. Reports page legacy shadow (US3)

**Decision**: Change `app/reports/page.tsx:13` from `"bg-white dark:bg-gray-800 rounded-lg shadow p-6"` to `"bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"` — a single-token change (`shadow` → `shadow-md`), radius (`rounded-lg`) already matches the target convention and is untouched.

**Rationale**: Confirmed via direct read that `app/unauthorized/page.tsx:5` (the audit's own implicitly-correct reference, confirmed in a prior investigation to already use `rounded-lg shadow-md`, not the bare `shadow` the audit's text claimed) uses exactly this `rounded-lg` + `shadow-md` combination — Reports is the one page still missing the `-md` suffix. This is the smallest possible fix that brings it to the same standard.

**Alternatives considered**: None — this is a single, unambiguous token correction with a directly-confirmed reference pattern already in the same module family (both are simple content pages using the Sidebar shell).

## 4. Scope boundary — what's explicitly NOT touched

**Decision**: The 37-file dominant `rounded-lg shadow-md border` detail-card population, the 5-file Home/Profile `rounded-2xl shadow-sm border` stat-card population, and the 7-file list-page `rounded-xl shadow-sm hover:shadow-lg` stat/filter-card population are all left completely untouched.

**Rationale**: A dedicated investigation (prior to this spec's authoring) confirmed all 3 of these populations are already internally consistent within themselves — they are different, but each individually coherent, design languages for genuinely different UI roles (static detail-page info card vs. clickable dashboard stat tile vs. clickable list-page filter card). None of them contain the kind of copy-paste-error or isolated-outlier defect that the 3 in-scope fixes above do. Forcing all 3 into one shared `Card` component would be a much larger, more opinionated visual redesign than this feature's actual scope (fixing confirmed inconsistencies), and isn't something either the audit's own evidence or this investigation's fresh findings support as broken today.

**Alternatives considered**: Building one universal shared `Card` primitive covering all card populations app-wide — rejected as premature abstraction (Constitution Principle V, YAGNI) forcing 49 already-correct files through an unnecessary refactor to fix 6 genuinely inconsistent ones.

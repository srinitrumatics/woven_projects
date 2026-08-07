# Research: Align Tab Content Padding to p-6

## Context

The feature spec (`spec.md`) calls for normalizing tab-content wrapper padding to `p-6` across every page in the web app. Two research passes (an initial broad Explore and a follow-up verification pass) enumerated the exact files, line numbers, and current className strings. No items in the Technical Context were left as `NEEDS CLARIFICATION`; this document records the enumerated findings and the judgment calls made while scoping exact edits.

## Decision: Edit each wrapper `<div>` in place, no new shared component

**Decision**: For every file below, change only the padding utility token (`p-2`/`p-3`/`p-4` → `p-6`) on the identified wrapper `<div>`, leaving every other class, structural element, and piece of logic untouched.

**Rationale**: `components/ui/Tabs.tsx` and `components/ui/SubTabs.tsx` render only the tab-button row — they do not wrap or own the content panel's padding. Each page independently wraps its tab bar and/or content in its own `<div>`, so there is no single component whose fix would cascade to every page. Introducing a new shared `TabContent` component now would exceed the scope of a visual-consistency fix and add refactor risk (every one of the ~18 files would still need to be touched to adopt it, with no net reduction in edit count for this feature). This is a legitimate future idea but is out of scope here (see Alternatives below).

**Alternatives considered**:
1. **Build a shared `TabContent`/`TabPanel` wrapper component and migrate all pages to use it.** Rejected for this feature: same number of files touched, but with added risk of behavior changes (each page's wrapper has slightly different sibling classes — `border-b`, `min-w-0`, `pb-0`, `overflow-hidden` — that would need to be preserved or reconciled into a shared component's API). A pure padding-token edit is lower risk and matches the spec's "spacing only, no restructuring" requirement (FR-008).
2. **Use a global CSS override (e.g., a Tailwind `@layer` rule targeting a shared class name).** Rejected: no shared class name currently exists across these divs to target, and introducing one would itself be a structural change beyond scope.

## Enumerated edit sites

### A. Object detail pages — separate tab-bar div + content div

| File | Line | Current | Target |
|---|---|---|---|
| `app/quotes/[id]/page.tsx` | 714 (bar) | `p-3 border-b border-gray-200 dark:border-gray-700 min-w-0` | `p-6 border-b border-gray-200 dark:border-gray-700 min-w-0` |
| `app/quotes/[id]/page.tsx` | 734 (content) | `p-4` | `p-6` |
| `app/purchase-orders/[id]/page.tsx` | 256 (bar) | `p-3 border-b ... min-w-0` | `p-6 border-b ... min-w-0` |
| `app/purchase-orders/[id]/page.tsx` | 271 (content) | `p-4` | `p-6` |
| `app/supplier-bills/[id]/page.tsx` | 331 (bar) | `p-3 border-b ... min-w-0` | `p-6 border-b ... min-w-0` |
| `app/supplier-bills/[id]/page.tsx` | 343 (content) | `p-4` | `p-6` |
| `app/invoices/[id]/page.tsx` | 390 (bar) | `p-3 border-b border-gray-200 dark:border-gray-700` (no `min-w-0`) | `p-6 border-b border-gray-200 dark:border-gray-700` |
| `app/invoices/[id]/page.tsx` | 403 (content) | `p-4` | `p-6` |
| `app/products/[id]/page.tsx` | 240 (bar) | `p-3 border-b ... min-w-0` | `p-6 border-b ... min-w-0` |
| `app/products/[id]/page.tsx` | 248 (content) | `p-4` | `p-6` |
| `app/orders/[id]/OrderClientPage.tsx` | 1815 (content) | `p-3` | `p-6` — no separate bar div was found for this page; **verify during implementation** whether a bar wrapper exists and needs the same treatment |
| `app/proposals/[id]/page.tsx` | 1418 (bar) | `p-4 border-b border-gray-200 dark:border-gray-700 min-w-0` | `p-6 border-b border-gray-200 dark:border-gray-700 min-w-0` |
| `app/proposals/[id]/page.tsx` | 1440 (content) | `p-2` | `p-6` — this is the exact div the reference screenshot points at |
| `app/shipments/[id]/page.tsx` | 187 (bar) | `p-4 border-b border-gray-200 dark:border-gray-700` | `p-6 border-b border-gray-200 dark:border-gray-700` |
| `app/shipments/[id]/page.tsx` | 196 (content) | `p-2` | `p-6` |

### B. Line-item detail pages — single combined card

| File | Line | Current | Target |
|---|---|---|---|
| `app/proposals/[id]/lines/[lineid]/page.tsx` | 797 | `mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4` | `...p-6` |
| `app/quotes/[id]/lines/[lineid]/page.tsx` | 534 | same pattern, `p-4` | `...p-6` |
| `app/purchase-orders/[id]/lines/[lineid]/page.tsx` | 651 | same pattern, `p-4` | `...p-6` |
| `app/supplier-bills/[id]/lines/[lineid]/page.tsx` | 370 (outer) | `...p-4` | `...p-6` |
| `app/supplier-bills/[id]/lines/[lineid]/page.tsx` | 392 (inner) | `p-4` | `p-6` |
| `app/invoices/[id]/lines/[lineid]/page.tsx` | 390 | same pattern, `p-4` | `...p-6` |

**Judgment call — leave untouched**: `app/purchase-orders/[id]/lines/[lineid]/page.tsx:665` has a nested `className="py-2"` div below the `<Tabs>` row, inside the already-`p-4`→`p-6` outer card. This is vertical-only spacing on an inner element (not a card-level tab-content wrapper matching the pattern described in the spec), so it is left as-is. If a future pass finds this creates a visible inconsistency once the outer card grows to `p-6`, that would be a separate follow-up, not part of this feature's FR-001–FR-008.

**Verified, no edit needed**: `app/proposals/[id]/lines/[lineid]/components/LineTaxesTab.tsx:32` and `LineFulfillmentsTab.tsx:136` have a `p-6` loading-state div, but their loaded-content branch carries no padding class at all — it inherits padding entirely from the outer card at `page.tsx:797`. Once that outer card becomes `p-6`, loading and loaded states already match (satisfies spec FR-006 with no additional edit).

### C. Shipments line-detail sub-component

| File | Line | Current | Target |
|---|---|---|---|
| `app/shipments/[id]/lines/[lineid]/components/BottomTabs.tsx` | 87 (bar) | `p-3 border-b border-gray-200 dark:border-gray-700 min-w-0` | `p-6 border-b border-gray-200 dark:border-gray-700 min-w-0` |
| `app/shipments/[id]/lines/[lineid]/components/BottomTabs.tsx` | 98 (content) | `p-4` | `p-6` |

### D. Admin list pages (tab-style filters, single card)

| File | Line | Current | Target |
|---|---|---|---|
| `app/admin/authorize-locations/page.tsx` | 255 | `bg-white dark:bg-gray-800 rounded-lg shadow p-4` | `...p-6` |
| `app/admin/authorize-locations/[id]/delivery-windows/page.tsx` | 262 | `bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden p-4` | `...p-6` |

### E. Additional list pages surfaced by the broader grep (in scope per spec FR-007, "tab-style filters on list/admin pages")

| File | Line | Current | Target |
|---|---|---|---|
| `app/inventory/page.tsx` | 560 | `bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden p-4` | `...p-6` |
| `app/shipments/page.tsx` | 429 (bar) | `p-4 border-b ...` | `p-6 border-b ...` |
| `app/shipments/page.tsx` | 457 (content) | `p-4 pb-0` | `p-6 pb-0` — keep the `pb-0` override intentionally zeroing bottom padding above the table |

## Summary of resolved unknowns

No `NEEDS CLARIFICATION` markers existed in the Technical Context. This research confirms: (1) there is no shared component to fix once — every file needs its own edit; (2) the full set of ~18 files / ~27 individual class edits satisfies every functional requirement in `spec.md`, including the loading-state parity requirement (FR-006), which turns out to already be satisfied once the outer card padding changes, needing no separate edit in the two `LineXTab.tsx` files; and (3) one nested `py-2` div (purchase-orders line detail) is deliberately excluded as out-of-pattern, documented so a future reviewer understands why it wasn't touched.

# Phase 0 Research: Scrollable Tab Header Rows on Order Details Page

## Current state (baseline)

`app/orders/[id]/OrderClientPage.tsx:1766-1812`:

```tsx
<div className="mt-6">
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">        {/* 1767 */}
    <div className="flex flex-col lg:flex-row lg:items-center gap-2 p-3 border-b ... min-w-0">   {/* 1768 */}
      <div className="flex-1 relative w-full lg:min-w-[300px]"> ...search input... </div>          {/* 1770 */}
      {/* optional refresh button, flex-shrink-0 */}
      <Tabs
        tabs={[Add Products, My Order, Taxes, Fulfillment, Returns, Files]}
        activeKey={viewMode}
        onChange={...}
        className="no-scrollbar pb-0.5 flex-shrink-0 lg:w-auto"                                     {/* 1810 */}
      />
    </div>
```

`components/ui/Tabs.tsx:19` — the shared component itself: `flex flex-nowrap gap-2 overflow-x-auto w-full ${className}`. This already has `overflow-x-auto` and no scrollbar-hiding of its own.

## Decision: why the row clips instead of scrolling

**Root cause, two independent contributing factors at the one call site (line 1810):**

1. **`flex-shrink-0`** — tells the browser this flex child must never shrink below its content's natural width. At `lg` breakpoint and up (`lg:flex-row`), the search box (`flex-1`, floor `lg:min-w-[300px]`) and the Tabs div share one row. Because the Tabs div can't shrink, when the row's total content (search box + 6 tab buttons) exceeds the available width, the *search box* absorbs all the squeeze (down to its 300px floor) while the Tabs div stays at its full natural width — which can now exceed the remaining space and get clipped by the ancestor `overflow-hidden` (line 1767), rather than the Tabs div's own `overflow-x-auto` ever kicking in (that only activates once the div itself has a width smaller than its content, which `flex-shrink-0` prevents).
2. Even if `flex-shrink-0` were simply removed, a flex item's implicit `min-width: auto` (a CSS default, not a Tailwind class) would still floor it at its content's natural width and block shrinking below that — this is why the fix must also add `min-w-0`, the standard Tailwind idiom already used elsewhere in this exact file (e.g. line 1768's own `min-w-0`, and the analogous `flex-1 min-w-0` pattern in `components/ui/SortableHeader.tsx`) to defeat that implicit floor.

**Additionally, `no-scrollbar`** (defined `app/globals.css:98-109`, hides the scrollbar cross-browser) is applied only at this one call site — confirmed via repo-wide search that no other `<Tabs>` consumer anywhere in the codebase uses it. Even after fixing the shrink behavior above, `no-scrollbar` would leave the row scrollable only via touch/trackpad swipe, with no visible affordance for a mouse user — inconsistent with every other working `<Tabs>` row (Proposals, Purchase Orders, Invoices, Quotes, Shipments, Supplier Bills, Products all show a normal scrollbar when their tab row overflows).

## Decision: the fix

**Decision**: Change line 1810's className from `"no-scrollbar pb-0.5 flex-shrink-0 lg:w-auto"` to `"pb-0.5 min-w-0 lg:w-auto"`.

**Rationale**: Removes both root causes (no-shrink, hidden scrollbar) in one edit, adds the one missing token (`min-w-0`) needed for the shrink to actually take effect, and brings this call site in line with the pattern every other page's `<Tabs>` usage already follows correctly (confirmed via `app/proposals/[id]/page.tsx:1417-1419` and `app/purchase-orders/[id]/page.tsx:255-257`, among others, none of which override with `flex-shrink-0` or `no-scrollbar`).

**Alternatives considered**:
- *Wrap the `<Tabs>` element in an extra `<div className="min-w-0 flex-1 overflow-hidden">`.* Rejected — adds an unnecessary DOM node for something a direct className edit on the existing element already achieves; every other working page does it with a plain className, not a wrapper.
- *Keep `no-scrollbar` and add a custom fade-edge or arrow-button affordance instead.* Rejected — introduces new UI (arrows, fade gradients) not requested and not used anywhere else in the app; a plain visible scrollbar is the existing, already-proven pattern for every other tab row and satisfies the spec's Assumption to match that pattern.
- *Give the Tabs div `flex-shrink` (allow shrink) but keep `lg:w-auto` removed entirely.* Considered — `lg:w-auto` is likely vestigial (a flex item with no `flex-grow` already sizes to content by default), but leaving it in place is harmless and out of scope; removing it isn't necessary to fix the bug, so it's kept to minimize the diff (Constitution Principle V).

## Decision: no change needed to shared components or the sub-tab row

**Decision**: `components/ui/Tabs.tsx`, `components/ui/SubTabs.tsx`, and `app/orders/[id]/components/FulfillmentTab.tsx` are unchanged.

**Rationale**: `Tabs.tsx` already implements `overflow-x-auto` correctly for every consumer except this one, which overrides it away. `SubTabs.tsx` (used by the Fulfillment section's Proposals/Customer Quotes/etc. row) already has `overflow-x-auto overflow-y-hidden` (the latter added by `specs/117-subtab-header-scrollbar`) and is not fighting a sibling flex element — it already satisfies spec FR-002/Scenario 4 with no code change.

## Open questions

None — no `NEEDS CLARIFICATION` markers remain.

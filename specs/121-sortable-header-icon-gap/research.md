# Phase 0 Research: Clear Gap Between Header Text and Sort Icon in All Datatables

## Current state (baseline)

`components/ui/SortableHeader.tsx:66-84` renders, inside every sortable `<th>`:

```tsx
<div className={`px-2 py-3 flex items-center gap-1 h-full min-h-[44px]`} style={{ width: '100%' }}>
  <div className="flex-1 min-w-0">
    <span className={`text-${align} block w-full ${truncate ? 'truncate' : 'whitespace-nowrap'}`} title={label}>
      {label}
    </span>
  </div>
  <span className="text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300 w-4 flex-shrink-0 mt-0.5">
    {isSorted ? (sortConfig?.direction === 'asc' ? '↑' : '↓') : <span className="opacity-0 group-hover:opacity-100 text-xs">↕</span>}
  </span>
</div>
```

`gap-1` is Tailwind's 0.25rem (4px) row gap between the label wrapper and the icon span. Confirmed via repo-wide search that this is the **only** place in the codebase that renders a sort-direction arrow (`↑`/`↓`/`↕`) — no page implements its own header markup, and every list page (Orders, Products, Invoices, Quotes, Purchase Orders, Shipments, Proposals, Supplier Bills, Inventory) imports `SortableHeader` from this file per the constitution's "All data-table landing pages MUST use `SortableHeader`" rule.

## Decision: widen the existing `gap-1` to `gap-2`

**Decision**: Change `gap-1` to `gap-2` (0.25rem → 0.5rem, 4px → 8px) on the flex row at `SortableHeader.tsx:67`.

**Rationale**: Doubles the visual separation with a single Tailwind scale step — enough to no longer read as crowded (satisfies spec FR-001/SC-002) — while staying well within the layout budget available even at the smallest supported column width.

**Layout budget check** (worst case): the minimum resizable column width is 50px (`hooks/useResizableColumns.ts:13`, `Math.max(newWidth, 50)`). The header row has `px-2` padding on both sides (8px + 8px = 16px) and the icon span is a fixed `w-4` (16px, `flex-shrink-0` so it never shrinks or gets clipped). That leaves `50 - 16 - 16 = 18px` for the label + gap at the narrowest possible column. At `gap-2` (8px), the label wrapper still gets `10px` — non-zero, so it renders (truncated, via the existing `truncate`/`whitespace-nowrap` + `flex-1 min-w-0` pattern) rather than disappearing or forcing a wrap. At the old `gap-1` (4px) the label wrapper got `14px` — so the change costs the label 4px of space in the worst case, well inside what `truncate` already handles today for long labels on narrow columns (satisfies FR-003/FR-005).

**Alternatives considered**:
- *`gap-1.5` (6px).* Rejected — a smaller, less noticeable improvement than `gap-2`; doesn't clearly resolve "crowded" the way a full Tailwind scale step does.
- *`gap-3` (12px) or larger.* Rejected — at the 50px minimum column width this would leave only 6px for the label wrapper, meaningfully more aggressive truncation than today for the narrowest columns; `gap-2` is the largest step that stays clearly conservative against FR-003/FR-005's no-regression requirement.
- *Add margin to the icon span instead of changing the row's `gap`.* Rejected — the row already uses `gap-*` for this exact purpose; adding a second, redundant spacing mechanism (margin) alongside an existing `gap` is less simple for no benefit (Constitution Principle V).

## Decision: no other files need to change

**Decision**: No page-level file changes. Confirmed by the same repo-wide search noted above.

**Rationale**: Every list page's sortable column headers are `<SortableHeader ... />` call sites that only pass `label`, `field`, `sortConfig`, `requestSort`, `width`, `onResize`, `className`, `align`, `truncate` — none of them re-implement the internal label/icon layout, so the fix is fully centralized already.

## Open questions

None — no `NEEDS CLARIFICATION` markers remain.

# Phase 0 Research: Fix Sort Icon Overlap in Menu/Line Detail Table Headers

## Unknown 1: Why does the overlap happen given the prior "no ellipsis" fix (spec 046)?

- **Decision**: The overlap is a side effect of spec 046 correctly removing ellipsis truncation but leaving the label forced onto a single line (`whitespace-nowrap`) with no `overflow-hidden`. On wide/landing-page columns this never overflowed far enough to reach the icon. On the narrow, fixed/resizable-width columns used in line-detail and manifest-detail tabs (down to a 50px floor per `hooks/useResizableColumns.ts`), the un-clipped single-line text overflows past its own flex box and renders visually on top of the sibling icon `<span>` — flexbox does not clip a sibling's overflowing inline content.
- **Rationale**: Confirmed by reading `components/ui/SortableHeader.tsx` (label span uses `${truncate ? 'truncate' : 'whitespace-nowrap'}`, and no caller ever passes `truncate={true}`) and cross-referencing the known narrow column widths in `LineTaxesTab.tsx`, `QuoteLineTaxesTab.tsx`, `LineFulfillmentsTab.tsx`, `ShipmentLinesTab.tsx`, etc. (120–180px fixed widths with multi-word labels like "Excise Tax Amount", "Box Gross Weight").
- **Alternatives considered**: Re-introducing `truncate` (ellipsis) — rejected, explicitly ruled out twice now (spec 046 and this feature's own FR-002).

## Unknown 2: How to keep the full label visible without truncating AND without overlapping the icon?

- **Decision**: Allow the label to wrap onto multiple lines within its own `flex-1 min-w-0` box (drop the forced `whitespace-nowrap`, let `white-space: normal` + word-wrapping apply), while keeping the icon in a `flex-shrink-0` box with a fixed width so it can never be squeezed or overlapped. The header row's height already uses `min-h-[44px]` (a minimum, not a fixed max), so it can grow to accommodate a wrapped two-line label without any structural change.
- **Rationale**: This satisfies FR-001 (no overlap), FR-002 (no ellipsis — full text stays visible), and FR-004 (icon stays fully visible/clickable) simultaneously, and is a small, localized change to the existing Tailwind classes in one component. It matches the edge case in spec 046 ("wrapping onto a second line... is an acceptable visual trade-off") which is already an accepted precedent in this codebase.
- **Alternatives considered**:
  - *Widen the column automatically to fit the label* — rejected as primary approach: user-resizable columns are expected to be resizable to arbitrary/minimum widths (including a 50px floor), so a column can always be made narrower than any label; wrapping is the only approach that holds at every width. Auto-widening also conflicts with explicit user resize actions.
  - *Shrink/hide the icon on narrow columns* — rejected: violates FR-004 (icon MUST remain visible and usable in both sorted/unsorted states) and spec 121's requirement that spacing/behavior stay consistent regardless of column width.
  - *Absolutely position the icon outside the label's flow (e.g., pinned to the cell's right edge, label given `padding-right` to reserve space)* — considered viable, functionally similar to the reserved-space approach already in place (`flex-shrink-0` icon box). Not chosen over the wrap approach because the current layout already reserves icon space via flexbox; the actual bug is the label's overflow, not the reservation itself. Revisit only if wrapping introduces unexpected visual issues during implementation.

## Unknown 3: Will wrapping affect the vertical alignment consistency required by spec 121 and this feature's FR-003?

- **Decision**: Keep the row's `items-center` alignment for the common case (single-line labels, the majority of columns), and verify during implementation whether the icon should switch to `self-start` (top-aligned) specifically when its sibling label wraps to 2+ lines, so the icon doesn't appear to float in the vertical middle of an unnaturally tall cell. This is an implementation-time visual judgment call, not a scope change — either choice satisfies FR-003 (identical layout across pages) as long as it's applied uniformly by the one shared component.
- **Rationale**: Because all affected tables share one component, whichever alignment choice is made will automatically be consistent everywhere (spec 121's User Story 2 / this feature's User Story 2) without needing a per-page decision.
- **Alternatives considered**: None needed — this is a single-component decision, deferred to implementation/visual review rather than blocking planning.

## Unknown 4: Does this change risk regressing non-detail (landing/list) page tables?

- **Decision**: No structural risk. Landing/list pages use the same `SortableHeader` component but with wide enough columns that labels already fit on one line; allowing wrap-if-needed instead of forced-nowrap is a no-op for any label that already fits its column width. FR-006 requires explicitly checking this during acceptance testing rather than assuming it.
- **Rationale**: Wrapping only activates when content doesn't fit — CSS `white-space: normal` renders identically to `nowrap` when the line already fits within the container.
- **Alternatives considered**: Scoping the fix to only detail-page tables via a new prop — rejected as unnecessary complexity (violates Constitution Principle V, Simplicity); the shared-component fix is safe for all consumers per the rationale above, and per spec 125's own assumption that a single shared-layer fix is expected.

**Output**: All unknowns resolved. No remaining `NEEDS CLARIFICATION` markers.

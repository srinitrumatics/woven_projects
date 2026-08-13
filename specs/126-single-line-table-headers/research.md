# Phase 0 Research: Single-Line, Non-Ellipsis Data Table Headers Everywhere

## Unknowns from Technical Context

None marked `NEEDS CLARIFICATION` — the spec's Assumptions section already resolved the one scope-impacting ambiguity (resize floor vs. single-line requirement) via FR-004. This research phase instead validates that the chosen approach is achievable against the current codebase rather than resolving open questions.

## Finding 1: Single shared component confirms scope

**Decision**: The fix is made once in `components/ui/SortableHeader.tsx`, exactly as spec 125 assumed.

**Rationale**: Grepped every `<th>`/sort-icon usage across `app/**` and `components/**`. All sortable, icon-bearing headers render through `SortableHeader`. The only other header primitive is `components/ui/DataTable.tsx`'s `Th`, which is a plain, non-sortable header (no sort icon, no click-to-sort) used for a handful of static tables (`POFilesTable.tsx`, `PDFTemplate.tsx`, `ProductCatalog.tsx`, and list-page filter tables in `proposals/page.tsx` / `quotes/page.tsx`). Since FR-001–FR-004 are scoped to "sortable data table column header" (see Key Entities), `Th` is out of scope — there is no sort icon to overlap and no existing ellipsis behavior introduced by this feature.

**Alternatives considered**: Auditing and changing every call site individually — rejected; the constitution (`Technology Stack Constraints`) already mandates `SortableHeader` + `useSortableData` for every sortable column, so a per-call-site change would be redundant and risks inconsistency (the exact problem this feature is trying to remove).

## Finding 2: No `table-layout: fixed` exists anywhere, so CSS-only sizing is viable

**Decision**: Achieve single-line, non-overlapping headers using CSS layout rules in `SortableHeader.tsx` alone — no text-measurement JavaScript and no change to `hooks/useResizableColumns.ts`.

**Rationale**: Grepped the codebase for `table-layout`/`tableLayout` — zero matches. Every table consuming `SortableHeader` uses the browser default `table-layout: auto`. Under `auto` layout, a column's rendered width is the max of the natural (non-wrapping) content width across every cell in that column, unless something explicitly caps it. Today, `SortableHeader` applies `width`, `minWidth`, **and** `maxWidth` all pinned to the same px value (the resized/default width) — the `maxWidth` is what currently forces overflow, which the component then papers over with `break-words` (wrapping, per spec 125) instead of `truncate` (ellipsis, forbidden since spec 046).

Removing the `maxWidth` cap and switching the label from `break-words`/`truncate` to `whitespace-nowrap` restores the browser's natural `auto`-layout behavior: the column (and therefore the header) will render at least as wide as its label needs, growing past the requested/resized width when necessary, while still honoring a wider user-requested width via `minWidth`. This satisfies FR-001 (single line), FR-002 (no ellipsis), and FR-003 (no overlap — the icon has its own reserved, non-shrinking flex slot, as already established by spec 125/121) without any JS measurement code.

FR-004 ("prevent resize below the label's single-line width") falls out of this as an emergent property: even if a user drags the resize handle down toward the existing 50px floor in `useResizableColumns.ts`, the *rendered* column cannot actually shrink below the nowrap label's natural width once `maxWidth` is no longer pinning it — the state can go to 50, but the DOM won't honor a width narrower than content needs. No change to the hook itself is required.

**Alternatives considered**:
- *JS text measurement* (canvas `measureText` or a hidden probe span) to compute each label's pixel width and feed it into `useResizableColumns` as a per-column minimum — rejected as unnecessary complexity; the CSS `auto`-table-layout behavior already provides the same guarantee natively, and the constitution's simplicity principle (V) favors the simpler option.
- *`table-layout: fixed` with explicit `<col>` widths* — rejected; this is the layout mode that would require JS measurement to keep single-line, and would be a much larger structural change across every table in the app for no added benefit over the default `auto` layout already in use.

## Finding 3: Interaction with the sort icon's reserved space

**Decision**: Keep the icon in its own `flex-shrink-0` slot beside the label (already the case after spec 121/125); no structural change to the flex layout needed beyond the label's own wrap behavior.

**Rationale**: The current header markup already separates label and icon into two flex children, with the icon column fixed at `w-4 flex-shrink-0`. The overlap problem addressed by spec 125 was the label's *own box* rendering text past its box edge, not the icon's box shrinking. Switching the label to `whitespace-nowrap` (instead of `break-words`) and removing the label wrapper's `min-w-0` (which currently lets the label's flex item shrink and its text wrap/clip) means the label's flex item will refuse to shrink below its content's intrinsic width — pushing the whole header wider rather than compressing into the icon's territory. Combined with Finding 2's `maxWidth` removal at the `<th>` level, the header cell as a whole grows to fit both children instead of clipping either.

**Alternatives considered**: Moving the icon to an absolutely-positioned overlay — rejected; that was the layout style spec 125 explicitly moved away from (it was the root cause of the original overlap bug), and reverting to it would regress spec 125/121's fix.

## Summary of technical approach

All changes are confined to `components/ui/SortableHeader.tsx`:
1. Drop the `maxWidth` clamp from the `<th>`'s inline style (keep `width`/`minWidth` as the resized/default value as a floor, not a hard cap).
2. Change the label's wrapping behavior from conditional `truncate`/`break-words` to always `whitespace-nowrap`.
3. Remove the label wrapper's `min-w-0` (or equivalent shrink allowance) so the flex item can't be compressed narrower than its content.
4. No change to `hooks/useResizableColumns.ts`, `useSortableData.ts`, or any of the ~90+ call sites — consistent with the plan constraint that `SortableHeader`'s public prop interface must not change.

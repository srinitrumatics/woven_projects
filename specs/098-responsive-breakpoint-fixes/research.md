# Research: Responsive Breakpoint Fixes

All findings below are grounded in a direct read of every affected file before planning. No `NEEDS CLARIFICATION` markers remain in the spec.

## 1. Product Information panel breakpoint fix (US1)

**Decision**: Change `app/shipments/[id]/lines/[lineid]/components/ProductInformationCard.tsx:26` from `grid grid-cols-1 sm:grid-cols-2 min-[1000px]:grid-cols-3 gap-x-4 gap-y-3` to `grid grid-cols-1 sm:grid-cols-2 w1025:grid-cols-3 gap-x-4 gap-y-3` — a single-token swap (`min-[1000px]:` → `w1025:`), no other classes on this element change.

**Rationale**: Confirmed via direct read that the component's own root `<div>` (line 11) already uses `w1025:col-span-6` — the standard custom breakpoint — and its parent page (`app/shipments/[id]/lines/[lineid]/page.tsx:203,205,219`) uses `w1025:` consistently for every panel's layout switch. Only this one nested grid, one level deeper, drifted to an arbitrary `min-[1000px]:` value (~25px earlier than `w1025`, per `tailwind.config.ts`'s definition), causing its 2-vs-3-column switch to fire at a different width than the rest of the page's stacked-vs-side-by-side switch.

**Alternatives considered**: Changing the *page's* `w1025` breakpoint to match this component's `min-[1000px]` value instead — rejected; `w1025` is the app's actual documented custom breakpoint (`tailwind.config.ts`) used consistently across many pages, while `min-[1000px]` is an arbitrary one-off value with no other usage found anywhere in this component's own page.

## 2. Redundant "Load More" control removal (US2)

**Decision**: Remove the manual "Load More Products" `<button>` block (`app/products/ProductClientPage.tsx:462-470`) entirely, keeping the `IntersectionObserver`-driven sentinel block (`:451-459`) as the sole "load more" affordance for Card view.

**Rationale**: Confirmed via direct read that both blocks render under the byte-identical condition `!isLastPage && viewMode === 'card'` and the button's `onClick={showMore}` calls the exact same handler the sentinel's `IntersectionObserver` callback already calls — there is no scenario in which one is visible/relevant and the other isn't; they are simultaneously present doing the identical thing. The sentinel block already renders its own loading spinner and "Loading more products..." text, so removing the button loses no functionality — a user who scrolls sees the same auto-load behavior either way, and one fewer duplicate control.

**Alternatives considered**: Removing the sentinel instead and keeping only the manual button — rejected; the sentinel-based auto-load is the more modern, effort-free-for-the-user pattern (no click required), and the button was very likely leftover from before the sentinel was added, not an independent, purpose-built fallback (no accessibility or no-JS conditional guards it separately). Keeping both as "belt and suspenders" — rejected; the spec's own Independent Test/Acceptance Scenario confirms a user should see exactly one control, and the audit itself flagged the duplication as a confirmed defect, not a legitimate redundancy.

## 3. Scope boundary — what's explicitly NOT touched

**Decision**: Products List's List view (`usePagination`/`useHits`, discrete-page `<Pagination>`) and Card view (`useInfiniteHits`, continuous scroll) remain two separate pagination paradigms, unchanged.

**Rationale**: A dedicated investigation (prior to this spec's authoring) confirmed each of these two Algolia-hook-driven patterns is internally consistent and appropriate to its own view mode — List view is optimized for scanning a fixed page of tabular data, Card view for continuous visual browsing. Unifying them into one paradigm (e.g., converting Card view to discrete pages, or List view to infinite scroll) would be a genuine UX-redesign decision requiring product/design input, not a bug fix — well beyond this feature's bounded scope of 2 confirmed, narrow defects.

**Alternatives considered**: Including paradigm unification as a 3rd user story in this feature — rejected; unlike US1/US2, there is no confirmed defect here, only two legitimately different (and each internally coherent) patterns, consistent with this repo's established practice (e.g. spec `096`) of not forcing genuinely-different-but-individually-coherent UI populations into one shared treatment.

# Phase 0 Research: Standardize Data Table Header Corners & Border Styling

## Context

This feature has no `NEEDS CLARIFICATION` markers from the spec or plan — it is a scoped,
presentation-only Tailwind CSS styling correction to an existing, well-understood codebase
pattern. Research below documents the concrete current-state findings that ground the design
decisions, and the alternatives considered for *how* to apply the fix.

## Current-State Findings (from codebase survey)

- **Shared primitive exists**: `components/ui/DataTable.tsx` exports `Table`, `THead`, `TBody`,
  `Tr`, `Th`, `Td`, `TableEmptyState`, `TableLoadingState`, imported by ~98 files across
  `app/orders`, `app/proposals`, `app/quotes`, `app/purchase-orders`, `app/invoices`,
  `app/supplier-bills`, `app/inventory`, `app/shipments`, and their detail-page sub-tabs.
- **`THead` today**: `bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700`
  — no corner rounding.
- **`TBody` today**: `bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700`
  — this already gives every row a bottom border via Tailwind's `divide-y` utility (border applied
  between adjacent `tr` siblings), satisfying FR-003 for every table that uses the shared
  primitive without further change.
- **`Table` today**: `w-full` only — no rounding, no border.
- **"Curvy" examples** (ad-hoc per-page wrapper `rounded-lg ... overflow-hidden`, clipping the
  square `THead` corners): `ElementsTab.tsx`, `TaxesTab.tsx`, `ReturnsTab.tsx`,
  `POLinesTable.tsx`, `inventory/page.tsx`. No literal `rounded-t-lg`/`rounded-tl` class exists on
  any `<thead>` itself — the rounded look is entirely a wrapper-clipping trick.
- **"Sharp" examples** (bare `overflow-x-auto`, no rounded ancestor): `orders/page.tsx`,
  `proposals/page.tsx`, `InvoiceFilesTab.tsx`, `QuoteLinesTab.tsx`.
- **Full outer border examples**: `ReturnsTab.tsx`, `TaxesTab.tsx`, `POLinesTable.tsx` — wrapper
  adds `border border-gray-100` / `border border-gray-200` in addition to `rounded-lg`.
- **Sticky headers already coexist with the rounded wrapper pattern**: `ElementsTab.tsx` and
  `TaxesTab.tsx` both use `<THead className="sticky top-0 z-20">` *inside* a
  `rounded-lg ... overflow-hidden` outer wrapper, with the actual scrolling handled by an inner
  `overflow-x-auto` div. This proves the "outer rounded + overflow-hidden wrapper, inner scroll
  div" pattern already works correctly with sticky headers in this codebase today — it is not a
  new, untested combination.
- **Raw-markup outlier**: `components/UserManagement/UserList.tsx` renders its own `<table>` /
  `<thead>` / `<tbody>` independent of the shared primitive (`divide-y` applied manually), and
  `app/orders/[id]/components/PDFTemplate.tsx` also renders raw markup but is a printed/exported
  PDF document, not an on-screen browsing table (out of scope per spec Assumptions).

## Decision 1: Where to apply the fix

**Decision**: Standardize the rounded-corner, no-outer-border wrapper treatment at the shared
`components/ui/DataTable.tsx` primitive level (the `Table`/`THead` components and their
conventional wrapper), rather than editing every individual page's wrapper `<div>` by hand with
one-off classes.

**Rationale**: ~98 files already import these shared primitives. Centralizing the correct classes
means every current and future consumer inherits the standardized look automatically, which
matches Constitution Principle V (Simplicity — no duplicated styling logic across ~50+ call
sites). The small number of pages that currently *add contradicting* classes (ad-hoc `border`,
missing `rounded-lg`) still need a one-line edit each to stop overriding/omitting the standard,
but the source of truth for the correct look lives in one place.

**Alternatives considered**:
- *Edit each page's wrapper `<div>` independently*: Rejected — doesn't scale, is easy to miss a
  file (as evidenced by the current inconsistency itself), and duplicates the same three Tailwind
  classes across dozens of files, which Principle V explicitly discourages.
- *Introduce a new configurable `<TableWrapper variant="...">` abstraction*: Rejected — the spec
  requires exactly one standardized look, not multiple variants to choose between. Adding a
  variant prop would be a speculative abstraction with no current requirement for variation
  (violates YAGNI / Principle V).

## Decision 2: Corner-rounding technique

**Decision**: Reuse the existing "rounded-lg + overflow-hidden outer wrapper, inner
`overflow-x-auto` scroll div" pattern already proven in `ElementsTab.tsx` / `TaxesTab.tsx`,
applied consistently everywhere, instead of adding `rounded-tl-lg`/`rounded-tr-lg` directly to the
first/last header `<th>` cells.

**Rationale**: The wrapper-clipping approach is already implemented, already tested against
sticky headers and horizontal scroll in this exact codebase, and requires no changes to
`SortableHeader` or column-resize internals (which render inside `<th>`/`Th`). Per-cell rounding
on the first/last `<th>` would require conditionally targeting specific header cells (which vary
per table depending on sticky/frozen columns) and re-validating sticky-header behavior from
scratch — higher risk for no additional benefit.

**Alternatives considered**:
- *Per-cell `rounded-tl-lg`/`rounded-tr-lg` on first/last `<th>`*: Rejected — more fragile
  (breaks if a sticky/frozen leading column is inserted or reordered), and re-implements a pattern
  the codebase already has working evidence for via the wrapper approach.
- *CSS `border-radius` via a global stylesheet override on all `<table>` elements*: Rejected —
  the project's styling convention is Tailwind utility classes on components, not global CSS
  overrides; a blanket global rule also can't correctly express "remove the outer border but keep
  row dividers" without additional selectors, adding complexity for no benefit over the
  component-level fix.

## Decision 3: Outer border removal

**Decision**: Remove the ad-hoc `border border-gray-100` / `border border-gray-200` (and dark
variants) classes from the small set of page/tab wrapper `<div>`s that currently add them
(`ReturnsTab.tsx`, `TaxesTab.tsx`, `POLinesTable.tsx`), keeping `rounded-lg shadow-sm
overflow-hidden` (or the equivalent centralized replacement) so the table remains visually
distinct from the page background via shadow alone, matching the already-borderless examples
(`ElementsTab.tsx`).

**Rationale**: `shadow-sm` already provides enough visual separation from the background without
a hard border line, consistent with the spec's requirement to remove the outer border while still
keeping the table visually distinct.

**Alternatives considered**: None — this is a straightforward class removal with a directly
observable existing borderless example (`ElementsTab.tsx`) to match.

## Decision 4: Row bottom borders

**Decision**: No change needed to `TBody`'s existing `divide-y divide-gray-200 dark:divide-gray-700`
for tables already using the shared primitive — confirm via manual QA (Phase 1 quickstart) that
this renders a bottom border under every row, including the last, in both light and dark mode.
For `UserList.tsx` (raw markup), confirm its existing manual `divide-y divide-gray-200
dark:divide-gray-700` on `<tbody>` matches the same visual result; align classes exactly if any
drift is found.

**Rationale**: Tailwind's `divide-y` utility already achieves the FR-003 requirement for the
overwhelming majority of tables in scope; this is a verification task, not a new implementation.

**Alternatives considered**:
- *Add `border-b` directly to `Tr`/`tr` elements instead of `divide-y` on the parent*: Rejected —
  functionally equivalent but would require touching every row-rendering call site instead of the
  one shared `TBody`/`tbody` wrapper; `divide-y` is already the established, working pattern.

## Open Questions

None. All aspects of the spec map to a concrete, low-risk implementation using patterns already
proven elsewhere in this codebase.

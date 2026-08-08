# Research: Consistent Bold Hyperlinks in All Datatables

## Unknown: Is there a shared component to fix once, or is this a scattered per-file fix?

**Decision**: Scattered per-file fix — normalize the Tailwind `font-*` weight class on each existing `<Link>`/anchor element directly, rather than introducing a new shared "TableLink" component.

**Rationale**:
- `components/ui/DataTable.tsx` exports the shared `Table`/`THead`/`TBody`/`Tr`/`Th`/`Td` primitives used across ~98 files, but `Td` is a generic content wrapper with no opinion on link styling — it never renders the `<Link>` itself. Each page/tab component renders its own `<Link href=...>` inside a `Td`, with its own hand-written className.
- An exhaustive inventory (below) found **212 in-table hyperlink instances across ~60 files**. Of these, ~176 need a className change; the rest are already at the target weight.
- The overwhelming majority of the "needs fixing" instances (well over 100) share one exact literal className string: `text-primary hover:underline font-medium`. This is a mechanical, low-risk, single-property change (swap `font-medium` → `font-semibold`) — not a design decision that benefits from a new abstraction.
- This mirrors the precedent set in `specs/115-align-tab-content-padding/research.md` and its plan: that feature normalized a single Tailwind class across ~20 files as direct per-file edits rather than inventing a shared wrapper, because "each file edit is fully independent" and introducing a new component to save one class swap would violate Constitution Principle V (Simplicity & Phase-Driven Scope — YAGNI, no premature abstraction).
- Introducing a shared `<TableLink>` component now would require touching every one of the ~60 files anyway (to swap `<Link>` for `<TableLink>`), for no smaller a diff than fixing the className in place — so it buys nothing here, unlike a case where a shared component would centralize future changes at zero marginal file-touch cost.

**Alternatives considered**:
- **New shared `<TableLink>` component wrapping `next/link`**: rejected — same number of files touched as direct className edits, but adds a new abstraction and a naming/API surface (props for truncation, block/inline, etc. already vary per call site) that isn't needed to satisfy the spec. Revisit only if a *future* feature needs to change table-link behavior (not just weight) in one place.
- **Centralize via a new Tailwind `@layer` utility class (e.g., `.table-link`) in `app/globals.css`**: rejected — still requires editing all ~60 files to swap the className, plus adds an indirection that makes the actual rendered weight less obvious at each call site than a plain `font-semibold` utility class already does.

## Unknown: Exhaustive inventory of every in-table hyperlink and its current weight

**Decision**: Full inventory captured below, grouped by object type, each row categorized as (a) already `font-semibold`/600 — no change, (b) `font-medium`/500 — upgrade, (c) `font-bold`/700 — downgrade, or (d) no explicit weight anywhere on the link or its immediate parent — add `font-semibold`. This inventory is the direct input to `tasks.md`.

**Rationale**: The spec (FR-001–FR-003, FR-007) requires *every* in-table hyperlink, on *every* list/detail page, to end up at 600 — a task list built from a sample or "and similar files" shorthand would silently under-cover the feature (violating spec Assumption "no silent caps" implicit in "across webapp"). An Explore agent traced every `<Link>` in `app/**`, correlated each to its enclosing `Td`/wrapper (since a few instances derive their effective weight from a parent element rather than the link itself), and explicitly excluded non-table hyperlinks (breadcrumbs, nav, KPI/summary cards, icon-only action links with no visible text — font-weight is inapplicable to an icon).

**Findings by object type** (file counts of "needs a change" / total instances):

| Object type | Total instances | Needs change | Dominant issue |
|---|---|---|---|
| Orders | 21 | 11 | Mix of `font-medium` on parent `Td` (`tdBoldClass`) and no explicit weight (`tdClass`) in `FulfillmentTab.tsx`/`ReturnsTab.tsx` |
| Proposals | 59 | 2 | Already overwhelmingly consistent (`text-sm font-semibold ...` used almost everywhere); only `ProductsTab.tsx` has a `font-bold` outlier and a no-weight instance |
| Quotes | 54 | 51 | Nearly every detail-tab file uses `text-primary hover:underline font-medium`; 4 outliers are `font-bold` |
| Invoices | 16 | 15 | Same `font-medium` pattern, plus one `font-bold`-via-parent case |
| Purchase Orders | 35 | 33 | Same `font-medium` pattern throughout |
| Supplier Bills | 11 | 10 | Same `font-medium` pattern throughout |
| Shipments | 14 | 13 | Same `font-medium` pattern throughout, including some driven by a `TextCell`/`TC` helper's own className rather than the parent `Td` |
| Inventory | 1 | 1 (cosmetic — parent already `font-semibold`, but add directly to the link too for robustness) | N/A |
| Products | 1 | 1 | `font-bold` on a sibling `<div>`, not the `Td` |
| Admin / Admin-Portal | 0 | 0 | No in-table hyperlinks exist — all admin tables render plain text/badges/icon buttons |

Full file-by-file, line-by-line inventory with exact current and proposed className strings is preserved in the planning conversation and re-derived into individual `tasks.md` entries — every one of the ~176 "needs change" instances gets its own task line so nothing is silently skipped.

**Alternatives considered**: Sampling a handful of representative files and writing a "generalize to remaining files" task — rejected per spec FR-007 ("every list/landing page... not just a subset") and the project's own "no silent caps" norm (established in the `117-subtab-header-scrollbar` workflow, where scope was explicit about all 17+ consumers rather than a sample).

## Unknown: How to fix the ~150 instances of the single literal string `text-primary hover:underline font-medium` efficiently and safely

**Decision**: Use a scoped, literal (non-regex) find-and-replace of the exact string `hover:underline font-medium` → `hover:underline font-semibold` (and its few reordered variants, e.g. `font-medium hover:underline`) across the specific files identified in the inventory — not a repo-wide blind replace — followed by `npx tsc --noEmit` and a targeted visual check.

**Rationale**: A literal string replace scoped to the exact files already enumerated is as safe as hand-editing each line but far less error-prone/tedious than 150 individual `Edit` tool calls, and it cannot accidentally touch unrelated `font-medium` usage elsewhere in the app (e.g., a card label or a form hint) because the replacement target is the *combination* `hover:underline font-medium`/`font-medium hover:underline`, which per the inventory only appears on in-table links. Each of the handful of outlier cases (`font-bold`, no-explicit-weight, weight-on-parent/sibling) still gets an individual, hand-reviewed edit since those don't share one literal string.

**Alternatives considered**:
- **One Edit call per line for all 176 instances**: rejected as needlessly slow and error-prone for a mechanical, single-token substitution with a clearly-scoped literal match; reserved for the ~25 outlier cases that aren't a plain string swap.
- **Repo-wide `sed` across all of `app/`**: rejected — would risk touching `font-medium` usages outside of table links (e.g., any label or button elsewhere in the app that happens to use `font-medium`) since the match wouldn't be scoped to the identified files/contexts.

## Unknown: Testing approach

**Decision**: Same as `117-subtab-header-scrollbar` — manual/visual verification per `quickstart.md` (open a handful of representative list and detail pages, confirm link boldness looks uniform and matches `font-semibold` computed style), plus `npx tsc --noEmit` as a static sanity check. No new test infrastructure.

**Rationale**: No existing visual regression suite covers `app/**` table styling (confirmed in prior features' research). Constitution Principle V directs against adding new test infrastructure disproportionate to a CSS className fix.

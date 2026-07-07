# Research: Remove Ellipsis Truncation from Data Table Headers

## Decision 1: Where the truncation actually happens

**Decision**: The ellipsis comes from Tailwind's `truncate` utility (`overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`) applied to the header label `<span>` inside `components/ui/SortableHeader.tsx`, gated by a `truncate` prop that **defaults to `true`**. When `truncate` is `false`, the component instead applies `whitespace-nowrap` (no wrap, no ellipsis, cell/column width grows or content overflows visibly).

**Rationale**: Confirmed by inspection: `SortableHeader.tsx:72` — `` `text-${align} block w-full ${truncate ? 'truncate' : 'whitespace-nowrap'}` ``. 88 of ~89 files that use `SortableHeader` already pass `truncate={false}` explicitly per call. The one reported broken table, `app/orders/[id]/components/LineTaxesTab.tsx`, omits the prop on all 14 of its header calls (lines 74–87) and therefore silently inherits the truncating default — this is the exact bug the user flagged. One additional table, `app/configure/page.tsx`, doesn't use `SortableHeader` at all; its headers are raw `<th className="... truncate">` cells (lines 635–642).

**Alternatives considered**:
- *Patch only `LineTaxesTab.tsx`* (add `truncate={false}` to its 14 calls): fixes the reported symptom but leaves the component's default truncating, so any future or currently-missed call site keeps showing ellipses — doesn't satisfy "remove ellipses for all datatable headers."
- *Remove the `truncate` prop and CSS branch entirely from `SortableHeader`*: functionally equivalent to flipping the default, but is a larger diff (touches the component's public API/type) for no behavioral gain, and would still require touching the raw-markup outlier separately.

## Decision 2: Flip the component default instead of touching every call site's behavior

**Decision**: Change `truncate = true` to `truncate = false` in the `SortableHeaderProps` default (`components/ui/SortableHeader.tsx:26`). Then, as a cleanup, remove the now-redundant explicit `truncate={false}` prop from the ~88 call sites that pass it today, since it becomes a no-op matching the new default. The `truncate` prop itself is kept (not deleted) in case a future table genuinely needs the old clipped behavior, but no call site will pass `truncate={true}` today (confirmed zero occurrences).

**Rationale**: One-line change in the shared component fixes every current and future call site that omits the prop (closing the class of bug that caused the reported issue), matches the constitution's "UI Component Conventions" requirement that data tables use `SortableHeader` as the single point of truncation policy, and is the minimal-diff option (Principle V — simplicity).

**Alternatives considered**:
- *Add `truncate={false}` to `LineTaxesTab.tsx` only, leave the default as-is*: rejected — same class of bug could resurface on the next new table that forgets the prop; doesn't achieve "all datatable headers."
- *Introduce a new wrapper/HOC around all data tables*: rejected as over-engineering for a one-line CSS behavior change (violates Principle V / YAGNI).

## Decision 3: Visual behavior when a header label doesn't fit its column width

**Decision**: Keep the existing `whitespace-nowrap` behavior that the `truncate={false}` path already uses throughout the app today (confirmed visually consistent across ~88 existing tables). The header cell does not wrap to a second line; instead the label renders on one line and, if the label is wider than the resizable/fixed column width, the column visually accommodates it via the existing resizable-column and horizontal-scroll mechanics already in place for these tables. No new wrapping behavior is introduced.

**Rationale**: This is the behavior every other data table in the app already exhibits (88 of 89 files), so it is the established, tested pattern — not a novel choice. Introducing wrapping only for the previously-broken tables would create visual inconsistency across the app, which contradicts the spec's "consistently... on all data tables" requirement (FR-002).

**Alternatives considered**:
- *Wrap long labels onto a second line*: rejected — would make the previously-broken tables look different from the other 88 already-correct tables, creating a new inconsistency instead of fixing the old one.

## Decision 4: Testing/validation approach

**Decision**: No automated test suite exists for these presentational table components (`npm run test:rbac` only covers RBAC, not UI rendering). Validation is manual: use the `/verify` skill to run the dev server and visually confirm, per the spec's acceptance scenarios — (a) the order line Taxes tab and its invoice/quote-line siblings show no header ellipsis, (b) a sample of other data tables (e.g. Fulfillment tab, an admin list) still render headers correctly, and (c) a table with long body cell values still truncates those cells with an ellipsis (regression check for FR-003).

**Rationale**: Matches how prior data-table correction features in this repo (e.g. `044-table-scroll-pagination-fix`, `007-group-dropdown-search-scroll`) were verified — visually, via the running app — since there is no existing Jest/Playwright/RTL harness for these components to extend.

**Alternatives considered**:
- *Add a new automated visual/DOM test harness for this fix*: rejected as disproportionate scope for a CSS default flip (Principle V), and no existing test infrastructure/convention to build on.

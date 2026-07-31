# Quickstart: Validating the Shared Status Badge Component

## Prerequisites

- Local dev server running (`npm run dev`).
- Access to at least one record of each type: Order, Proposal, Quote, Purchase Order, Supplier Bill, Invoice, Shipment, and an Admin Location — ideally including a record whose status is one of the 10 resolved-conflict statuses (`data-model.md`), to directly observe the intentional color change.

## Scenario 1 — No visual regression on non-conflicting statuses

1. Before making any code change, screenshot (or note) the current color of a status that was consistent everywhere (e.g., "Pending" — yellow, "Approved" on a non-Invoice page — green) on 3–4 different pages.
2. After migrating those pages to the shared component, revisit the same pages and confirm the color is unchanged.
3. **Expected**: pixel-for-pixel same color; only the underlying code changed (local function → shared import).

## Scenario 2 — Documented color changes land exactly where expected

1. Using `data-model.md`'s "Conflicts resolved" table, pick 3 of the 10 changed statuses (e.g., Invoice "Cancelled", a Quote sub-tab's "Closed", Admin Locations "Inactive").
2. Visit the specific pages listed for each and confirm the badge now shows the new resolved color.
3. Visit a page for that same status that was *not* listed as changing (already had the majority color) and confirm it looks the same as before.
4. **Expected**: color changes appear only on the exact pages documented, nowhere else.

## Scenario 3 — Badge shape is preserved per page

1. Open a page known to use the `'pill'` variant (e.g., Orders list) and a page known to use `'bordered'` (e.g., Supplier Bills list) and a page known to use `'compact'` (Proposal Products tab).
2. **Expected**: each retains its pre-existing shape (fully-rounded plain pill / bordered box / small non-fully-rounded badge) — none have changed shape as a side effect of sharing color logic.

## Scenario 4 — Special-case call sites behave identically to before

1. Admin Locations → open a location's delivery windows page. **Expected**: the Active/Inactive stat badge still renders correctly (now via `status={active ? "Active" : "Inactive"}` instead of a boolean prop).
2. Proposal → Products tab → find a line with no status set. **Expected**: still shows a plain gray dash (`-`), not a broken or empty badge.
3. Shipments list → find a shipment with no status. **Expected**: still shows "N/A", not blank.

## Scenario 5 — No independent local implementations remain

1. Run `grep -rl "function StatusBadge" app/` from the repo root.
2. **Expected**: zero results — every one of the 34 files has been migrated to import from `components/ui/StatusBadge.tsx` instead.
3. Run `grep -rn "import.*StatusBadge.*components/ui/StatusBadge" app/ | wc -l` and confirm the count is at least 34 + 10 = 44 (all migrated files plus the original 10 consumers).

## Cross-cutting checks

- Toggle light/dark mode on a few pages of each variant (`pill`/`bordered`/`compact`) and confirm all remain legible.
- Confirm `npx tsc --noEmit` is clean after all 34 files are migrated.

## Done when

- All 5 scenarios above pass.
- `grep -rl "function StatusBadge" app/` returns nothing.
- Every one of the 10 documented color changes (`data-model.md`) is visible exactly where expected, and nowhere else.

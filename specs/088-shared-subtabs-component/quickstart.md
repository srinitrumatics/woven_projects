# Quickstart: Validating the Shared Underline SubTabs Component

## Prerequisites

- Local dev server running (`npm run dev`) — no new dependency to install for this feature.
- A logged-in session with access to: an Order (with Fulfillment/Returns sub-tabs), a Proposal and a Proposal Line, a Purchase Order and a PO Line, a Quote and a Quote Line, a Supplier Bill, and an Invoice with payments.

## Scenario 1 — Visual consistency across all 18 migrated sub-tab bars (User Story 1)

For **each** of the 6 modules below, open the page and locate its nested underline sub-tab bar:

1. Order Detail → Fulfillment tab / Returns tab.
2. Proposal Detail → Fulfillment/Purchases/Returns tabs; then a Proposal Line Detail → same trio.
3. Purchase Order Detail → Returns tab; then a PO Line Detail → Returns tab.
4. Quote Detail → Fulfillment/Purchases/Returns tabs; then a Quote Line Detail → same trio.
5. Supplier Bill Detail → Payments tab (Bill Payments / Applied Debits sub-tabs).
6. Invoice Detail → Payments tab.

**Expected**: all render identical active-tab (`border-primary text-primary`) and inactive-tab styling, in both light and dark mode. Specifically re-check the 3 previously-broken cases:
- Purchase Order Detail's and PO Line Detail's Returns sub-tabs now show visible, legible dark-mode styling (previously had none at all).
- Supplier Bill Detail's Payments sub-tabs now show visible, legible dark-mode styling (previously had none at all).
- Hovering an inactive tab in Quote Line Detail's Returns sub-tab now visibly changes its text color in dark mode (previously silently broken by the `dark:hover:white` typo).

## Scenario 2 — Tab-switching behavior is unchanged (User Story 1)

For at least 3 of the 18 migrated sub-tab bars (pick from different modules):

1. Click each sub-tab in turn.
2. **Expected**: the correct content panel displays for each, counts (if any) match the same values shown before migration, and the previously-active tab's styling correctly switches to inactive.

## Scenario 3 — The 3 pill-tab duplicate sites now match the real `Tabs.tsx` (User Story 2)

1. Open Order Detail's view-mode tabs (Add Products / My Order / Taxes / Fulfillment / Returns / Files) and compare their border color side-by-side against a page that already correctly imports `Tabs.tsx` (e.g. the Invoices list page's top tabs).
2. Open a Quote Line Detail page's top tab row and do the same comparison; also confirm no visual double-space/spacing artifact remains.
3. Open a PO Line Detail page's "Related Items" tabs and confirm the inactive tabs now show a visible border (previously missing entirely).
4. **Expected**: all 3 now render with the exact same border/background/hover treatment as `Tabs.tsx`'s other 8 existing call sites.

## Scenario 4 — Role-based tab filtering still works (Quote Line Detail top tabs)

1. As a Customer or NSO-type account, open a Quote Line Detail page.
2. **Expected**: the "Purchases" tab is still correctly hidden (pre-existing filtering logic, untouched by this migration) — only the tab bar's shell changed, not which tabs are shown to which account types.

## Cross-cutting checks

- Toggle dark mode and re-check Scenario 1 — every migrated sub-tab bar and all 3 pill-tab sites must remain legible and correctly styled.
- Run `grep -rn "border-transparent" app/ --include="*.tsx" | grep "border-b-2"` (or equivalent) and confirm no remaining hand-rolled underline sub-tab bar exists outside `components/ui/SubTabs.tsx` itself, among the 18 in-scope files.
- Confirm none of the 11 explicitly out-of-scope `QuoteLine*` content-panel files were modified (`git diff` should show no changes to them).
- Confirm `npx tsc --noEmit` is clean.
- Confirm `package.json`/`package-lock.json` show **zero** new dependencies (unlike `087`, this feature adds none).

## Done when

- All 4 scenarios above pass in both light and dark mode.
- The 18 in-scope sub-tab bars show zero remaining self-rolled underline-tab markup (Scenario 1's grep check).
- The 3 pill-tab duplicate sites show zero remaining hand-rolled duplicate of `Tabs.tsx`.
- No regressions in any of the 18 sub-tab bars' or 3 pill-tab sites' existing tab-switching/content/count/filtering behavior.
- The 11 explicitly out-of-scope `QuoteLine*` files are confirmed untouched.

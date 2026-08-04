# Quickstart: Validating Tab & Pagination Spacing Consistency

## Prerequisites

- Local dev server running (`npm run dev`) — no new dependency to install for this feature.
- A logged-in session with access to: Proposal Detail (one with Fulfillment/Purchases/Returns data), Quote Detail (same), Order Detail, Purchase Order Detail, Invoice Detail, Supplier Bill Detail, and their respective Line Detail pages, plus the Shipments list page and at least one other list page (e.g. Proposals or Purchase Orders).

## Scenario 1 — Proposal and Quote Detail: tabs no longer flush against content

1. Open a Proposal Detail page, view any top-level tab (e.g. Fulfillment), and confirm a clear gap now exists between the pill tab row and the sub-tab row / content below it.
2. Repeat on a Quote Detail page.
3. Compare the gap side-by-side with a Purchase Order Detail or Invoice Detail page's equivalent boundary — should read as visually consistent, not tighter.

## Scenario 2 — Every nested sub-tab bar has the same spacing below it

1. Open the Fulfillment sub-tabs on: Orders, Proposals, Quotes, Purchase Orders (Returns), Supplier Bills (Payments), Invoices (Payments). Confirm the gap below the sub-tab row looks identical across all of them.
2. Open `app/proposals/[id]/lines/[lineid]` → Fulfillments Lines tab specifically — before this fix, this sub-tab row was missing its horizontal layout, gap, and underline border entirely (`className="mb-6"` replaced everything). Confirm it now renders as a proper horizontal underline tab row, matching every other sub-tab bar.
3. Open `app/proposals/[id]/lines/[lineid]` → Purchases Lines tab — confirm it still has its extra horizontal/top inset (this panel has no other padding source) alongside the now-standard spacing below the tab row.
4. Open the Quote Detail Fulfillment/Purchases/Returns sub-tabs — confirm they no longer sit flush (`mb-0`) against their content, and no longer have a stray horizontal `px-4` inset that no sibling module has.

## Scenario 3 — Shipments list page's pagination matches every other list page's

1. Open the Shipments list page — confirm the Previous/page-number/Next control at the bottom no longer sits on a shaded gray background band.
2. Compare it side-by-side with the Proposals or Purchase Orders list page's pagination row — should look the same.

## Cross-cutting checks

- Toggle dark mode and re-check Scenarios 1–3 — all fixes should remain legible and correctly styled.
- Confirm `npx tsc --noEmit` is clean.
- Confirm tab-switching still works correctly everywhere `SubTabs` is used (clicking a sub-tab still changes `activeKey` and re-renders the right content) — no behavioral regression, spacing-only changes.
- Confirm `git diff` touches only the 17 files listed in `data-model.md`'s fix tables — no incidental changes to business logic, data fetching, or Salesforce calls (FR-006).

## Done when

- Scenario 1 passes on both Proposal and Quote Detail pages, in both light and dark mode.
- Scenario 2 passes across all modules with nested sub-tabs, including the previously-broken `LineFulfillmentsTab.tsx` layout and the previously-zero-gap Purchase Order/Supplier Bill sub-tabs.
- Scenario 3 passes on the Shipments list page.
- Purchase Order, Invoice, Supplier Bill, and Order Detail pages show zero visible change.
- `npx tsc --noEmit` is clean and no business-logic files were touched.

# Quickstart: Validating Quick Wins & Dead Code Cleanup

## Prerequisites

- Local dev server running (`npm run dev`) — no new dependency to install for this feature.
- A logged-in session with access to: Quote Detail (a quote with Sales Orders), Configure (a page with the "+Add Group" dropdown), the Products catalog, an Order Detail page, Reports, Inventory List, Purchase Order List, and a Shipment Detail page.

## Scenario 1 — Invalid Tailwind classes now render as intended

1. Open a Quote Detail page's Sales Orders sub-tab and confirm its pagination wrapper now has visible padding (previously zero).
2. Open Configure and click "+Add Group" — confirm the dropdown renders at its intended width.
3. Open the Products catalog (card view) — confirm each card's name and description respect a consistent minimum width, and the product name reads visibly larger than the description below it.
4. Open an Order Detail page and trigger the image-preview tooltip (hover a product thumbnail) — confirm its icon placeholder box renders at its intended width.

## Scenario 2 — Dead files and filename are gone

1. Confirm `app/configure/configure.css` and `app/quotes/[id]/components/QuoteScopeSummary.tsx` no longer exist.
2. Confirm `app/purchase-orders/[id]/lines/[lineid]/components/POSerialNumberLogLinesTab.tsx` exists (renamed) and the old lowercase file does not.
3. Open a Purchase Order Line Detail page's Serial Number Log tab — confirm it renders exactly as before.

## Scenario 3 — Interactive elements behave honestly

1. Open the Reports page — confirm "Generate Report" is visibly disabled (dimmed, `cursor-not-allowed`, no click response).
2. Open the Inventory List — click the "Average Aged" stat card and confirm the table filters to show only aged inventory items, with the card itself showing an active/selected state matching its 3 siblings.
3. On a narrower viewport (or the compact filter row), confirm an "Average Aged" option is available and produces the same filtered result as the card.
4. Open the Purchase Order List — confirm no eye icon or empty "Action" column remains, and that clicking a PO's own linked fields (PO#, quote, proposal, order) still navigates correctly.

## Scenario 4 — Shipment Detail's dead tab is gone, working modal is unaffected

1. Open a Shipment Detail page — confirm the tab bar shows only Shipping Manifest Lines / Inventory Positions / Serial Numbers Logs / Files (no "Tracking" tab ever existed in the UI, so no visible change here).
2. Click the "Track Timeline" button (in the manifest summary area) — confirm the modal opens and displays tracking data exactly as before.
3. Confirm `app/shipments/[id]/components/PlaceholderTabs.tsx` no longer exists.

## Cross-cutting checks

- Toggle dark mode and re-check Scenarios 1 and 3 — all fixes should remain legible and correctly styled.
- Confirm `npx tsc --noEmit` is clean.
- Confirm `git diff` touches only the 10 files listed in `data-model.md` — no incidental changes to business logic, data fetching, or Salesforce calls (FR-014).

## Done when

- All 4 scenarios above pass in both light and dark mode.
- The 2 confirmed-dead files and the now-fully-dead `PlaceholderTabs.tsx` no longer exist.
- The renamed file's single call site works with zero behavior change.
- All 3 interactive-element fixes behave as specified (disabled, wired-up, removed).
- Shipment Detail's working "Track Timeline" modal shows zero regressions.

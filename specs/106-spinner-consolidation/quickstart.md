# Quickstart: Spinner Consolidation

Manual/visual verification, consistent with `077`-`105` (no automated UI test suite exists in this repo). Run `npm run dev` with a live Salesforce-connected session, throttling the network (browser dev tools) to see loading states long enough to inspect.

## Scenario 1 — Full-page loading spinners (US1)

1. Open several of the 16 migrated pages (e.g., Invoice Detail, Order Create, Profile, Quote Detail, Shipment Detail) while data is loading. Confirm each renders the identical spinner: same size, same color, same centering.
2. For the pages that previously showed a text label (Order Create: "Creating new order...", Order Line Detail: "Loading order line details...", Product Line Detail: "Loading product details...", Quote Detail: "Loading quote details...", Shipment Detail: "Loading shipment details..."), confirm that label still appears beneath the spinner.
3. Confirm each page's real content, once loaded, is completely unaffected.

## Scenario 2 — Tab-panel loading spinners (US2)

1. Open a Product's Compliance Certs and Datasheets tabs while loading; confirm each renders the smaller spinner with its original text label.
2. Open a Product's Edit modal's datasheet/certification upload sections while loading; confirm the spinner is now the brand color (previously off-brand blue).
3. Open any table built on the shared `DataTable` component in a loading state; confirm it now renders the shared spinner (vertically stacked with its message, if any) instead of the old horizontal layout.
4. Open Home while a background dashboard refresh is in progress; confirm the overlay spinner is now the brand color with its "Updating dashboard..." label intact.
5. Open a Quote Line's Fulfillments/Purchases/Returns tabs and a Purchase Order/Supplier Bill line's sub-tab while loading; confirm each renders the smaller shared spinner.

## Final checks

- `npx tsc --noEmit` — no new type errors introduced.
- No console errors in the browser dev console across both scenarios.
- `git diff --stat` touches only the 25 files listed in `plan.md`'s Project Structure (24 consumer files + `LoadingSpinner.tsx` itself) — no business logic, data-fetching, or Salesforce changes anywhere in the diff.
- Confirm none of the ~25+ inline button/icon spinners (save buttons, FilesTab uploads, refresh icons) show any diff.

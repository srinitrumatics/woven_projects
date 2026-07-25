# Quickstart: Validating Consistent Tab, Table & Typography Styling

This feature has no automated UI test suite in this repo — validation is manual/visual, following the spec's acceptance scenarios and success criteria.

## Prerequisites

- Local dev environment set up per `CLAUDE.md` (`npm install`, `DATABASE_URL` set; Salesforce/Algolia creds optional — services fall back to mock data).
- `npm run dev` running at `localhost:3000`.
- A logged-in session (main portal auth) with access to at least: an Order, a Quote, a Proposal, an Invoice, a Shipment, a Purchase Order, a Supplier Bill, and a Product.

## Validation steps

1. **Start the app**: `npm run dev`.
2. **Tab consistency (US1 / FR-001, FR-002)**:
   - Open a Quote detail page and a Purchase Order detail page in two browser tabs.
   - Compare: tab pill padding, gap between tabs, active-tab indicator, hover state, and the vertical gap between the tab bar and the table below — all should match exactly.
   - Repeat for Invoice, Shipment, Supplier Bill, Proposal, and Product detail pages. Confirm the Product page's tabs now render the same pill style as the others (no underline style remaining).
3. **Table consistency (US2 / FR-003, FR-004, FR-010)**:
   - On the same set of pages, compare header-row padding/font-weight, cell padding, borders, and row-hover/alternating background across at least 3 different tables (e.g., Quote Lines, PO Lines, Supplier Bill Lines).
   - Find a table with enough columns to require horizontal scroll; confirm header/cell/border styling is preserved inside the scrollable area.
   - Confirm existing sort (`SortableHeader`) and pagination (`Pagination` component) still function identically to before the change.
4. **Typography consistency (US3 / FR-005, FR-006, FR-007)**:
   - Inspect a table cell's primary value on two different pages — confirm identical font-family, font-size, and color.
   - Inspect a muted/secondary text element (e.g., a timestamp or helper caption) on two different pages — confirm identical font-size/color.
   - Open `app/home/page.tsx` and confirm the previously hardcoded `text-[13px]`/`text-[12px]`/etc. pixel sizes have been replaced with the shared semantic text-style roles.
   - Open dev tools, confirm the computed `font-family` on `<body>` (or a representative page element) matches the fixed `tailwind.config.ts` `fontFamily.sans` value.
5. **Dark mode (FR-009)**:
   - Toggle dark mode (`ThemeContext`) and repeat steps 2-4, confirming the same consistency holds in dark mode using the app's existing light/dark color pairs.
6. **No regression check (FR-008)**:
   - Confirm tab labels, tab order, and table columns/data on every page visited above are unchanged from before the migration — only visual chrome should differ.

## Expected outcome

All of the above comparisons show identical styling across pages (per spec SC-001/SC-002), with zero remaining hardcoded pixel font sizes or hex colors in the pages touched (SC-003), and no functional regression in sorting, pagination, resizing, or tab switching.

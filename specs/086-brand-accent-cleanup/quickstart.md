# Quickstart: Validating the Brand Accent Color Cleanup

## Prerequisites

- Local dev server running (`npm run dev`).
- A logged-in session with access to Search, Configure, and Admin (Organizations + Dashboard), plus a Product with a gallery, and one line-detail page each for Invoices, Shipments, Quotes, and Delivery Windows.

## Scenario 1 — Search page (User Story 1)

1. Open the Search page and browse results.
2. **Expected**: price badges, category labels, the "View" button, loading spinners, "Load More", and filter checkboxes/links all render in the app's brand blue (`primary`), not indigo.
3. Click into the search input. **Expected**: the focus ring is the brand color, not generic blue.
4. Run: `grep -n "indigo\|blue-500" app/search/SearchClientPage.tsx` — expected: zero results.

## Scenario 2 — Configure "+Add Group" (User Story 2)

1. Open Configure, use "+Add Group" to create a new line group.
2. **Expected**: the "+Add Group" button, its inputs' focus states, and the confirm button all render in the brand color.
3. Look at the resulting grouped rows and their subtotal figure. **Expected**: group-row highlighting and the subtotal figure use the brand color family, not indigo.
4. Check the group-depth tag coloring (nested groups). **Expected**: no purple tag remains; the 4-color set (gray/blue/green/brand) is still visually distinct at each level.
5. Run: `grep -n "purple\|indigo" app/configure/ConfigureOrderClientPage.tsx` — expected: zero results.

## Scenario 3 — Admin Organizations + Dashboard tile (User Story 3)

1. Open the Admin Dashboard. **Expected**: the Organizations tile icon uses the brand color (a light-blue bubble with a brand-blue icon), not orange.
2. Open Organizations. **Expected**: page background, header bar, primary action button, any modal, form field focus rings, section headers, row icons, active-tab state, and empty state all use the brand color — no orange, amber, indigo, or purple visible anywhere.
3. Compare visually against Authorize Locations (a sibling admin page). **Expected**: both feel like the same product now.
4. Run: `grep -n "orange\|amber\|indigo\|purple" app/admin/organizations/page.tsx app/admin/page.tsx` — expected: zero results (the one former purple badge should now read as a neutral gray identifier chip, not any themed color).

## Scenario 4 — Line-detail "Back" buttons (User Story 4)

1. Open an Invoice, Shipment, and Quote line-detail page, and a Delivery Window detail page. Note each "Back" button's color.
2. **Expected**: all 4 visually match the "Back"/"Back to X" button on Order, Purchase Order, Proposal, and Supplier Bill line-detail pages (the brand color, not a slightly-different blue).
3. Run: `grep -rn "A7C7E7\|8FB8DE" app/` — expected: zero results anywhere in the codebase.

## Scenario 5 — Product Gallery (User Story 5)

1. Open a product with multiple images (or none, to see the placeholder).
2. **Expected**: the main image-display panel background and the "No Image" placeholder box both read as shades from the brand blue family, not a slightly-off separate blue.
3. Run: `grep -n "E8F1FC\|9BB8F4" "app/products/[id]/components/ProductGallery.tsx"` — expected: zero results.

## Cross-cutting checks

- Toggle dark mode on and re-check all 5 scenarios above — every touched element must remain legible and correctly colored in dark mode, not just light mode.
- Confirm the following are all **unchanged** (spot-check, since these are explicitly out of scope): `app/(admin-portal)/admin-login` still shows its own indigo/blue gradient Sign In button; `components/ui/StatusBadge.tsx` still colors "sent"/"under review" purple and "negotiation"/"viewed" indigo; `app/home/page.tsx`'s "Pending Quotes"/"View Quotes" tiles are still purple; file-type icons (image=purple, ZIP=amber) in the Files tabs are unchanged.
- Confirm `npx tsc --noEmit` is clean (expected trivially, since this feature only changes string literals in className props, but confirm anyway).

## Done when

- All 5 scenarios above pass in both light and dark mode.
- The 5 greps (Scenarios 1-3, 5) each return zero results.
- None of the explicitly-out-of-scope elements changed.

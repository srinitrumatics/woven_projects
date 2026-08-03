# Quickstart: Validating the Shared Modal Component

## Prerequisites

- Local dev server running (`npm run dev`) after `npm install` has picked up `@radix-ui/react-dialog`.
- A logged-in session with access to: Products (a product to edit, with certifications and datasheets), Admin Authorize Locations (a location) and its Delivery Windows, a Shipment with tracking data, and an Order Line's product catalog view.
- A screen reader (VoiceOver on macOS, NVDA on Windows, or Chrome DevTools' Accessibility panel as a lighter-weight substitute) for the announcement checks.

## Scenario 1 — Keyboard and focus behavior (User Story 1, all 8 modals)

For **each** of the 8 migrated modals:

1. Open the modal via its normal trigger (button/link).
2. Press **Escape**. Expected: the modal closes.
3. Re-open it. Press **Tab** repeatedly. Expected: focus cycles only among the modal's own interactive elements (inputs, close button, footer buttons) — it never reaches the page content behind the modal.
4. Close the modal (via Escape, the close button, or completing its action). Expected: keyboard focus visibly returns to the element that opened it (the trigger button/link).
5. With a screen reader active, open the modal. Expected: it's announced as a dialog, and its title is read.

## Scenario 2 — Visual consistency (User Story 2)

1. Open `AddProductModal` (Products list → Add/Edit Product) and `AddToOrderModal` (Product Detail → Add to Order) back to back.
2. **Expected**: identical corner rounding, shadow depth, close-button style/position, and open/close animation — differing only in width.
3. Repeat comparing any 2 more modals from different modules (e.g. `LocationModal` vs. `TrackingTimelineModal`).
4. Run: `grep -rln "fixed inset-0.*bg-black/50" app/ --include="*.tsx"` and confirm the only remaining hits are inside `components/ui/Modal.tsx` itself (or zero, if the shared component uses a different implementation detail) — no modal file should still define its own backdrop.

## Scenario 3 — Products module regression check (User Story 3)

1. Create a new product via "Add Product", confirm it saves and appears.
2. Edit an existing product, confirm changes save.
3. From a product detail page, use "Add to Order", choose/create an order, confirm the product is added.
4. Add a new Certification to a product, confirm it saves and appears in the list; edit an existing one.
5. Add a new Datasheet to a product, confirm it saves; edit an existing one.
6. **Expected**: every one of the above behaves exactly as before this feature — only the modal shell changed.
7. Confirm `AddProductModal`'s `inlineMode` usage (wherever it's embedded inline in a page) still renders with no overlay/shell at all, unchanged.

## Scenario 4 — Locations/Delivery-Windows regression check (User Story 4)

1. Add, edit, and view a Location via `LocationModal` — confirm existing save/view behavior is unchanged.
2. Add and edit a Delivery Window — confirm existing save behavior is unchanged, and confirm the modal now has a real, visible open/close animation (previously this modal's animation classes were dead/non-functional).

## Scenario 5 — Tracking Timeline regression check (User Story 5)

1. Open the Tracking Timeline modal from a Shipment.
2. **Expected**: shares the shared shell; its content/data behavior (including its known mock-data-fallback quirk, if triggered) is unchanged — this feature does not touch that logic.

## Scenario 6 — Product Catalog image popup (User Story 6)

1. From an Order Line's product catalog view, click a product image to open the enlarged popup.
2. **Expected**: behaves like every other migrated modal (Escape closes it, focus trap, consistent shell), while still only displaying the image with no other content change.

## Cross-cutting checks

- Toggle dark mode and re-check Scenarios 1–2 — every migrated modal must remain legible and correctly styled.
- Resize the browser to a common mobile width (e.g. 375px) and open each modal — confirm no modal's content is cut off or unreachable (FR-012).
- Open a modal, then trigger a second modal from within it if any such nested case exists in the app (e.g. a confirmation inside a modal) — confirm the topmost dialog's focus trap still works correctly.
- Confirm `npx tsc --noEmit` is clean.
- Confirm `package.json`/`package-lock.json` show exactly one new dependency (`@radix-ui/react-dialog`) and its resolved version has no React 19 peer-dependency warnings during `npm install`.

## Done when

- All 6 scenarios above pass in both light and dark mode.
- The 8 in-scope modals show zero remaining self-rolled overlay/shell code (Scenario 2's grep).
- No regressions in any of the 8 modals' existing content/save/view behavior.
- `AddProductModal`'s `inlineMode` path is confirmed unaffected.
- `TrackingTimelineModal`'s data logic and `Sidebar.tsx`'s mobile drawer are confirmed unchanged.

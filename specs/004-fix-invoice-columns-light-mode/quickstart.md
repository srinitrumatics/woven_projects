# Quickstart Validation Guide: Fix Invoice List Columns Invisible in Light Mode

**Feature**: `specs/004-fix-invoice-columns-light-mode`
**Date**: 2026-06-24

## Prerequisites

- Dev server running: `npm run dev` (localhost:3000)
- Logged in as a user with access to the invoice list (`/invoices`)
- Application is set to **light mode** (toggle via the theme control if available, or verify OS/browser is not forcing dark mode)

## Validation Scenarios

### Scenario 1 — Sales Order column visible in light mode

1. Open `http://localhost:3000/invoices` in Chrome (or any browser) in **light mode**
2. Locate a row that has a Sales Order number
3. **Expected**: The Sales Order value is displayed in dark text (near-black) against the white table background — clearly readable

### Scenario 2 — Purchase Order link visible in light mode (non-manufacturer user)

1. On the same page in light mode, locate a row with a linked Purchase Order
2. **Expected**: The Purchase Order value appears as a coloured link (brand primary colour). This path was already correct; confirm no regression.

### Scenario 3 — Purchase Order plain text visible in light mode (manufacturer user)

1. Log in as a manufacturer user (or test with a user where `isManufacturer` is true)
2. Navigate to `/invoices` in light mode
3. Locate a row with a Purchase Order
4. **Expected**: The Purchase Order value appears as plain dark text, not a link — clearly readable against the light background

### Scenario 4 — "N/A" fallback visible in light mode

1. On the invoice list in light mode, locate a row where no Purchase Order is linked
2. **Expected**: The cell shows "N/A" in dark text — clearly readable

### Scenario 5 — Dark mode regression check

1. Switch the application to **dark mode**
2. Navigate to `/invoices`
3. **Expected**: Sales Order and Purchase Order columns remain readable in dark mode — white or light-grey text against the dark table background. No regression from the fix.

## Known Limitations

- No automated test suite for this component. All validation is manual.
- The manufacturer-user path (Scenario 3) requires either a manufacturer account or mocking `isManufacturer = true` in the component during testing.

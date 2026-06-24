# Quickstart Validation Guide: Fix Duplicate React Key — [object Object]

**Feature**: `specs/006-fix-duplicate-react-key`
**Date**: 2026-06-24

## Prerequisites

- Dev server running: `npm run dev` (localhost:3000)
- Logged in as a user with a Salesforce-connected account
- Browser DevTools open (Console tab visible)

## Validation Scenarios

### Scenario 1 — No key warning in console

1. Open browser DevTools → Console tab
2. Navigate to `http://localhost:3000/configure`
3. Wait for page to load (allow ~1–2s for picklist fetch)
4. Click "+ Add Group"
5. **Expected**: No "Encountered two children with the same key" warning appears in the console

### Scenario 2 — Picklist group items display readable labels

1. Click "+ Add Group" after page load
2. Inspect the "Product Groups" list in the dropdown
3. **Expected**: Each item shows a human-readable group name (e.g., "AV Components", "Networking") — not `[object Object]`

### Scenario 3 — Each group item is individually clickable

1. Open "+ Add Group" dropdown
2. Click one of the picklist group names
3. **Expected**: The clicked group's name (the readable string) is added as a row in the line table; the dropdown closes; the correct group name appears in the row header
4. Repeat for a second group — the second group name must be different from the first

### Scenario 4 — Custom group name input unaffected

1. Open "+ Add Group" dropdown
2. Type a custom name and press Enter (or click "Add")
3. **Expected**: The custom group row is added correctly — no change in behavior from before the fix

### Scenario 5 — No empty or undefined group items appear

1. Open "+ Add Group" dropdown
2. **Expected**: Every item in the "Product Groups" section has a non-empty, visible label — no blank rows, no `undefined`, no `null` entries

### Scenario 6 — Empty picklist degrades gracefully (mock/dev mode)

1. Start server without Salesforce credentials (mock mode)
2. Navigate to `/configure`, click "+ Add Group"
3. **Expected**: No "Product Groups" section is shown; only the custom input is visible; no console errors or warnings

## Known Limitations

- Validation requires a live Salesforce connection to reproduce the `{value, label}` object shape. In mock mode, only the empty-state scenario (Scenario 6) can be validated.
- If the Salesforce sandbox has `Product_Grouping__c` configured to return plain strings, the bug is not visible before the fix — use DevTools Network to confirm the raw API response shape.

# Quickstart Validation Guide: Configure Group Dropdown from Product Grouping

**Feature**: `specs/003-configure-group-dropdown`
**Date**: 2026-06-24

## Prerequisites

- Dev server running: `npm run dev` (localhost:3000)
- Logged in as a user with a Salesforce-connected account, OR the app is running in mock-data fallback mode (SF credentials absent)
- Product catalog endpoint returns products with at least some `Grouping__c` / `Product_Grouping__c` values set, OR mock data includes varied `groupingLabel` values

## Validation Scenarios

### Scenario 1 — Catalog-derived groups appear in dropdown

1. Navigate to `/configure`
2. Wait for the page to load (product catalog fetches in the background)
3. Click "+ Add Group"
4. **Expected**: Dropdown shows a list of group names derived from the catalog's `groupingLabel` values, deduplicated and sorted alphabetically. No hardcoded "AV Components", "Networking", or "Cables & Wiring" entries appear in the primary list.

---

### Scenario 2 — Clicking a catalog-derived group adds a row

1. Open the "+ Add Group" dropdown (Scenario 1 must pass)
2. Click any label from the grouping list
3. **Expected**: A group row with that label name appears in the line table. The dropdown closes.

---

### Scenario 3 — Empty groupingLabel values are excluded

1. Inspect the catalog (via browser DevTools network tab, `/api/salesforce/orders?action=products` response)
2. Note how many products have a non-empty `Grouping__c` / `Product_Grouping__c`
3. Open the dropdown
4. **Expected**: The list shows exactly the distinct non-empty values from step 2. Products with empty/undefined grouping do not contribute a blank entry.

---

### Scenario 4 — Custom group input still works

1. Open the "+ Add Group" dropdown
2. Type a name in the custom input at the bottom and press Enter (or click "Add")
3. **Expected**: A group row with that custom name is added. The dropdown closes.

---

### Scenario 5 — Catalog not loaded (empty state)

1. Open the page before the catalog fetch completes (hard refresh + slow network, or test with no SF credentials so catalog stays empty)
2. Click "+ Add Group"
3. **Expected**: No grouping label list items appear. Only the custom input section is visible. No JS error in console.

## Known Limitations

- There is no automated test suite for this component. All validation is manual.
- If the Salesforce sandbox has no `Grouping__c` data, Scenario 1 will show an empty list — use Scenario 5 path instead to confirm graceful empty-state handling.

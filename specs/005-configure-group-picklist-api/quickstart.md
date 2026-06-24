# Quickstart Validation Guide: Configure Order — Add Group Dropdown from Product Grouping Picklist

**Feature**: `specs/005-configure-group-picklist-api`
**Date**: 2026-06-24

## Prerequisites

- Dev server running: `npm run dev` (localhost:3000)
- Logged in as a user with a Salesforce-connected account (`SF_ACCOUNT_ID` and `SF_CONTACT_ID` set)
- Salesforce sandbox has `Product_Grouping__c` picklist values configured on the Product object

## Validation Scenarios

### Scenario 1 — Picklist-sourced groups appear in dropdown

1. Navigate to `http://localhost:3000/configure`
2. Wait for the page to load (allow ~1–2s for the picklist fetch to complete)
3. Click "+ Add Group"
4. **Expected**: The "Product Groups" section of the dropdown shows group names from the `Product_Grouping__c` Salesforce picklist — not filtered by or derived from the catalog products currently loaded

### Scenario 2 — Values differ from catalog-derived list (feature 003 superseded)

1. Note the group names shown in Scenario 1
2. Compare with the `groupingLabel` values visible on products in the catalog panel
3. **Expected**: The dropdown may show more group names than what appears in the catalog (the picklist is canonical and not limited by loaded products) — this confirms the picklist source is being used

### Scenario 3 — Clicking a picklist group adds a row and closes dropdown

1. Open the "+ Add Group" dropdown
2. Click any group name from the "Product Groups" list
3. **Expected**: A group row with that name is appended to the line table; the dropdown closes

### Scenario 4 — Custom input still works

1. Open the "+ Add Group" dropdown
2. Type a custom name in the input at the bottom; press Enter or click "Add"
3. **Expected**: A group row with the custom name is added; the dropdown closes

### Scenario 5 — Empty state when picklist unavailable (dev/mock mode)

1. Start the server without Salesforce credentials (mock mode: SF creds absent)
2. Navigate to `/configure`, click "+ Add Group"
3. **Expected**: No "Product Groups" list section appears — only the custom input is shown; no error message or console exception

### Scenario 6 — Network inspection confirms picklist API is called

1. Open browser DevTools → Network tab
2. Navigate to `/configure` and wait for load
3. **Expected**: A request to `/api/salesforce/picklists?accountId=...&contactId=...` is visible with a 200 response containing a `Product_Grouping__c` array

## Known Limitations

- No automated tests. All validation is manual.
- If Salesforce sandbox has no `Product_Grouping__c` picklist values configured, Scenario 1 will show an empty list — use Scenario 5 to confirm graceful empty-state handling.

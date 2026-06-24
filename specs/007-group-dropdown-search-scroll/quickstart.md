# Quickstart Validation Guide: Configure Order — Add Group Dropdown Search & Scroll

**Feature**: `specs/007-group-dropdown-search-scroll`
**Date**: 2026-06-24

## Prerequisites

- Dev server running: `npm run dev` (localhost:3000)
- Logged in as a user with a Salesforce-connected account (so `grpLabels` is populated)
- `Product_Grouping__c` picklist in Salesforce has at least 6 values configured (to test scroll)

## Validation Scenarios

### Scenario 1 — Search box appears when groups are loaded

1. Navigate to `http://localhost:3000/configure`
2. Wait ~1–2s for picklist fetch to complete
3. Click "+ Add Group"
4. **Expected**: A search text box appears inside the "Product Groups" section, above the group items list. The search box receives focus automatically.

### Scenario 2 — Typing filters the list in real time

1. With the dropdown open, type the first 2–3 characters of any group name
2. **Expected**: Only group names containing that substring (case-insensitive) remain visible. Non-matching items disappear immediately as you type.

### Scenario 3 — Clearing the search restores all items

1. After typing in the search box, select all text and delete it (or clear with backspace)
2. **Expected**: All group names reappear in the list.

### Scenario 4 — No results message

1. Type a string that matches no group name (e.g., `zzz`)
2. **Expected**: The items list shows a "No results" message (or equivalent) instead of empty space. The search input and "Custom" section are still visible.

### Scenario 5 — Scroll bar appears when more than 5 items are shown

1. With a picklist containing 6+ groups, open the dropdown (no search text)
2. **Expected**: The "Product Groups" list is capped in height (approximately 5 items visible), and a scroll bar appears on the right. Scrolling reveals the remaining items.

### Scenario 6 — No scroll bar when 5 or fewer items are visible

1. Type a search term that matches exactly 1–5 groups
2. **Expected**: All matching items are visible without a scroll bar; the list height shrinks to fit the matching results.

### Scenario 7 — Custom input is always visible

1. Open the dropdown with 6+ groups loaded (scroll bar active)
2. Scroll the picklist list up and down
3. **Expected**: The "Custom" input section (header + text box + "Add" button) remains visible and accessible below the scrollable area at all times — it does not scroll away.

### Scenario 8 — Clicking a filtered item adds the correct group

1. Type a partial search string to filter the list
2. Click one of the visible items
3. **Expected**: A group row with that item's name is added to the line table; the dropdown closes.

### Scenario 9 — Search state resets on next open

1. Open the dropdown, type a search term, then close the dropdown (click outside or click "+ Add Group" again)
2. Reopen the dropdown
3. **Expected**: The search box is empty and all groups are shown again.

### Scenario 10 — Custom group add still works

1. Open the dropdown, type a custom name in the "Custom" input, press Enter
2. **Expected**: A group row with the custom name is added; the dropdown closes. The search box did not intercept the keystrokes meant for the custom input.

### Scenario 11 — Empty state: no groups loaded

1. If testing in mock mode (no Salesforce credentials), open the dropdown
2. **Expected**: No "Product Groups" section or search box is shown — only the "Custom" input is visible.

## Known Limitations

- Requires 6+ Salesforce `Product_Grouping__c` values to validate the scroll scenario (Scenario 5).
- In mock/dev mode without Salesforce credentials, only Scenarios 10 and 11 are fully testable.

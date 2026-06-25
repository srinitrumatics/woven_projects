# Quickstart Validation Guide: Fix Create Order Visibility and Group Text Box Clear

## Prerequisites

- Dev server running: `npm run dev` (http://localhost:3000)
- Logged-in session with access to product detail pages and the Configure page

---

## Fix 1: Create Order Button Visibility

### Scenario A — Modal with draft orders (Create Order must NOT appear)

1. Navigate to any product detail page (`/products/[id]`).
2. Click **"Add to Order"** to open the modal.
3. Wait for draft orders to load.
4. If draft orders are listed:
   - **Expected**: Footer shows **Cancel** | **Add to Order** only.
   - **Expected**: No "Create Order" button is visible anywhere in the footer.

### Scenario B — Modal with no draft orders (Create Order must appear)

1. Navigate to a product detail page.
2. Click **"Add to Order"** when no draft orders exist.
3. **Expected**: Footer shows **Cancel** | **Create Order**.
4. **Expected**: No "Add to Order" button is visible.

### Scenario C — Loading state (only Cancel)

1. Open the modal and observe the loading spinner state.
2. **Expected**: Only **Cancel** is visible in the footer during the spinner.

---

## Fix 2: Group Text Box Clears After Adding

### Scenario D — Custom text box clears on "Add" click

1. Navigate to **Configure** (`/configure`).
2. Click **"+ Add Group"** to open the dropdown.
3. Locate the "Group name..." text input.
4. Type a group name (e.g., "Test Group A").
5. Click **"Add"**.
6. **Expected**: The group appears in the list AND the text box is empty (shows placeholder "Group name...").

### Scenario E — Custom text box clears on Enter key

1. Open the Add Group dropdown.
2. Type a group name in the text box.
3. Press **Enter**.
4. **Expected**: Group added and text box is cleared.

### Scenario F — Multiple groups in sequence (no manual clear required)

1. Open the Add Group dropdown.
2. Type "Group A" → click Add → confirm text box clears.
3. Type "Group B" → click Add → confirm text box clears.
4. Type "Group C" → click Add → confirm text box clears.
5. **Expected**: All three groups appear; user never had to manually clear the text box.

---

## Expected Outcomes

| Scenario | Pass Condition |
|---|---|
| A | Footer shows Cancel + Add to Order only when drafts exist |
| B | Footer shows Cancel + Create Order only when no drafts exist |
| C | Footer shows Cancel only during loading |
| D | Text box empty after clicking Add |
| E | Text box empty after pressing Enter |
| F | Three groups added without manual clearing |

# Feature Specification: Configure Order — Add Group Dropdown Search & Scroll

**Feature Branch**: `wovn_mathu`

**Created**: 2026-06-24

**Status**: Draft

**Input**: User description: "add search text box and scroll bar list exceeds 5 items in app/configure/pages.tsx add group dropdown"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Search Filters the Product Groups List (Priority: P1)

When a user opens the "+ Add Group" dropdown on the Configure Order page, they see a search input at the top of the "Product Groups" list. Typing in that box instantly filters the visible group options to only those whose names contain the typed text, making it fast to find a specific group without scrolling through a long list.

**Why this priority**: The group list is sourced from Salesforce picklist values, which can contain dozens of options. Without a search box, users must visually scan the entire list every time, slowing order configuration.

**Independent Test**: Open the "+ Add Group" dropdown, type a partial group name in the search box — only matching items remain visible. Clear the search — all items reappear.

**Acceptance Scenarios**:

1. **Given** the dropdown is open and the group list has items, **When** the user types text into the search box, **Then** only group names containing that text (case-insensitive) are shown; non-matching items are hidden.
2. **Given** text is typed in the search box, **When** the user clears the search box, **Then** all group names reappear.
3. **Given** the search box contains text, **When** the user types a string that matches no group name, **Then** the list shows an empty state or "No results" indicator rather than blank space.
4. **Given** the search box is present, **When** the dropdown first opens, **Then** the search box receives focus automatically so the user can start typing immediately.

---

### User Story 2 — Scrollable List When More Than 5 Items Are Present (Priority: P1)

When the "Product Groups" section contains more than 5 items (either the full list or the filtered result), the list becomes vertically scrollable with a fixed maximum height, so the dropdown does not grow to cover the rest of the page.

**Why this priority**: With a long picklist, an unconstrained dropdown can overflow off-screen or obscure important UI below it. A scroll-capped list keeps the dropdown compact and always usable regardless of how many groups Salesforce returns.

**Independent Test**: With more than 5 groups loaded, open the "+ Add Group" dropdown — the "Product Groups" section shows at most 5 items at once with a visible scroll handle; scrolling reveals additional items.

**Acceptance Scenarios**:

1. **Given** the group list has 5 or fewer items, **When** the dropdown opens, **Then** all items are visible without a scroll bar — the dropdown shows its natural height.
2. **Given** the group list has more than 5 items, **When** the dropdown opens, **Then** the "Product Groups" section is capped at a fixed height showing approximately 5 items and a scroll bar appears.
3. **Given** the list is scrollable, **When** the user scrolls within the list, **Then** items above and below the visible window become visible in turn; items outside the visible area are fully hidden.
4. **Given** the search box filters the list to 5 or fewer items, **When** the user reviews the results, **Then** the scroll bar is no longer visible (not needed).

---

### User Story 3 — Custom Group Name Input Remains Usable (Priority: P2)

The "Custom" name input at the bottom of the dropdown continues to work correctly after the search box and scroll container are added.

**Why this priority**: The custom input is a core path for adding non-picklist groups; it must not be accidentally covered, broken, or scrolled out of view by the new UI elements.

**Independent Test**: With the search box and scrollable list in place, open the dropdown, type a custom name, press Enter (or click "Add") — a group row with that name is added and the dropdown closes.

**Acceptance Scenarios**:

1. **Given** the search box and scrollable list are visible, **When** the user scrolls the picklist list, **Then** the "Custom" input section remains fixed and always visible below the scrollable area (it does not scroll away).
2. **Given** text is in the search box, **When** the user clicks in the "Custom" input and types a name, **Then** the search box does not capture keystrokes meant for the custom input.

---

### Edge Cases

- What happens when the group list has 0 items (picklist not loaded or empty)? The search box and "Product Groups" section are hidden entirely, leaving only the "Custom" input — no empty search box is shown alone.
- What happens when the user types in the search box and then clicks a visible item? The item is added as a group row and the dropdown closes; the search box state is reset for next time.
- What happens when the device has limited vertical space (small viewport)? The fixed max-height still applies; the dropdown does not grow beyond 5 items in the scrollable area even on small screens.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The "Product Groups" section of the "+ Add Group" dropdown MUST include a text input for filtering group names by a substring match (case-insensitive).
- **FR-002**: Filtering MUST happen in real time as the user types — no submit action required.
- **FR-003**: When the search input is empty, ALL available group names MUST be shown.
- **FR-004**: When the search input contains text that matches no group name, a "No results" (or equivalent) message MUST appear in place of the list — the list MUST NOT be blank.
- **FR-005**: When the search input is cleared, ALL group names MUST reappear immediately.
- **FR-006**: When the dropdown opens, the search input MUST receive keyboard focus automatically.
- **FR-007**: The "Product Groups" list MUST be scrollable with a fixed maximum height when it contains more than 5 visible items.
- **FR-008**: When the list contains 5 or fewer visible items (either unfiltered or after filtering), no scroll bar MUST be present.
- **FR-009**: The "Custom" group name input section MUST remain visible and usable at all times when the dropdown is open, regardless of how many items are in the scrollable list.
- **FR-010**: Clicking a picklist group item while the search box contains text MUST add that group and close the dropdown; the search box MUST reset to empty for the next open.
- **FR-011**: When the group list has 0 items, the search box MUST NOT be shown — only the "Custom" input section is displayed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can locate and click any group from a list of 20 or more options in under 5 seconds by typing a partial name in the search box.
- **SC-002**: With more than 5 groups loaded, the dropdown height does not exceed the equivalent of 5 list items plus the search box and custom input height — verifiable by visual inspection.
- **SC-003**: Zero existing "Custom" group add operations fail after the search and scroll UI is added — all previously working add-group paths still succeed.
- **SC-004**: The search box filters results with no perceivable delay (instant for lists up to 100 items).

## Assumptions

- The search box filters the already-loaded `grpLabels` list on the client — no additional API call is needed for filtering.
- The maximum-height threshold is 5 visible items; this is a UI constraint, not a data limit (all items remain selectable via scroll or search).
- The search box is scoped to the "Product Groups" picklist section only; it does not filter the "Custom" input section.
- The search input state is local to the dropdown open/close cycle — it resets to empty each time the dropdown is closed and reopened.
- Dark mode styling must be consistent with the existing dropdown UI (matching the Tailwind dark-mode classes already used in the configure page).

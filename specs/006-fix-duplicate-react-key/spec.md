# Feature Specification: Fix Duplicate React Key — [object Object]

**Feature Branch**: `wovn_mathu`

**Created**: 2026-06-24

**Status**: Draft

**Input**: User description: "Encountered two children with the same key, `[object Object]`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — List Items Render Correctly Without Duplication or Omission (Priority: P1)

When a user views a list or dropdown populated from external data, every item appears exactly once and in the correct order. No items are duplicated or silently skipped.

**Why this priority**: The root cause (an object being used as a list item identifier instead of its text value) can cause visible UI defects — duplicate rows, missing rows, or stale item rendering — which directly harm usability and data accuracy.

**Independent Test**: Open the affected page/component, inspect the rendered list — each entry appears exactly once with the correct label. Browser developer tools show no React key warning in the console.

**Acceptance Scenarios**:

1. **Given** a list or dropdown is populated from data containing multiple items, **When** the list renders, **Then** every item appears exactly once in the correct order with no duplicates.
2. **Given** the browser developer console is open, **When** any page containing the affected list renders, **Then** no "Encountered two children with the same key" warning is emitted.
3. **Given** a list item is clicked or interacted with, **When** the interaction occurs, **Then** the correct item responds (not a duplicate or wrong entry due to identity confusion).

---

### User Story 2 — No Regression in Other List Displays (Priority: P2)

After the fix is applied, all other lists and dropdowns on the same pages continue to work correctly — no previously-working items are removed, reordered, or broken.

**Why this priority**: A fix that resolves the key warning but breaks adjacent list rendering would be worse than the original issue.

**Independent Test**: Navigate all affected pages; verify that existing filters, dropdowns, and lists behave identically to before the fix.

**Acceptance Scenarios**:

1. **Given** the fix is applied, **When** the user navigates to affected pages, **Then** all other lists (manufacturers, product families, catalog items, etc.) still display and filter correctly.
2. **Given** the fix is applied, **When** the user opens any dropdown that was not the source of the warning, **Then** no new console warnings appear.

---

### Edge Cases

- What happens when the data source returns zero items? The list must render as empty with no key warning.
- What happens when the data source returns items with identical display labels? Each item must still receive a unique key derived from its position or a distinct identifier, not from the label text alone.
- What happens when an item's value is `null` or `undefined`? The list must gracefully skip or handle that item without using `null`/`undefined` as a key.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every list item rendered within a repeating UI element MUST use a unique, stable, string or numeric key — never a raw object reference.
- **FR-002**: Where the data source returns objects, the key MUST be derived from a well-defined primitive field (such as an id, name, or index) rather than the object itself.
- **FR-003**: The fix MUST eliminate the browser console warning "Encountered two children with the same key, `[object Object]`" across all affected components.
- **FR-004**: List rendering behavior (order, count, interactivity) MUST be identical before and after the fix for all unaffected components on the same pages.
- **FR-005**: The fix MUST handle gracefully cases where a list item's identifying field is empty, null, or undefined — falling back to index-based keying only as a last resort and with no visible UI defect.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero "Encountered two children with the same key" warnings appear in the browser console across all affected pages after the fix is applied.
- **SC-002**: All items in every affected list render exactly once — no duplicates and no omissions — verifiable by comparing rendered item count with the data source count.
- **SC-003**: All previously-working lists and dropdowns on affected pages continue to pass a visual regression check (same item count, order, and labels as before the fix).

## Assumptions

- The warning is caused by one or more components passing an object directly as a React `key` prop (e.g., `key={item}` where `item` is an object, which coerces to `"[object Object]"`).
- The affected component(s) are on pages already identified in this codebase (most likely in list/dropdown rendering loops that were recently modified).
- No database schema or API contract changes are needed — this is a UI rendering fix only.
- The fix will not require changes to backend services or data structures; only the key derivation logic in the affected component(s) needs correction.

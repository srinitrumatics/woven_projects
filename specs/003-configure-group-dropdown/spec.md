# Feature Specification: Configure Order — Group Dropdown from Product Grouping

**Feature Branch**: `003-configure-group-dropdown`

**Created**: 2026-06-24

**Status**: Draft

**Input**: User description: "in app/configure/page.tsx add group dropdown needs to product grouping list not family list"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Add Group from Product Grouping List (Priority: P1)

A user building a configured order clicks "Add Group" and sees a list of group names sourced from the `Product_Grouping__c` (groupingLabel) values present in the product catalog — not from the `Family` field and not from a hardcoded preset list. They click a grouping name to insert that group row into the order configuration.

**Why this priority**: The group names must reflect real product groupings from Salesforce so that the order structure aligns with the business taxonomy. Hardcoded presets are a placeholder that do not match actual catalog data.

**Independent Test**: Load the Configure Order page with a catalog containing products that have distinct `groupingLabel` values. Open the "Add Group" dropdown. The list shows those grouping values and clicking one adds a group row with that name.

**Acceptance Scenarios**:

1. **Given** the product catalog has loaded and contains products with distinct `groupingLabel` values (e.g., "AV Solutions", "Network Infrastructure"), **When** the user clicks "+ Add Group", **Then** the dropdown displays those unique grouping labels (deduplicated, sorted alphabetically), with no hardcoded preset entries.
2. **Given** the dropdown is open and showing grouping labels, **When** the user clicks a label, **Then** a group row with that name is appended to the line table and the dropdown closes.
3. **Given** the product catalog has products where `groupingLabel` is empty or undefined for some products, **When** the dropdown opens, **Then** those blank entries are omitted and only non-empty unique grouping labels are shown.
4. **Given** the product catalog has not yet loaded (empty catalog), **When** the user opens the "Add Group" dropdown, **Then** the dropdown shows only the custom group entry input (no grouping label list items).

---

### User Story 2 — Add Group with Custom Name (Priority: P2)

A user who wants a group name not present in the product grouping list can still type a custom name and add it.

**Why this priority**: Custom groups remain useful for bespoke order configurations not covered by the catalog taxonomy. This is an existing capability that must be preserved.

**Independent Test**: Open the "Add Group" dropdown, type a custom name in the input, and confirm a group row with that name is added.

**Acceptance Scenarios**:

1. **Given** the dropdown is open, **When** the user types a name in the custom input and presses Enter or clicks "Add", **Then** a group row with that custom name is added to the line table.
2. **Given** the user leaves the custom input blank and clicks "Add", **Then** no group row is added and the dropdown remains open.

---

### Edge Cases

- What happens when all products in the catalog have an empty `groupingLabel`? → The grouping list section is omitted; only the custom input remains.
- What happens when two products share the same `groupingLabel` value but with different casing (e.g., "AV" vs "av")? → Values are deduplicated and sorted as-is (case-sensitive), matching the same convention used by the existing Manufacturer and Family filter lists. No case normalisation is applied.
- What happens when the catalog has not loaded because `SF_ACCOUNT_ID` or `SF_CONTACT_ID` is unavailable? → Dropdown renders with empty grouping list and custom input only; no error is thrown.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The "Add Group" dropdown MUST derive its list items from the unique, non-empty `groupingLabel` values in the loaded product catalog. (`groupingLabel` is the in-memory property already mapped from `p.Grouping__c || p.Product_Grouping__c` in the existing catalog-loading logic.)
- **FR-002**: The "Add Group" dropdown MUST NOT display hardcoded preset group names (AV Components, Networking, Cables & Wiring) as the primary list.
- **FR-003**: The grouping label list MUST be deduplicated and sorted alphabetically before display.
- **FR-004**: Blank or undefined `groupingLabel` values MUST be excluded from the list.
- **FR-005**: Clicking a grouping label item MUST add a group row to the line table using that label as the group name, consistent with existing `addGroup` behaviour.
- **FR-006**: The custom group name text input MUST remain available in the dropdown so users can still create ad-hoc groups not in the catalog grouping list.
- **FR-007**: The "Add Group" dropdown MUST continue to close after a group (catalog-derived or custom) is successfully added.

### Key Entities

- **Product catalog entry**: A product loaded from Salesforce via `/api/salesforce/orders?action=products`. Relevant field: `groupingLabel` (mapped from `p.Grouping__c || p.Product_Grouping__c`).
- **Group row**: A line of type `'group'` in the order configuration, holding `grpName` and `grpColor`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of dropdown list items in "Add Group" are sourced from the product catalog's `groupingLabel` values — zero hardcoded preset entries remain.
- **SC-002**: Users can add a catalog-derived group in one click from the dropdown with no additional typing required.
- **SC-003**: The custom name input remains functional; users can create a custom group in under 10 seconds.
- **SC-004**: When the catalog contains N distinct non-empty grouping labels, the dropdown shows exactly N items (deduplicated) in the grouping list.

## Assumptions

- The `groupingLabel` field is already populated on catalog items via the existing mapping `p.Grouping__c || p.Product_Grouping__c` in `app/configure/page.tsx`. No additional API or service changes are needed to fetch grouping data. If a catalog item has neither field set, `groupingLabel` will be an empty string; the `.filter(Boolean)` in the derived list silently excludes it — no error or fallback is required.
- Product catalog data is already loaded into the `catalog` state before the user opens the "Add Group" dropdown in normal usage flows.
- The existing group color assignment (`'bg-gray-500'` default for catalog-derived groups, or a derived colour per grouping) follows the same approach as the current custom group input; a specific per-group colour scheme is out of scope.
- Mobile or responsive layout changes to the dropdown are out of scope; the existing positioning and width are retained.
- No permission gate is required for this UI change — adding groups is already an unrestricted action on the configure page.

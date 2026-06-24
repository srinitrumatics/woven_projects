# Feature Specification: Configure Order — Add Group Dropdown from Product Grouping Picklist

**Feature Branch**: `005-configure-group-picklist-api`

**Created**: 2026-06-24

**Status**: Draft

**Input**: User description: "for app/configure/page.tsx file for add group dropdown fetch dropdown values from picklist API response in that use this array Product_Grouping__c"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Add Group Dropdown Populated from Salesforce Picklist (Priority: P1)

A user building a configured order opens the "+ Add Group" dropdown and sees a list of product group names sourced from the canonical Salesforce `Product_Grouping__c` picklist — not derived from whatever products happen to be in the current catalog view. The picklist is the authoritative list of valid group types defined in Salesforce.

**Why this priority**: The catalog-derived approach (feature 003) can only show groupings that exist on products already loaded for the current account. The Salesforce picklist provides the complete, canonical set of group options regardless of which products are in the catalog, ensuring users always see all valid group types.

**Independent Test**: Open the Configure Order page. Click "+ Add Group". The dropdown shows group names fetched from the Salesforce picklist (`Product_Grouping__c` values), not filtered by what products are loaded. Clicking a name inserts a group row.

**Acceptance Scenarios**:

1. **Given** the page has loaded and Salesforce credentials are available, **When** the user clicks "+ Add Group", **Then** the dropdown displays group options sourced from the `Product_Grouping__c` Salesforce picklist values — not derived from the loaded product catalog.
2. **Given** the dropdown is showing picklist-sourced group options, **When** the user clicks a group name, **Then** a group row with that name is added to the line table and the dropdown closes.
3. **Given** the picklist is loading (API call in progress), **When** the user opens the dropdown, **Then** the group options section either shows a loading indicator or is hidden until values are ready — no broken state is shown.
4. **Given** the picklist API call fails or returns no `Product_Grouping__c` values, **When** the user opens the dropdown, **Then** the group list section is omitted gracefully and only the custom name input remains available.
5. **Given** Salesforce credentials are not configured (mock/dev mode), **When** the user opens the dropdown, **Then** the dropdown falls back gracefully — no error is thrown and the custom input remains usable.

---

### User Story 2 — Custom Group Name Input Preserved (Priority: P2)

A user who wants a group name not present in the `Product_Grouping__c` picklist can still type a custom name and add it.

**Why this priority**: The custom group input must be preserved so users are not restricted to only picklist values when building an order configuration.

**Independent Test**: Open "+ Add Group", type a custom name in the input, press Enter or click "Add" — a group row with that name is added.

**Acceptance Scenarios**:

1. **Given** the dropdown is open, **When** the user types a name in the custom input and presses Enter or clicks "Add", **Then** a group row with that name is added to the line table.
2. **Given** the picklist group list is displayed above the custom input, **When** the user ignores the list and types a custom name, **Then** the custom name is used — the picklist list does not restrict entry.

---

### Edge Cases

- What happens when the picklist API returns an empty `Product_Grouping__c` array? → The group list section is omitted; only the custom input shows.
- What happens when the page loads before the user opens the dropdown (picklist fetch in progress)? → Picklist values load in the background; the dropdown shows whatever is available at open time without blocking the page.
- What happens if `SF_ACCOUNT_ID` or `SF_CONTACT_ID` is not yet available when the component mounts? → The picklist fetch should wait for both values before initiating, matching the existing pattern for catalog loading.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The "Add Group" dropdown MUST fetch its group name list from the `Product_Grouping__c` field of the Salesforce picklist response, replacing the current catalog-derived `groupingLabel` approach.
- **FR-002**: The picklist fetch MUST use the same account and contact credentials already available in the configure page session context.
- **FR-003**: The group list in the dropdown MUST reflect the `Product_Grouping__c` picklist values exactly as returned — no additional client-side filtering or deduplication beyond what the API provides.
- **FR-004**: When the picklist has not yet loaded or returned no values, the group list section MUST be omitted from the dropdown — the custom input MUST remain visible.
- **FR-005**: Clicking a picklist-derived group name MUST add a group row to the line table using that name, consistent with existing group-add behaviour.
- **FR-006**: The custom group name text input MUST remain available below the picklist group list.
- **FR-007**: The dropdown MUST close after a group (picklist-derived or custom) is successfully added.
- **FR-008**: The picklist fetch MUST NOT block page load or catalog loading — it runs independently in the background.

### Key Entities

- **Salesforce picklist**: The API response at `/api/salesforce/picklists`. The relevant field is `Product_Grouping__c`, an array of string values found at `data[0].Product_Grouping__c`.
- **Group row**: A line of type `'group'` in the order configuration, holding `grpName` and `grpColor`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of group name options in the "+ Add Group" dropdown come from the `Product_Grouping__c` picklist — no catalog-derived or hardcoded values remain as the primary list.
- **SC-002**: The picklist values are available in the dropdown within normal page load time — users do not experience a noticeable delay opening the dropdown after the page has loaded.
- **SC-003**: When the picklist API is unavailable, the dropdown degrades gracefully — custom group entry remains usable with zero error messages shown to the user.
- **SC-004**: All group names from the picklist are selectable and produce a correctly named group row in one click.

## Assumptions

- The existing picklist API endpoint (`/api/salesforce/picklists`) already returns `Product_Grouping__c` as an array of strings at `result.data[0].Product_Grouping__c` — the same structure used by `Shipping_Method__c` and `Incoterms__c` in the order detail page.
- The picklist fetch requires `SF_ACCOUNT_ID` and `SF_CONTACT_ID`, both already available in the configure page's session context.
- No new API endpoints or Salesforce service methods need to be created — the existing endpoint is reused.
- The picklist-derived list replaces the catalog-derived `grpLabels` useMemo introduced in feature 003; the `grpLabels` derived state is no longer needed once this feature is complete.
- Group color for picklist-derived groups uses `'bg-gray-500'` as default, matching the existing custom group path.
- No loading spinner is required if the picklist arrives before the user opens the dropdown (the normal case). A graceful empty state is sufficient for the race condition where the user opens the dropdown before the fetch completes.

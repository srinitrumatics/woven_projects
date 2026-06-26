# Feature Specification: Default Descending Table Sort & Fulfillment Tab Navigation Links

**Feature Branch**: `010-table-sort-fulfillment-links`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "arrange all data tables with desc order latest first as default and in order details page app/orders[id]/components/fulfillment.tsx file in fulfillment tab add link for suitable columns like proposals, sales order, quotes and others. if they are allow to access the page"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Default Descending Sort on All Data Tables (Priority: P1)

A user opens any list page or detail sub-table in the portal and immediately sees the most recent records at the top — without having to manually click a column header.

**Why this priority**: Users consistently work with the most recently created records. Seeing the oldest records first forces extra steps. This affects every list in the app and should be the baseline behavior.

**Independent Test**: Open the Orders list page. Verify that records are sorted by order number descending (largest number first) with no user interaction required. Independently verify the same for the Shipments and Inventory list pages. Verify that the Fulfillment tab sub-tables on an Order detail page also load in descending order by the primary identifier column.

**Acceptance Scenarios**:

1. **Given** a user navigates to the Orders list page, **When** the page loads, **Then** records are sorted by order number in descending order (newest first) with the sort indicator visible on the column header.
2. **Given** a user navigates to the Shipments list page, **When** the page loads, **Then** records are sorted by name/number in descending order with the sort indicator visible.
3. **Given** a user navigates to the Inventory list page, **When** the page loads, **Then** records are sorted by name in descending order with the sort indicator visible.
4. **Given** a user opens the Fulfillment tab on an Order detail page, **When** any sub-tab (Proposals, Customer Quotes, Sales Orders, Shipping Manifests, Invoices) is active, **Then** the records in that sub-table are sorted by their primary identifier in descending order.
5. **Given** a user opens any other detail page sub-table (e.g. Proposal detail tabs, Quote detail tabs, Invoice detail tabs, etc.), **When** the table loads, **Then** records are sorted by their primary identifier or relevant date field in descending order.
6. **Given** a user clicks a column header to change the sort, **When** they return to the page or refresh, **Then** the sort resets to the descending default (user-applied sort is session-only, not persisted).

---

### User Story 2 - Permission-Aware Navigation Links in Fulfillment Tab (Priority: P2)

When viewing an Order's Fulfillment tab, a user can click on a Proposal Number, Customer Quote name, Shipping Manifest number, or Invoice number and navigate directly to that entity's detail page — but only if their account type grants them access to that section of the portal.

**Why this priority**: Currently, all entity names in the Fulfillment tab are plain text. Users must manually navigate to the relevant list page and search for the record. Direct links reduce friction and improve discoverability. Access-gating prevents broken navigation for users whose account type does not include certain sections.

**Independent Test**: As a Customer-type user, open an Order detail page → Fulfillment tab → Proposals sub-tab. Verify that the Proposal Number column renders as a clickable link that navigates to `/proposals/{id}`. Switch to the Customer Quotes sub-tab and verify the Customer Quote name links to `/quotes/{id}`. Verify the Invoices and Shipping Manifests sub-tabs link to `/invoices/{id}` and `/shipments/{id}` respectively. Confirm that Sales Order names show as plain text (no dedicated route exists). As a Partner-type user, verify that Proposals and Quotes links do not appear for sections not in their navigation.

**Acceptance Scenarios**:

1. **Given** a Customer or Hybrid account user views the Proposals sub-tab of an Order's Fulfillment tab, **When** the table renders, **Then** each row's Proposal Number column is a clickable link that navigates to that proposal's detail page.
2. **Given** a Customer or Hybrid account user views the Customer Quotes sub-tab, **When** the table renders, **Then** each row's Customer Quote name is a clickable link navigating to that quote's detail page.
3. **Given** a Customer or Hybrid account user views the Shipping Manifests sub-tab, **When** the table renders, **Then** each row's Manifest # is a clickable link navigating to that shipment's detail page.
4. **Given** a Customer or Hybrid account user views the Invoices sub-tab, **When** the table renders, **Then** each row's Invoice # is a clickable link navigating to that invoice's detail page.
5. **Given** any user views the Sales Orders sub-tab, **When** the table renders, **Then** the Sales Order # shows as plain text (no dedicated sales order detail page exists in the portal).
6. **Given** a user whose account type does not have access to a particular section (e.g. Proposals has `visibleFor: [""]` — effectively no sidebar access), **When** viewing the corresponding sub-tab, **Then** the entity name renders as plain text (no link) rather than a broken or unauthorized link.
7. **Given** a Super Admin user, **When** viewing any sub-tab, **Then** all valid entity names render as clickable links (Super Admin bypasses access restrictions).

---

### Edge Cases

- What happens when an entity's `Id` field is null or empty? The column must fall back to plain text (no broken link).
- What happens if a user directly navigates via a link to a page their account type cannot access? Existing portal auth/redirect behavior handles this; the spec does not change that behavior.
- What happens when a sub-table has no records? Existing empty state remains unchanged.
- What happens for list pages that already have a default descending sort (Proposals by `proposalNumber`, Quotes by `quoteNumber`, Invoices by `invoiceNumber`, Purchase Orders by `name`, Supplier Bills by `name`)? No change needed; they already comply.

## Requirements *(mandatory)*

### Functional Requirements

**Default Descending Sort:**

- **FR-001**: The Orders list page MUST default to sorting by order name/number in descending order on initial load.
- **FR-002**: The Shipments list page MUST default to sorting by name in descending order on initial load.
- **FR-003**: The Inventory list page MUST default to sorting by name in descending order on initial load.
- **FR-004**: All five sub-tables within the Order Fulfillment tab (Proposals, Customer Quotes, Sales Orders, Shipping Manifests, Invoices) MUST default to sorting by their primary identifier in descending order on initial load.
- **FR-005**: All other detail-page sub-tables (Proposal detail tabs, Quote detail tabs, Shipment detail tabs, Invoice detail tabs, Purchase Order detail tabs, Supplier Bill detail tabs) MUST default to sorting by their primary identifier or primary date field in descending order on initial load.
- **FR-006**: The default sort direction MUST be visually indicated by the sort arrow on the relevant column header.
- **FR-007**: The default sort MUST NOT be persisted across sessions — refreshing the page always restores the descending default.

**Fulfillment Tab Navigation Links:**

- **FR-008**: Proposal Number cells in the Fulfillment Proposals sub-tab MUST render as navigation links to `/proposals/{Id}` when the user's account type grants access to the Proposals section.
- **FR-009**: Customer Quote name cells in the Fulfillment Customer Quotes sub-tab MUST render as navigation links to `/quotes/{Id}` when the user's account type grants access to the Quotes section.
- **FR-010**: Manifest # cells in the Fulfillment Shipping Manifests sub-tab MUST render as navigation links to `/shipments/{Id}` when the user's account type grants access to the Shipments section.
- **FR-011**: Invoice # cells in the Fulfillment Invoices sub-tab MUST render as navigation links to `/invoices/{Id}` when the user's account type grants access to the Invoices section.
- **FR-012**: Sales Order # cells in the Fulfillment Sales Orders sub-tab MUST remain as plain text (no dedicated `/sales-orders/` route exists in the portal).
- **FR-013**: When a user's account type does not grant access to a section, the corresponding entity name in the Fulfillment tab MUST render as plain text (not a link).
- **FR-014**: Super Admin users MUST see all valid entity names as links regardless of the `visibleFor` account type restrictions.
- **FR-015**: Navigation links MUST open in the same tab (no `target="_blank"`).
- **FR-016**: Entity name cells where the `Id` field is absent or empty MUST fall back to plain text.

### Key Entities

- **Data Table**: Any component using `useSortableData` hook — currently covers 3 main list pages without a default sort and 50+ detail sub-table components.
- **Default Sort Config**: The `{ key: string, direction: 'asc' | 'desc' }` object passed as the second argument to `useSortableData(data, config)`.
- **FulfillmentTab**: `app/orders/[id]/components/FulfillmentTab.tsx` — the single component requiring both sort updates and link additions.
- **Account Type**: Derived from `selectedAccount?.Account_Record_Type__c` in the Sidebar context (Customer, NSO, Partner, Hybrid, Manufacturer variants). Controls which nav sections are visible.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On every list page (Orders, Shipments, Inventory) and every detail sub-table, the most recently added record is visible in the first row without any user interaction.
- **SC-002**: 100% of data tables that previously had no default sort now load with a descending sort on their primary identifier or date field.
- **SC-003**: All Proposal Number, Customer Quote, Manifest #, and Invoice # cells in the Order Fulfillment tab render as clickable links for users whose account type includes that section (verified for Customer and Hybrid account types).
- **SC-004**: No broken or unauthorized navigation links appear for account types that do not have access to a linked section.
- **SC-005**: The visual sort indicator (arrow) correctly reflects the active descending sort on initial page load for all affected tables.

## Assumptions

- The `useSortableData` hook already accepts an optional initial sort config as its second argument — this is confirmed in existing usage (`app/proposals/page.tsx` line 166, `app/invoices/page.tsx` line 157`).
- Access gating for Fulfillment tab links uses the same account type (`Account_Record_Type__c`) logic already present in `Sidebar.tsx` — no new permission model is introduced.
- No dedicated `/sales-orders/` route exists in the portal; Sales Order names remain plain text in all contexts.
- The sort default does not need to be user-configurable or persisted (session-only).
- Link styling in the Fulfillment tab follows the existing `text-primary hover:underline` convention used elsewhere in the portal.
- `isSuperAdmin` from `PermissionContext` bypasses account-type restrictions for link visibility, consistent with the existing RBAC super admin bypass pattern.

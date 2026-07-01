# Feature Specification: Replace Manufacturer with Brand Across All Tables

**Feature Branch**: `019-manufacturer-to-brand`

**Created**: 2026-07-01

**Status**: Draft

**Input**: User description: "replace manufacturer header and manufacturer data into brand for all pages table ,tabs and sub tabs"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consistent "Brand" Column Across All List and Detail Tables (Priority: P1)

A portal user (Client, Partner, or Client-Partner) browses any module — Inventory, Products, Orders, Quotes, Invoices, Purchase Orders, Shipments, Supplier Bills, and Proposals (including every tab and sub-tab within a record's detail page: Products, Fulfillment, Returns, Purchases, etc.) — and sees a "Brand" column wherever a "Manufacturer" or "Manufacturer DBA" column previously appeared, showing the record's brand information instead of manufacturer information.

**Why this priority**: This is the entire scope of the feature; every table across the portal must consistently reflect the terminology and data change, or the change will read as incomplete/inconsistent to users comparing tables side by side.

**Independent Test**: Can be fully tested by opening each module's list page and each tab/sub-tab of a record detail page, and confirming no column is labeled "Manufacturer" or "Manufacturer DBA" — all now read "Brand" — and the displayed value matches the record's brand data.

**Acceptance Scenarios**:

1. **Given** a user opens the Inventory list page, **When** the table renders, **Then** the column previously labeled "Manufacturer DBA" is labeled "Brand" and shows the record's brand value.
2. **Given** a user opens any record detail page (Order, Quote, Invoice, Purchase Order, Shipment, Supplier Bill, Proposal), **When** they view a tab or sub-tab containing a line-item table, **Then** any "Manufacturer" or "Manufacturer DBA" column is relabeled "Brand" and displays brand data.
3. **Given** a user sorts a table by the renamed column, **When** they click the column header, **Then** sorting behaves the same as it did for the manufacturer column (ascending/descending toggle).
4. **Given** a user resizes the renamed column, **When** they drag the column border, **Then** the column resizes normally, same as any other column.

---

### User Story 2 - No Leftover "Manufacturer" Labels in Table Views (Priority: P2)

A user scans a table row's cells or hovers over a truncated cell (tooltip) and never encounters the word "Manufacturer" in any table, tab, or sub-tab context — including compact/mobile card views that present the same row data as a table would.

**Why this priority**: Partial renaming (e.g., header changed but tooltip title attribute still says "Manufacturer") would look like a bug rather than a deliberate terminology change.

**Independent Test**: Search the rendered UI of every affected table (including mobile/responsive card layouts) for the literal word "Manufacturer" and confirm none remain in table/tab/sub-tab contexts.

**Acceptance Scenarios**:

1. **Given** a table cell showing brand data, **When** the cell is truncated and a user hovers over it, **Then** the tooltip text reflects the brand value without referencing "Manufacturer."
2. **Given** a responsive/mobile card layout is shown in place of a table on a small screen, **When** the card displays the brand field, **Then** its label also reads "Brand," not "Manufacturer."

---

### Edge Cases

- What happens when a record's brand value is empty/null? → The cell displays "-", consistent with the existing null-dash convention used across all tables.
- What happens when a record has a manufacturer value but no distinct brand value populated in Salesforce for that object type? → The cell displays "-" (per the null-dash convention); the manufacturer value is not shown as a fallback, since the column now represents brand data specifically.
- What happens to sort/filter state that was keyed on the old manufacturer field name? → Sorting continues to work identically; only the underlying field reference, label, and displayed value change — sort mechanics are unaffected.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every table column header currently labeled "Manufacturer" or "Manufacturer DBA" MUST be relabeled "Brand" across all list pages, record detail tabs, and sub-tabs in the portal.
- **FR-002**: Every table cell currently displaying manufacturer data MUST display the record's brand data instead, using the same display conventions as other columns (including the "-" empty-value convention).
- **FR-003**: Sorting, column resizing, and pagination behavior on the renamed column MUST continue to function exactly as before the rename.
- **FR-004**: Any tooltip, title attribute, or accessible label associated with the renamed column MUST also reference "Brand" instead of "Manufacturer."
- **FR-005**: Compact/mobile card presentations that mirror table row data (e.g., product cards, popovers) MUST use "Brand" labeling wherever they previously showed "Manufacturer" as part of a list/table view.
- **FR-006**: Standalone record edit/create forms (e.g., the Add/Edit Product form's "Manufacturer" input) and non-tabular detail-panel field labels are OUT OF SCOPE for this feature; they continue to display "Manufacturer" as before. Only table column headers/cells within list pages, tabs, and sub-tabs are renamed.
- **FR-007**: The "Brand" column MUST source its data from each object's dedicated brand field (the same kind of field already used for the Proposal Products tab, e.g. a `Brand Name` field distinct from `Manufacturer DBA`), not from the legacy manufacturer field, for every object type that has such a field populated.
- **FR-008**: For any object type where a dedicated brand field does not yet exist or is not populated in Salesforce, the "Brand" column MUST render "-" for affected records rather than falling back to the manufacturer value.

### Key Entities

- **Product / Line Item Record**: Any product, order line, quote line, invoice line, purchase order line, shipment line, supplier bill line, RMA/RTV/credit/debit memo line, or proposal line that currently carries manufacturer information; going forward it is presented with brand information instead.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero table columns across the portal are labeled "Manufacturer" or "Manufacturer DBA" after the change (verified across every module list page and every record-detail tab/sub-tab).
- **SC-002**: 100% of previously-manufacturer-labeled table columns display the correct brand value (or "-" when empty) for a sample record in each module.
- **SC-003**: Sorting and column resizing on every renamed column work identically to before the change, with zero regressions reported.
- **SC-004**: No user-facing tooltip or hover text in any table/tab/sub-tab still references "Manufacturer."

## Assumptions

- "All pages table, tabs and sub tabs" is interpreted as every list-page table and every record-detail-page tab/sub-tab table across the modules identified during codebase review: Inventory, Products, Orders, Quotes, Invoices, Purchase Orders, Shipments, Supplier Bills, and Proposals (including nested line-detail pages).
- The data source changes, not just the label: every affected table now reads from each object's dedicated brand field rather than its manufacturer field, mirroring the approach already used for the Proposal Products tab.
- Where a given Salesforce object does not have an equivalent dedicated brand field available, the column shows "-" for that object's records; this is treated as a known data-availability gap to confirm per object during planning, not a blocker for the rename itself.
- Column widths, sort keys, and pagination configuration for renamed columns are preserved as-is; only the field reference, visible label, and displayed value change.
- Standalone edit/create forms and non-tabular detail-panel field labels (e.g., Add/Edit Product modal, Product Info side panels) are explicitly out of scope and continue to show "Manufacturer" — only table/tab/sub-tab list views are affected.

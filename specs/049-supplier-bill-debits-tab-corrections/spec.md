# Feature Specification: Correct Supplier Bill Debit Memos Table Columns

**Feature Branch**: `049-supplier-bill-debits-tab-corrections`

**Created**: 2026-07-08

**Status**: Draft

**Input**: User description: "in app/supplier-bills/[id]/components/SupplierBillDebitsTab.tsx file table use this column set: Debit Memo # | Status | Purchase Order # (hyperlink to record page) | Customer Quote # (no hyperlink if Supplier, hyperlink to record page if Hybrid) | Proposal # (no hyperlink if Supplier, hyperlink to record page if Hybrid) | Proposal Name | Customer Order # (no hyperlink if Supplier, hyperlink to record page if Hybrid) | Total Lines | Total Cost | Shipping | Taxes | Total Debit Amount | Issued Date | Expiration Date | Available Debit Balance | Settled Date"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Debit Memo record navigates to its related records (Priority: P1)

A user viewing a Supplier Bill's **Debit Memos** tab today only sees the debit memo's own name,
status, totals, and dates — there is no way to see or jump to the Purchase Order, Customer
Quote, Proposal, or Customer Order that the debit memo is tied to. The equivalent Debit Memos
table on the Purchase Order detail page already exposes these linkage columns with working
hyperlinks, so this is a visible inconsistency between two views of the same kind of record.

**Why this priority**: Without these columns, a user has no way to trace a debit memo back to
the commercial documents that produced it without leaving the page and searching elsewhere —
this is the core gap the request calls out.

**Independent Test**: Open a Supplier Bill that has at least one debit memo linked to a
Purchase Order, Customer Quote, Proposal, and Customer Order, view the Debit Memos tab, and
confirm each of those four columns is present, shows the correct related record name/number,
and links to that record's page when a link is expected for the current account type.

**Acceptance Scenarios**:

1. **Given** a debit memo linked to a Purchase Order, **When** the user views the Debit Memos
   tab, **Then** a "Purchase Order #" column shows the Purchase Order's number as a hyperlink
   that opens that Purchase Order's record page.
2. **Given** the signed-in account is a Supplier-type account and a debit memo is linked to a
   Customer Quote, Proposal, and/or Customer Order, **When** the user views the Debit Memos
   tab, **Then** the "Customer Quote #", "Proposal #", and "Customer Order #" columns show the
   related record's number/name as plain text, with no hyperlink.
3. **Given** the signed-in account is a Hybrid-type account (client-partner) and a debit memo is
   linked to a Customer Quote, Proposal, and/or Customer Order, **When** the user views the
   Debit Memos tab, **Then** those same columns show the related record's number/name as a
   hyperlink that opens the corresponding record page.
4. **Given** a debit memo has no linked Purchase Order, Customer Quote, Proposal, or Customer
   Order for a given column, **When** the user views the row, **Then** that cell shows the
   existing empty-value placeholder used throughout the app rather than a broken link or blank
   cell.

---

### User Story 2 - Full approved column set and order (Priority: P2)

Beyond the linkage columns, the requested column set also renames the identifier column,
inserts a "Proposal Name" column next to "Proposal #", and adds a "Taxes" column — so the full
table matches the reviewed field list end-to-end, not just the new links.

**Why this priority**: This completes the requested table shape; it is lower priority than User
Story 1 because the identifier rename and the additional financial/name columns are refinements
on top of the core navigation gap, not new navigation capability.

**Independent Test**: Open the Debit Memos tab on any Supplier Bill and confirm the columns
appear, left to right, in this exact order: Debit Memo #, Status, Purchase Order #, Customer
Quote #, Proposal #, Proposal Name, Customer Order #, Total Lines, Total Cost, Shipping, Taxes,
Total Debit Amount, Issued Date, Expiration Date, Available Debit Balance, Settled Date.

**Acceptance Scenarios**:

1. **Given** the Debit Memos tab, **When** the user reads the first column's header, **Then** it
   reads "Debit Memo #" (renamed from the current "Debit Memo").
2. **Given** a debit memo linked to a Proposal, **When** the user views the row, **Then** a
   "Proposal Name" column (separate from "Proposal #") shows that Proposal's name as plain text.
3. **Given** any debit memo, **When** the user views the row, **Then** a "Taxes" column appears
   between "Shipping" and "Total Debit Amount" showing the debit memo's tax amount, using the
   same currency formatting as the other monetary columns.
4. **Given** the table is scrolled or resized, **When** the user interacts with any column,
   **Then** existing sorting, column resizing, and pagination continue to work exactly as they
   do today — this feature changes column content and order only.

---

### Edge Cases

- What happens when a debit memo's Taxes or Proposal data has not been supplied by the backend
  yet? The cell displays the existing empty-value placeholder used elsewhere in the app, the
  same way any other missing field is handled today — it does not block the rest of the row from
  rendering.
- What happens for an account type that is neither Supplier nor Hybrid? Falls back to the same
  rule already used by the equivalent Purchase Order Debit Memos table for any non-Supplier
  account (i.e., treated as Hybrid/client-facing and shown as a hyperlink).
- What happens to the existing "Debit Memo" identifier column's sort/resize behavior after the
  header text changes to "Debit Memo #"? Sorting and resizing continue to work unchanged — only
  the visible label changes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST rename the first column of the Supplier Bill Debit Memos table from
  "Debit Memo" to "Debit Memo #", with no change to its sorting or content.
- **FR-002**: System MUST add a "Purchase Order #" column showing the linked Purchase Order's
  number, always rendered as a hyperlink to that Purchase Order's record page when a link exists.
- **FR-003**: System MUST add a "Customer Quote #" column showing the linked Customer Quote's
  number: rendered as plain text (no hyperlink) when the signed-in account is a Supplier-type
  account, and as a hyperlink to that Customer Quote's record page when the signed-in account is
  a Hybrid (client-partner) account.
- **FR-004**: System MUST add a "Proposal #" column with the same conditional hyperlink rule as
  FR-003, linking to the Proposal's record page.
- **FR-005**: System MUST add a "Proposal Name" column showing the linked Proposal's name as
  plain text (never a hyperlink), positioned immediately after "Proposal #".
- **FR-006**: System MUST add a "Customer Order #" column with the same conditional hyperlink
  rule as FR-003, linking to the Customer Order's record page.
- **FR-007**: System MUST add a "Taxes" column showing the debit memo's tax amount, formatted as
  currency consistent with the existing Total Cost/Shipping/Total Debit Amount columns,
  positioned between "Shipping" and "Total Debit Amount".
- **FR-008**: System MUST present all Debit Memos table columns in this exact left-to-right
  order: Debit Memo #, Status, Purchase Order #, Customer Quote #, Proposal #, Proposal Name,
  Customer Order #, Total Lines, Total Cost, Shipping, Taxes, Total Debit Amount, Issued Date,
  Expiration Date, Available Debit Balance, Settled Date.
- **FR-009**: System MUST show the existing empty-value placeholder in any of the new columns
  when the underlying related record or amount is not available for a given debit memo, rather
  than an error or broken link.
- **FR-010**: System MUST NOT change existing sorting, column resizing, or pagination behavior
  of the Debit Memos table beyond the column additions, rename, and reordering described above.

### Key Entities

- **Debit Memo (Supplier Bill context)**: A financial credit record tied to a Supplier Bill,
  which may also reference a Purchase Order, Customer Quote, Proposal, and/or Customer Order.
  This feature surfaces those relationships and adds a tax-amount figure that are not currently
  shown on the Supplier Bill's Debit Memos tab.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of debit memos with a linked Purchase Order, Customer Quote, Proposal, or
  Customer Order display that relationship on the Supplier Bill Debit Memos tab, matching the
  linkage already visible on the equivalent Purchase Order Debit Memos table.
- **SC-002**: Users on a Hybrid (client-partner) account can navigate from a debit memo row to
  any of its linked Purchase Order, Customer Quote, Proposal, or Customer Order pages in a
  single click; users on a Supplier account see the same information without a clickable link.
- **SC-003**: The full 16-column set renders in the specified order with zero regressions to
  existing sorting, resizing, and pagination on the Debit Memos tab.

## Assumptions

- "Supplier" and "Hybrid" refer to the same account-type distinction already used by the
  equivalent Purchase Order Debit Memos table (a Supplier-side account sees related client
  documents as plain text; a Hybrid/client-partner account sees them as hyperlinks) — this
  feature reuses that existing rule rather than introducing a new one.
- Purchase Order #, Customer Quote #, and Customer Order # relationship data is already
  available to the Supplier Bill Debit Memos tab; surfacing it is a display change.
- Proposal (# and Name) and Taxes data are not currently supplied to the Supplier Bill Debit
  Memos tab's data source. This feature assumes that data will be made available (following the
  same field naming already used for these values elsewhere in the app); until then, those
  columns render the standard empty-value placeholder for every row.
- The duplicate "Debit Memo #" entry present in the raw request list is treated as a single
  column (the renamed identifier column, FR-001) rather than a repeated column, since a repeated
  identical column would provide no additional value.
- This applies to all user roles/portals whose accounts can view a Supplier Bill (Client,
  Partner, Client-Partner), with the Supplier-vs-Hybrid hyperlink rule determined by the
  signed-in account's type, not by role.

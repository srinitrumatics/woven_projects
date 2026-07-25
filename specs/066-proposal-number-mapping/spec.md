# Feature Specification: Proposal # Columns Show the Proposal Number, Not the Name

**Feature Branch**: `[066-proposal-number-mapping]`

**Created**: 2026-07-25

**Status**: Draft

**Input**: User description: "Proposal # should be mapped Proposal #: PRP-26-04-000494 NOT NAME. Its duplicative. check whereever the Proposal# column is avilable . please map proposal number value instead of name.check across webapp and made a change in all pages tables."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See the actual proposal number in every "Proposal #" column (Priority: P1)

As a user viewing any table in the web app that has a "Proposal #" column (quotes, invoices, purchase orders, supplier bills, shipments, orders, proposal detail sub-tabs, etc.), I want that column to show the proposal's unique identifying number (e.g. `PRP-26-04-000494`) rather than repeating the proposal's name, so that "Proposal #" and "Proposal Name" show two genuinely different, useful pieces of information instead of the same value twice.

**Why this priority**: This is the entire request. Today, many "Proposal #" columns across the app are bound to the same underlying value as the adjacent "Proposal Name" column (or a differently-named field that never resolves and silently falls back to the name), making the "Proposal #" column redundant and confusing.

**Independent Test**: Open any page with both a "Proposal #" column and a "Proposal Name" column for the same row (e.g. Quotes list, an Invoice's Credits tab, a Proposal's Fulfillments tab). Confirm the two columns show different values: "Proposal #" shows the SF-style proposal number (e.g. `PRP-26-04-000494`), and "Proposal Name" shows the human-entered name.

**Acceptance Scenarios**:

1. **Given** a table with a "Proposal #" column and a row whose linked proposal has both a Name and a Proposal Number, **When** the table renders, **Then** the "Proposal #" cell displays the Proposal Number, not the Name.
2. **Given** a table where the "Proposal #" column is currently sourced from a field that doesn't exist on the fetched record (e.g. a misspelled field name missing the Salesforce custom-field suffix), **When** the table renders, **Then** the column still displays the correct Proposal Number, because the correct field is now fetched and mapped.
3. **Given** a proposal's linked record has no Proposal Number populated (a known Salesforce data gap), **When** the table renders, **Then** the "Proposal #" cell falls back to the proposal Name rather than showing blank, consistent with the existing fallback pattern already used elsewhere in the app (e.g. `app/proposals/page.tsx`).
4. **Given** any page that already correctly maps "Proposal #" to the Proposal Number today, **When** this change is applied, **Then** that page's behavior is unchanged.

---

### Edge Cases

- What happens when the underlying record has no proposal linked at all? The "Proposal #" cell continues to show its existing empty/placeholder state (e.g. blank or "—"), consistent with current behavior for missing data.
- What happens on pages where only a Proposal Id (not Name or Number) was previously fetched for use as a sort/link key? Fetching/mapping the Proposal Number must not remove or break that existing Id-based sort/link behavior — it only changes what is displayed in the "Proposal #" cell.
- What happens where "Proposal #" and "Proposal Name" are the only two proposal-related columns on a table? Both remain, now showing distinct values, with no columns removed or added.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every table column labeled "Proposal #" (or an equivalent proposal-number label) across the web app MUST display the proposal's Proposal Number value (Salesforce format, e.g. `PRP-26-04-000494`), not the proposal's Name.
- **FR-002**: Wherever the underlying data-fetching/mapping code does not currently retrieve the proposal's Proposal Number field, it MUST be updated to retrieve and map that field so the display change in FR-001 has real data to show.
- **FR-003**: Wherever the underlying data-fetching/mapping code references the proposal-number field under an incorrect or incomplete field name (causing it to silently fail to resolve), it MUST be corrected to the actual field name used elsewhere in the app for this same purpose.
- **FR-004**: The adjacent "Proposal Name" column (where one exists alongside "Proposal #") MUST continue to display the proposal Name, unaffected by this change.
- **FR-005**: Where a "Proposal #" column currently displays a value with no adjacent "Proposal Name" column at all, it MUST still be corrected to show the Proposal Number rather than the Name.
- **FR-006**: When a proposal record has no Proposal Number value populated, the "Proposal #" cell MUST fall back to displaying the proposal Name, matching the existing fallback convention already used in the app's correctly-implemented pages.
- **FR-007**: This correction MUST be applied consistently across every page/table in the web app currently exhibiting the duplicative Name-as-Proposal-# issue, not just a single example page.
- **FR-008**: Any existing use of a proposal Id or Name for row identity, sorting, or linking purposes (separate from what's displayed in the "Proposal #" cell) MUST continue to function unaffected by this change.

### Key Entities

- **Proposal**: A Salesforce-mastered business record with a human-entered Name and a distinct, system-generated Proposal Number (format `PRP-YY-MM-NNNNNN`). Referenced by quotes, invoices, purchase orders, supplier bills, shipments, orders, and proposal detail sub-tabs.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of "Proposal #" columns across the web app display a value distinct from the adjacent "Proposal Name" column whenever both a Name and a Proposal Number exist on the underlying record.
- **SC-002**: Zero pages are left showing the proposal Name duplicated under a "Proposal #" header once this change is complete (verified by reviewing every occurrence found across the app).
- **SC-003**: Existing sorting, linking, and empty-state behavior on all affected tables remains correct after the change, with no regressions introduced.

## Assumptions

- "Proposal #" refers to the Salesforce auto-number field on the Proposal object (format `PRP-YY-MM-NNNNNN`, e.g. `PRP-26-04-000494`), which is distinct from the proposal's Name field. This is confirmed by the app's own already-correct usage on the Proposals list and Proposal detail pages.
- Where a page currently has no "Proposal Name" column at all (only "Proposal #"), the fix still applies: the single column should show the Proposal Number, since that is what the "#" label promises.
- The existing fallback pattern (`Proposal Number, else Name`) used on the already-correct pages is the right behavior to apply everywhere, so that a temporarily missing Proposal Number doesn't leave the column blank.
- This is a display/data-mapping correction only; it does not change what proposal data is stored, how proposals are created, or any Salesforce schema.

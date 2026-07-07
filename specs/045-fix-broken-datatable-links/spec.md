# Feature Specification: Fix Broken Data Table Hyperlinks

**Feature Branch**: `045-fix-broken-datatable-links`

**Created**: 2026-07-07

**Status**: Draft

**Input**: User description: "fix the broken link in all pages datatable"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
-->

### User Story 1 - Customer Quote Line Link Never Navigates to a Broken URL (Priority: P1)

A portal user with a Hybrid-type account viewing the Supplier Bill Lines, RTV Lines, or Debit Memo Lines tabs on a Purchase Order Line's detail page clicks a populated "Customer Quote Line" value expecting to reach that quote line's record page. Today, the link is built from a field that the backend never returns for these three tabs, so the link always points to a broken URL (`/quotes/undefined/lines/{id}`) instead of a working one.

**Why this priority**: Direct code inspection (confirmed via live Salesforce data query in a prior session) found this exact defect on three tabs, all sharing the identical root cause: the visibility guard checks one field (`Customer_Quote_Line__c`, which is populated) while the link's URL is built from a different, always-absent field (`Customer_Quote__c`). This produces a link that looks clickable and styled correctly but always 404s — the worst kind of broken link because nothing about its appearance warns the user.

**Independent Test**: Can be fully tested by opening a Purchase Order Line's Supplier Bill Lines, RTV Lines, and Debit Memo Lines tabs as a Hybrid-type account with populated Customer Quote Line data, and confirming the "Customer Quote Line" cell either navigates to a working record page or displays as plain, non-clickable text — never a link whose URL contains a missing identifier.

**Acceptance Scenarios**:

1. **Given** a Hybrid-type account viewing the Supplier Bill Lines tab on a Purchase Order Line's detail page, **When** a row has a populated Customer Quote Line, **Then** clicking it either navigates successfully to the quote line's record page or the cell renders as plain text — it never renders a link whose target URL is missing a required identifier.
2. **Given** a Hybrid-type account viewing the RTV Lines tab (Returns) on a Purchase Order Line's detail page, **When** a row has a populated Customer Quote Line, **Then** the same guarantee in Scenario 1 applies.
3. **Given** a Hybrid-type account viewing the Debit Memo Lines tab (Returns) on a Purchase Order Line's detail page, **When** a row has a populated Customer Quote Line, **Then** the same guarantee in Scenario 1 applies.
4. **Given** any of the three tabs above, **When** a row's Customer Quote Line reference cannot be fully resolved to a working record page, **Then** the cell displays as plain, non-clickable text rather than a partially-broken link.

---

### User Story 2 - Every Table's Own Record Link Is Consistently Guarded (Priority: P2)

A portal user viewing the Supplier Bill Lines tab on a Purchase Order Line's detail page clicks the "Supplier Bill Line" value (the table's own sticky first column) expecting to reach that line's parent Supplier Bill record. Today, this link is built without checking that the underlying reference is actually present, while a second column two rows down (Supplier Bill #) correctly guards the very same underlying field before linking — an inconsistency that risks the same class of broken-link defect as User Story 1 if that reference is ever absent.

**Why this priority**: Direct code inspection found this specific inconsistency: one column on this tab already demonstrates the correct defensive pattern (check the reference before linking), while the table's own primary record-name column does not follow that same pattern for an identically-sourced value. This is a lower-severity, preventive fix compared to User Story 1's confirmed-broken links, since it has not been confirmed to produce a broken link in current data — it closes a gap rather than fixing an observed failure.

**Independent Test**: Can be tested by inspecting the Supplier Bill Lines tab's first column across rows with and without a populated parent Supplier Bill reference, confirming the link only renders when that reference is present, matching the existing guard already used on the tab's own "Supplier Bill #" column.

**Acceptance Scenarios**:

1. **Given** the Supplier Bill Lines tab on a Purchase Order Line's detail page, **When** a row's parent Supplier Bill reference is populated, **Then** the "Supplier Bill Line" column links to the correct record page.
2. **Given** the same tab, **When** a row's parent Supplier Bill reference is not populated, **Then** the "Supplier Bill Line" column displays as plain, non-clickable text rather than a link with a missing identifier.

---

### User Story 3 - Inventory Summary Tile Links Either Navigate or Aren't Links (Priority: P3)

A portal user viewing the Inventory landing page's "Average Days Aged" summary tile clicks the tile expecting the same filtering behavior as the other three summary tiles on the same page. Today, this tile's label, count, and unit text are each wrapped in a link that does nothing at all — no navigation, no filtering, not even a visual state change — unlike every other summary tile on this and other landing pages in the portal, which all filter the list when clicked.

**Why this priority**: Direct code inspection found these three link elements have no `onClick` handler and no real `href` target, making them the only completely non-functional links found across the entire audit of ~260 dynamic links in the portal. This ranks below User Stories 1-2 because it's a single-page cosmetic/UX inconsistency, not a data-integrity risk, and it sits in a summary tile rather than inside the data table itself.

**Independent Test**: Can be tested by clicking the "Average Days Aged" tile's label, count, and unit text on the Inventory landing page and confirming each either triggers the same kind of filtering behavior as the portal's other summary tiles, or is no longer rendered as a clickable link.

**Acceptance Scenarios**:

1. **Given** the Inventory landing page, **When** a user clicks the "Average Days Aged" tile's label, count, or "Days" unit text, **Then** the click either performs a real, visible action consistent with the page's other summary tiles, or that element is no longer rendered as a link.

---

### Edge Cases

- What happens when a Customer Quote Line reference is fully absent (not just missing the parent identifier)? The cell already correctly falls back to plain text today — this behavior must be preserved.
- What happens when an account type is neither Supplier nor Hybrid when evaluating Customer Quote Line's visibility? Gating defaults to the same behavior as Supplier-type (plain text, no hyperlink), consistent with the existing pattern on these three tabs.
- What happens if a future backend change starts returning the previously-missing parent-quote identifier? The corrected guard must allow the link to become clickable automatically once both required identifiers are present, without requiring further code changes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: On the Purchase Order Line detail page's Supplier Bill Lines tab, the Customer Quote Line cell MUST render as a hyperlink only when every identifier required to build its target URL is present; otherwise it MUST render as plain, non-clickable text.
- **FR-002**: On the Purchase Order Line detail page's RTV Lines tab (Returns), the Customer Quote Line cell MUST follow the same rule as FR-001.
- **FR-003**: On the Purchase Order Line detail page's Debit Memo Lines tab (Returns), the Customer Quote Line cell MUST follow the same rule as FR-001.
- **FR-004**: On the Purchase Order Line detail page's Supplier Bill Lines tab, the "Supplier Bill Line" column (the table's own primary record-name column) MUST render as a hyperlink only when its underlying parent-record reference is present, matching the guard already applied to the "Supplier Bill #" column on the same tab.
- **FR-005**: The Inventory landing page's "Average Days Aged" summary tile MUST either perform a real, visible action when clicked (consistent with the page's other summary tiles) or MUST NOT be rendered as a clickable link.
- **FR-006**: No other data table hyperlink in the portal identified as already correctly guarded during this feature's investigation MAY be altered — this fix is scoped to the specific defects identified, not a rewrite of working hyperlink logic.

### Key Entities *(include if feature involves data)*

- **Customer Quote Line reference**: A link from a Supplier Bill Line, RTV Line, or Debit Memo Line (all children of a Purchase Order Line) to a Customer Quote Line record; requires both a quote-line identifier and its parent quote's identifier to construct a working record-page URL.
- **Supplier Bill Line's parent reference**: The link from a Supplier Bill Line back to its own parent Supplier Bill record.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0% of Customer Quote Line links on the three affected tabs point to a URL with a missing identifier, across both Supplier-type and Hybrid-type accounts.
- **SC-002**: 100% of Customer Quote Line cells that cannot be fully resolved to a working record page render as plain text instead of a non-functional link.
- **SC-003**: The Supplier Bill Lines tab's "Supplier Bill Line" column behaves identically to its "Supplier Bill #" column with respect to when it renders as a link versus plain text.
- **SC-004**: The Inventory landing page's "Average Days Aged" tile either performs a visible action on click or is no longer a clickable link, matching user expectations set by the page's other three tiles.

## Assumptions

- This feature is scoped to the specific defects confirmed by a full, code-inspection-based audit of every dynamic hyperlink across all 231 `.tsx` files under the portal's data tables and list pages (~260 dynamic links checked) — no other broken-link defects were found in that audit as of this writing.
- "Broken link" for this feature means: a rendered, styled, clickable link element whose target URL is missing a required identifier (renders literally as `undefined` in the URL) or whose click handler performs no action at all — not a link that correctly and intentionally renders as plain text when data is unavailable (that fallback behavior is correct and must be preserved).
- The root cause of the Customer Quote Line defect (User Story 1) is a backend data-availability limitation, not a frontend logic bug in isolation: the affected endpoint never returns the parent quote's identifier for these three related-list objects. The fix therefore corrects the frontend to gracefully degrade to plain text when that identifier is absent, rather than assuming a backend change; if the backend is later updated to include the missing field, the corrected guard will automatically allow the link to work without further changes.
- User Story 2's fix is preventive/consistency-driven rather than a confirmed-broken-in-production fix, since the underlying reference (a line's own parent Supplier Bill) is a required relationship by nature and was observed populated in every live record checked — the fix closes a defensive-coding gap rather than resolving an observed failure.

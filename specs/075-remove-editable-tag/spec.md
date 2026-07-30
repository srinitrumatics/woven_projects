# Feature Specification: Remove "Editable" Tag and Align Field Styling on Purchase Order Line Page

**Feature Branch**: `075-remove-editable-tag`

**Created**: 2026-07-30

**Status**: Draft

**Input**: User description: "remove editable tag from the fields. check app/orders/[id]/lines/[lineid]/pages.tsx for edit option process and style for consistent. dont change any logic things just change only ui things"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Remove the "Editable" Tag from Fields (Priority: P1)

A portal user viewing an editable Purchase Order Line (Draft, Approved, or Awarded status) currently sees a small "Editable" text badge next to the Promise Date and Tracking Number field labels. This badge is visual clutter that duplicates information the input's own appearance (a white, bordered, focusable field versus a greyed-out read-only field) already communicates. The badge is removed so the field presentation is cleaner, while the fields themselves continue to behave exactly as they do today.

**Why this priority**: This is the explicit, literal ask — removing the tag is the minimum change that must ship, independent of any broader styling alignment.

**Independent Test**: Can be fully tested by opening a Purchase Order Line whose status is Draft, Approved, or Awarded and confirming the "Editable" label no longer appears next to Promise Date or Tracking Number, while the fields remain editable and saveable exactly as before.

**Acceptance Scenarios**:

1. **Given** a Purchase Order Line with status Draft, Approved, or Awarded, **When** the Product Information card renders, **Then** no "Editable" text badge appears next to the Promise Date label.
2. **Given** the same conditions, **When** the Product Information card renders, **Then** no "Editable" text badge appears next to the Tracking Number label.
3. **Given** the "Editable" badge has been removed, **When** the user edits and saves Promise Date and/or Tracking Number, **Then** the save behaves identically to before the change (same request, same success/failure handling, same persisted result).
4. **Given** a Purchase Order Line whose status does not permit editing, **When** the Product Information card renders, **Then** Promise Date and Tracking Number continue to display as read-only fields exactly as before (this scenario had no "Editable" tag to begin with, and must remain unaffected).

---

### User Story 2 - Align Field Presentation Style with the Order Line Detail Page (Priority: P2)

A portal user who navigates between the Order Line detail page and the Purchase Order Line detail page sees a consistent visual treatment for form fields (labels and input boxes) across both pages, using the Order Line detail page's existing field styling as the reference pattern. Only presentation (spacing, sizing, label weight/color, border and background treatment) is brought into alignment — no interaction pattern, data flow, or business rule changes.

**Why this priority**: This directly follows from the user's instruction to check the Order Line detail page "for edit option process and style for consistent." It reinforces User Story 1 by ensuring the fields still look intentionally designed once the badge is gone, but it is secondary to simply removing the tag.

**Independent Test**: Can be fully tested by visually comparing corresponding field elements (label style, input height, border/background treatment for read-only vs. editable state) on the two pages side by side and confirming they follow the same visual pattern, with no change to what data loads, what gets submitted, or when fields become editable.

**Acceptance Scenarios**:

1. **Given** the Purchase Order Line detail page's Product Information fields, **When** compared to the Order Line detail page's Product Information fields, **Then** labels and inputs follow the same visual pattern (e.g., consistent sizing and read-only field treatment), accounting for the two pages showing different data.
2. **Given** the styling has been aligned, **When** the underlying page logic is inspected (data fetching, save handling, per-status editability), **Then** it is unchanged from before this feature.

---

### Edge Cases

- What happens to the visual distinction between editable and read-only fields once the "Editable" text tag is removed? → The distinction is preserved through the input's own styling (border, background, cursor) that already differs between the two states today; removing the text badge does not remove this existing visual cue.
- Does this change affect any other page (e.g., the Order Line detail page used as the style reference)? → No; the Order Line detail page is a reference only and is not modified by this feature.
- Does this change affect which fields are editable, when they are editable, or what happens on save/failure? → No; all such behavior is explicitly out of scope and must remain identical.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Purchase Order Line detail page MUST NOT display the "Editable" text badge next to the Promise Date field label.
- **FR-002**: The Purchase Order Line detail page MUST NOT display the "Editable" text badge next to the Tracking Number field label.
- **FR-003**: Removing the badge MUST NOT change which fields render as editable inputs versus read-only inputs — the existing status-based editability rule (Draft, Approved, or Awarded = editable) MUST be preserved exactly as-is.
- **FR-004**: The visual presentation (label style, input sizing, border/background treatment) of the Product Information fields on the Purchase Order Line detail page MUST be brought into closer alignment with the equivalent field presentation on the Order Line detail page, without altering any data loading, save, or validation behavior.
- **FR-005**: No data-fetching, save, validation, error-handling, or persistence logic on the Purchase Order Line detail page may be modified as part of this change.
- **FR-006**: All existing behaviors on the Purchase Order Line detail page (save button, unsaved-change detection, save error display, per-status field editability, line navigation) MUST continue to function identically after the visual update.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The "Editable" text badge no longer appears anywhere on the Purchase Order Line detail page, verified across both editable and non-editable line statuses.
- **SC-002**: 100% of existing save and read-only field behaviors on the Purchase Order Line detail page continue to work exactly as before, verified by exercising each scenario before and after the change with identical results.
- **SC-003**: A side-by-side comparison of the Purchase Order Line detail page and the Order Line detail page shows consistent field styling (labels and inputs), with no functional differences introduced by the comparison.

## Assumptions

- "Editable tag" refers to the small uppercase text badge currently reading "Editable" shown next to the Promise Date and Tracking Number labels when a Purchase Order Line's status permits editing.
- The reference page for styling consistency is the Order Line detail page (`app/orders/[id]/lines/[lineId]/page.tsx` and its Product Information component), which already presents read-only fields without any text badge.
- Alignment is limited to visual presentation of labels and inputs (spacing, sizing, color, border/background treatment). The Order Line detail page's separate whole-page Edit/Save toggle pattern is a different interaction model and is explicitly out of scope, per the instruction not to change any logic.
- This feature only affects the Purchase Order Line detail page; the Order Line detail page is not modified.
- No other pages in the application that may use a similar "Editable" tag pattern are in scope unless later specified — this feature is scoped to the Purchase Order Line detail page only.

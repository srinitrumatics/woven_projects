# Feature Specification: Fix Invoice List — Sales Order & Purchase Order Columns Invisible in Light Mode

**Feature Branch**: `004-fix-invoice-columns-light-mode`

**Created**: 2026-06-24

**Status**: Draft

**Input**: User description: "check on invoice list page table salesorder and purchase order column table data is not visible in light mode when i check with macos laptop on google chrome browser"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Invoice List Readable in Light Mode (Priority: P1)

A user viewing the invoice list page in light mode (the system default) sees all column values clearly, including the Sales Order and Purchase Order columns. Text that was previously invisible due to missing color styling is now fully legible.

**Why this priority**: Core data on the invoice list is inaccessible to users who use light mode, which is the default on macOS. This is a regression that blocks users from reading invoice records.

**Independent Test**: Open the invoice list page (`/invoices`) in a browser with the application in light mode. Confirm that the Sales Order and Purchase Order column values are visible and readable without switching to dark mode.

**Acceptance Scenarios**:

1. **Given** the application is in light mode, **When** the user navigates to the invoice list page, **Then** the Sales Order column displays its values in a legible dark color against the white/light background.
2. **Given** the application is in light mode and an invoice has a linked Purchase Order, **When** the user views that invoice row, **Then** the Purchase Order value is visible (whether it appears as a link or plain text).
3. **Given** the application is in light mode and an invoice has no linked Purchase Order, **When** the user views that row, **Then** the "N/A" fallback text in the Purchase Order column is visible.
4. **Given** the application is in light mode and the user viewing is a manufacturer (sees plain text instead of a link), **When** they view the Purchase Order column, **Then** the plain text value is visible.
5. **Given** the application is in dark mode, **When** the user views the invoice list, **Then** both columns remain readable — the fix must not break dark mode.

---

### Edge Cases

- What happens when both Sales Order and Purchase Order values are empty strings or null? → Fallback text (empty string or "N/A") must still be visible in light mode.
- What happens on other browsers (Firefox, Safari) or Windows? → The fix must use standard color classes that work across all browsers and OS combinations, not macOS/Chrome-specific workarounds.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Sales Order column in the invoice list table MUST display its text value in a color that is legible in light mode.
- **FR-002**: The Purchase Order column plain-text fallback (shown when there is no linked Purchase Order, or when the viewer is a manufacturer) MUST display in a color that is legible in light mode.
- **FR-003**: The Purchase Order column link (shown when a Purchase Order is linked and the viewer is not a manufacturer) MUST remain legible in both light and dark mode — it already uses the primary brand color, so this requirement confirms no regression is introduced.
- **FR-004**: All fixes MUST preserve the existing legibility in dark mode — no dark-mode regressions are permitted.
- **FR-005**: The "N/A" fallback text for the Purchase Order column MUST be visible in light mode.

### Key Entities

- **Invoice list row**: A row in the invoice list table at `/invoices`. Relevant columns: Sales Order, Purchase Order.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of Sales Order and Purchase Order column cells are readable in light mode — zero instances of invisible or near-invisible text against a light background.
- **SC-002**: The fix is verified in both light mode and dark mode with no visual regression in either.
- **SC-003**: All text states (linked PO, plain-text PO, "N/A" PO, populated SO, empty SO) are legible in light mode.

## Assumptions

- The root cause is missing base (non-dark-mode) text color classes on the affected column cells in `app/invoices/page.tsx`. The Sales Order cell has no color class; the Purchase Order plain-text paths have no color class. The link path already uses the primary brand color and is not affected.
- Adding a standard dark text color class (such as a neutral dark gray) to the affected cells is sufficient to fix the issue. No layout, data, or API changes are required.
- Dark mode styling is handled via Tailwind's `dark:` modifier. The fix must include both a light-mode base color and preserve any existing `dark:` overrides, or add appropriate `dark:` overrides if none exist.
- The fix scope is limited to `app/invoices/page.tsx`. No other invoice-related files need changes.
- No permission, data fetching, or business logic changes are involved.

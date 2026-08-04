# Feature Specification: Inventory Selected-Row Color Consistency

**Feature Branch**: `102-inventory-selected-row-color`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Fix the audit's 'Colors' tier finding on Inventory List, confirmed via fresh investigation. app/inventory/page.tsx's selected-row highlight uses bg-primary/5 dark:bg-primary/10 on the row itself, but its 2 sticky (pinned-while-horizontally-scrolling) columns - the checkbox cell and the product-name cell - both override to an off-brand bg-blue-50 dark:bg-gray-700 when that row is selected, instead of a brand-primary-family token. This page's own sticky table header already establishes the correct sticky-cell convention used consistently across at least 8 other list pages in the app: bg-primary-light dark:bg-gray-900 - a solid (non-translucent) primary-family background, needed because sticky cells must fully occlude the content scrolling behind them. Fix changes both sticky cells' selected-state light-mode token from bg-blue-50 to bg-primary-light, converging onto this page's own established sticky-cell convention. The dark-mode token is left unchanged - it was never flagged as off-brand and changing it isn't necessary to resolve the color-seam defect. Explicitly out of scope: the row's own non-sticky background (already correct); the unselected-state background of both sticky cells (already correct); any other page or table in the app."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Selecting an Inventory row shows one consistent highlight color (Priority: P1)

A user selecting a row on the Inventory list, then scrolling the table horizontally, sees the same brand-colored highlight across the entire row — not a subtle brand-blue tint on most of the row that abruptly switches to a different, generic blue on the 2 columns that stay pinned in place while scrolling.

**Why this priority**: The only defect in this tier — a confirmed, isolated color-token mismatch between a row's own highlight and its pinned columns, visible specifically when a selected row is scrolled horizontally.

**Independent Test**: Select a row on the Inventory list, scroll the table horizontally, and confirm the pinned checkbox and product-name columns now show the same brand-family highlight color as the rest of the selected row, rather than a different blue.

**Acceptance Scenarios**:

1. **Given** a selected Inventory row, **When** viewed, **Then** its pinned checkbox column shows a brand-primary-family highlight color.
2. **Given** a selected Inventory row, **When** viewed, **Then** its pinned product-name column shows the same brand-primary-family highlight color.
3. **Given** an unselected Inventory row, **When** viewed, **Then** its pinned columns' appearance is completely unchanged.

### Edge Cases

- What happens to the row's own (non-sticky) selected-row background? Unchanged — it already uses the correct brand-primary token and is not part of this fix.
- What happens in dark mode? The pinned columns' dark-mode selected-state color is left unchanged — it was never flagged as off-brand (a neutral gray, not a competing accent color), and this feature's fix is specifically the light-mode blue-vs-primary mismatch.
- What happens to any other list page's sticky columns? Untouched — this feature is scoped to Inventory List only.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Inventory List's pinned checkbox column MUST show a brand-primary-family background color when its row is selected, instead of the current off-brand blue.
- **FR-002**: Inventory List's pinned product-name column MUST show the same brand-primary-family background color when its row is selected.
- **FR-003**: The dark-mode selected-state background of both pinned columns MUST NOT change as a result of this feature.
- **FR-004**: The unselected-state background of both pinned columns MUST NOT change as a result of this feature.
- **FR-005**: The selected row's own (non-sticky) background MUST NOT change as a result of this feature.
- **FR-006**: No other page or table in the app MUST be modified by this feature.
- **FR-007**: None of the fixes in this feature MUST change any business logic, data-fetching, or Salesforce read/write behavior — every change is a presentation-layer correction.

### Key Entities

- **Selected-row highlight**: The background tint applied to an Inventory row when the user selects it via its checkbox, which should render as one consistent brand-primary-family color across the entire row, including its 2 horizontally-pinned columns.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of Inventory List's selected rows show a consistent brand-primary-family highlight color across both pinned columns and the rest of the row.
- **SC-002**: 0 regressions in the unselected-state appearance of the pinned columns.
- **SC-003**: 0 regressions in dark-mode appearance for either pinned column.
- **SC-004**: 0 regressions in any business logic, data-fetching, or Salesforce interaction across all changes in this feature.

## Assumptions

- The pinned columns' selected-state light-mode color converges onto `bg-primary-light` — the same solid, non-translucent primary-family token this exact page's own sticky table header already uses, and the established convention across at least 8 other list pages in the app — rather than a new, one-off color.
- The dark-mode token is intentionally left unchanged since it was never identified as an off-brand color; only the light-mode blue-vs-primary mismatch is the confirmed defect.
- No database schema or Salesforce data changes are required — every fix is presentation-layer, consistent with the existing architecture.
- No sibling-folder propagation, commit, or push is included in this feature's scope — per this repo's established convention, those happen only when explicitly requested after implementation and verification.

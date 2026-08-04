# Feature Specification: Unauthorized Page Consistency

**Feature Branch**: `103-unauthorized-page-consistency`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Fix the audit's remaining 'Home/Dashboard/Profile/Unauthorized' tier finding on the Unauthorized page, confirmed via fresh investigation as the highest-severity still-open item in the whole audit. (1) app/unauthorized/page.tsx has zero dark: classes anywhere - bg-gray-50, bg-white, text-red-500, text-gray-800, text-gray-600 are all light-mode-only, so the page visibly breaks (wrong-colored, low-contrast) under dark mode while every sibling page in the app supports it. Fix adds the app's standard dark: variant to each element, matching the established pattern used everywhere else. (2) While in this file, also converge its 'Back to Home' button from the off-brand bg-blue-600 hover:bg-blue-700 to bg-primary hover:bg-primary-dark - the same off-brand-button-color defect already fixed on Products' Add to Order button and Admin Login in spec 097, discovered fresh during this file's investigation. Explicitly investigated and declined: the audit's other recommendation for this page - 'rebuild on the shared ErrorMessage component' - does not actually fit. ErrorMessage is shaped for an inline, in-page error state, not a full-page 403 landing with a large numeral display and a real navigation CTA. This feature keeps Unauthorized's own bespoke layout and only fixes its confirmed color-token defects."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unauthorized page supports dark mode like every other page (Priority: P1)

A user with dark mode enabled who lands on the "Access Denied" page (e.g., after trying to reach a page their account doesn't have permission for) sees a properly dark-themed page — not a jarring, unstyled light-mode card that breaks the dark experience they have everywhere else in the app.

**Why this priority**: The highest-severity item still open in the entire audit — this page has zero dark-mode support at all, unlike every other page in the app.

**Independent Test**: With dark mode enabled, trigger the Unauthorized page (e.g., by navigating to a route the current account lacks permission for) and confirm every element — background, card, heading, body text, button — renders with an appropriate dark-mode treatment.

**Acceptance Scenarios**:

1. **Given** dark mode is enabled, **When** the Unauthorized page is shown, **Then** its page background, card background, "403" numeral, heading, and body text all render in dark-mode-appropriate colors.
2. **Given** light mode (the default), **When** the Unauthorized page is shown, **Then** its appearance is unchanged from today.

---

### User Story 2 - Unauthorized page's action button matches the app's brand color (Priority: P2)

A user viewing the Unauthorized page's "Back to Home" button sees the app's standard brand-blue button — not a different, generic blue that doesn't match the rest of the app's primary-action buttons.

**Why this priority**: A real, isolated color-token mismatch discovered during this same investigation — lower urgency than dark-mode support since it's a single button on a low-traffic page, but it's the same class of confirmed defect fixed on other pages' primary buttons.

**Independent Test**: View the Unauthorized page's "Back to Home" button and confirm it renders in the app's brand `primary` color, matching primary-action buttons elsewhere in the app.

**Acceptance Scenarios**:

1. **Given** the Unauthorized page, **When** viewing its "Back to Home" button, **Then** it renders in the app's brand `primary` color rather than a generic blue.
2. **Given** the button's link destination and hover behavior, **When** used, **Then** it is completely unchanged — only the color token changes.

### Edge Cases

- What happens to the audit's recommendation to rebuild this page on the shared `ErrorMessage` component? Investigated and declined — `ErrorMessage` is shaped for a small inline error state within an otherwise-normal page (title, message, optional retry button), not a full-page 403 landing with a large numeral and a real navigation link. Forcing this page onto that shape would lose the numeral and misrepresent "Back to Home" as a retry action. This feature keeps the page's own bespoke layout.
- What happens to the page's overall structure (centered card, "403" numeral, heading, description text)? Unchanged — only color tokens are corrected, not the layout.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Unauthorized page's outer background MUST render with an appropriate dark-mode color when dark mode is enabled.
- **FR-002**: The Unauthorized page's card background, "403" numeral, heading, and body text MUST each render with an appropriate dark-mode color when dark mode is enabled.
- **FR-003**: The Unauthorized page's light-mode appearance MUST NOT change as a result of FR-001/FR-002.
- **FR-004**: The Unauthorized page's "Back to Home" button MUST render in the app's brand `primary` color instead of the current off-brand blue.
- **FR-005**: The "Back to Home" button's link destination and hover/interaction behavior MUST NOT change as a result of FR-004.
- **FR-006**: The Unauthorized page's overall layout and structure (centered card, numeral, heading, description, single CTA) MUST NOT be rebuilt onto the shared `ErrorMessage` component — this feature corrects color tokens only.
- **FR-007**: None of the fixes in this feature MUST change any business logic, routing, or Salesforce read/write behavior — every change is a presentation-layer correction.

### Key Entities

- **Unauthorized page**: The full-page "403 Access Denied" view shown when a user's account lacks permission for a route, which should support dark mode and use the app's brand color like every other page, while keeping its own distinct full-page-hero layout.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the Unauthorized page's elements (background, card, numeral, heading, body text, button) render an appropriate color in both light and dark mode.
- **SC-002**: 0 regressions in the page's light-mode appearance.
- **SC-003**: The "Back to Home" button visually matches the app's brand `primary` color used elsewhere.
- **SC-004**: 0 regressions in the button's link destination or interaction behavior.
- **SC-005**: 0 regressions in any business logic, routing, or Salesforce interaction across all changes in this feature.

## Assumptions

- Each element's dark-mode color converges onto the app's already-established pairing (`bg-white dark:bg-gray-800`, `text-gray-900 dark:text-white`, `text-gray-500`/`600 dark:text-gray-400`, `bg-gray-50 dark:bg-gray-900`) — the same pattern used consistently across dozens of other pages — rather than inventing new dark-mode tokens.
- Rebuilding this page on the shared `ErrorMessage` component is explicitly rejected as a mismatched fit for a full-page 403 landing; only the page's own color tokens are corrected.
- No database schema or Salesforce data changes are required — every fix is presentation-layer, consistent with the existing architecture.
- No sibling-folder propagation, commit, or push is included in this feature's scope — per this repo's established convention, those happen only when explicitly requested after implementation and verification.

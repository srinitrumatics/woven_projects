# Feature Specification: Admin-Portal Polish

**Feature Branch**: `100-admin-portal-polish`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Fix the audit's remaining 'Admin-Portal' tier findings, scoped to three confirmed-via-fresh-investigation genuine defects on the Super Admin portal (distinct from the old Admin RBAC subsystem, which was deleted entirely in a prior spec and is moot). (1) Organization Detail's page heading uses font-bold, while Organization List's equivalent page heading uses font-semibold for the same visual tier - fix changes Organization Detail's heading to font-semibold, matching List. (2) Organization Detail's sync-run history rows render each run's status as a raw inline span with ad hoc color logic instead of the shared StatusBadge component already used consistently across the rest of the app. Fix migrates this to StatusBadge, requiring one new addition to StatusBadge's shared vocabulary: 'completed_with_errors', mapped into the same green bucket as 'completed' - preserving the exact current visual behavior while gaining case-insensitivity and consistency with the shared component. (3) Admin Login's four decorative icons (ShieldCheck, Mail, Lock, ArrowRight) have no aria-hidden='true', so screen readers may announce them redundantly alongside their already-labeled sibling inputs/heading/button - fix adds aria-hidden='true' to all 4. Explicitly out of scope: the broader indigo/purple/amber action-button color scheme on Organization Detail/Create - a separate, larger judgment call not yet decided; no other Admin-Portal pages are touched."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Organization Detail's sync history uses the app's standard status colors (Priority: P1)

A Super Admin reviewing an organization's sync-run history sees each run's status colored consistently with how every other status pill in the app renders — not a one-off local color rule that happens to look similar but isn't built on the same shared logic.

**Why this priority**: The clearest structural inconsistency in this tier — a bespoke, hand-rolled status-color rule sitting right alongside a codebase-wide shared component built for exactly this purpose, on a page that already imports and uses shared primitives elsewhere.

**Independent Test**: Open an Organization's Detail page, view its sync-run history, and confirm each run's status renders via the same visual component (shape, sizing, color logic) used for every other status pill in the app, with completed/completed-with-errors runs still green and failed runs still red.

**Acceptance Scenarios**:

1. **Given** a completed sync run, **When** viewed in Organization Detail's history, **Then** its status renders in the shared component's green styling.
2. **Given** a sync run that completed with errors, **When** viewed, **Then** its status also renders in green, matching today's behavior.
3. **Given** a failed sync run, **When** viewed, **Then** its status renders in the shared component's red styling.
4. **Given** any other status value, **When** viewed, **Then** it renders in the shared component's neutral/gray styling, matching today's fallback behavior.

---

### User Story 2 - Organization Detail's heading matches Organization List's (Priority: P2)

A Super Admin navigating from the Organizations list into a specific organization's detail page sees the page heading rendered at the same visual weight as the list page's heading — not a noticeably bolder heading appearing for no apparent reason between two pages in the same flow.

**Why this priority**: A real, isolated visual mismatch between 2 pages in the same immediate navigation flow — lower urgency than User Story 1 since it's a pure style difference, not a structural inconsistency.

**Independent Test**: Open Organization List, note its heading's visual weight, then click into any organization's Detail page and confirm the heading now matches.

**Acceptance Scenarios**:

1. **Given** Organization Detail's page heading, **When** viewed, **Then** it renders at the same font weight as Organization List's page heading.
2. **Given** Organization Detail's heading, **When** viewed, **Then** its size, color, and text content are otherwise unchanged.

---

### User Story 3 - Admin Login's decorative icons don't clutter screen-reader output (Priority: P3)

A Super Admin using a screen reader on Admin Login hears only the meaningful labels for the page's inputs, heading, and button — not additional, redundant announcements for the purely decorative icons that sit alongside them.

**Why this priority**: Lowest priority — a small accessibility polish item affecting only assistive-technology users of one low-traffic page, with no visual or functional change for anyone else.

**Independent Test**: Inspect Admin Login's 4 decorative icons via the browser's accessibility tree or a screen reader and confirm none of them are announced as separate, unlabeled elements.

**Acceptance Scenarios**:

1. **Given** Admin Login's icon-and-text heading, mail icon, lock icon, and button arrow icon, **When** inspected via assistive technology, **Then** all 4 are hidden from the accessibility tree.
2. **Given** Admin Login's visual appearance, **When** viewed, **Then** it is completely unchanged — this is an assistive-technology-only correction.

### Edge Cases

- What happens to the broader indigo/purple/amber action-button color scheme on Organization Detail/Create (Load Products/Index Products/Retry Indexing)? Left completely untouched — this is a separate, larger judgment call about whether distinct semantic action colors are intentional, not yet decided, and explicitly out of scope for this feature.
- What happens to any other Admin-Portal page not named above? Untouched — this feature's scope is limited to the 3 confirmed defects on Organization Detail and Admin Login.
- What happens if a sync run's status is some value neither "completed", "completed_with_errors", nor "failed" (e.g. "running")? It falls through to the shared component's existing default/neutral styling, identical to today's behavior for any unrecognized status.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Organization Detail's sync-run history rows MUST render each run's status using the app's shared status-badge component instead of a page-local color rule.
- **FR-002**: A sync run with status "completed" or "completed_with_errors" MUST continue to render in green, exactly as it does today.
- **FR-003**: A sync run with status "failed" MUST continue to render in red, exactly as it does today.
- **FR-004**: Any other sync-run status value MUST continue to render in the same neutral/gray fallback it does today.
- **FR-005**: Organization Detail's page heading MUST render at the same font weight as Organization List's page heading.
- **FR-006**: Organization Detail's heading's size, color, and text content MUST NOT change as a result of FR-005.
- **FR-007**: Admin Login's ShieldCheck, Mail, Lock, and ArrowRight icons MUST be hidden from the accessibility tree.
- **FR-008**: Admin Login's visual appearance MUST NOT change as a result of FR-007.
- **FR-009**: The broader action-button color scheme (indigo/purple/amber) on Organization Detail/Create MUST NOT be modified by this feature.
- **FR-010**: None of the fixes in this feature MUST change any business logic, data-fetching, or Salesforce/sync behavior — every change is a presentation-layer correction.

### Key Entities

- **Sync-run status**: The state of a product-load or product-index background run ("completed", "completed_with_errors", "failed", or other in-progress/unrecognized values), which should be visually communicated the same way every other status in the app is.
- **Page heading**: The top-level `<h1>`-equivalent title of a page within the Organizations page family, which should share one visual weight across sibling pages.
- **Decorative icon**: A purely illustrative icon with no independent meaning beyond the labeled control it sits beside, which should not be separately announced to assistive technology.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of Organization Detail's sync-run status renders use the shared status-badge component.
- **SC-002**: 0 visual regressions in sync-run status coloring across all observed status values (completed, completed with errors, failed, other).
- **SC-003**: Organization Detail's page heading visually matches Organization List's heading weight.
- **SC-004**: 0 regressions in Admin Login's visual appearance after the accessibility fix.
- **SC-005**: 0 of Admin Login's 4 decorative icons are separately exposed to assistive technology.
- **SC-006**: 0 regressions in any business logic, data-fetching, or sync behavior across all changes in this feature.

## Assumptions

- Adding "completed_with_errors" to the shared status-badge component's vocabulary (in the same color bucket as "completed") is the correct approach, since it's confirmed via codebase-wide search to be a real, distinct, non-colliding status value used only by this sync-run flow — this preserves exact current visual behavior while gaining consistency with the shared component, following the same low-risk vocabulary-addition precedent used in prior specs.
- Organization Detail's heading converges onto Organization List's font weight (rather than the reverse) since List is the entry point a Super Admin sees first, and matching it prevents a jarring weight change one click later.
- The 4 decorative icons on Admin Login have no independent meaning for assistive-technology users beyond the labeled control they accompany, so hiding them is a pure improvement with no information loss.
- No database schema or Salesforce/sync-service changes are required — every fix is presentation-layer, consistent with the existing architecture.
- No sibling-folder propagation, commit, or push is included in this feature's scope — per this repo's established convention, those happen only when explicitly requested after implementation and verification.

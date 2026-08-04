# Feature Specification: Accessibility Improvements

**Feature Branch**: `093-accessibility-improvements`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Fix the audit's 'Accessibility' tier, based on a fresh current-state re-audit (one original audit claim was stale and corrected below). Covers: (1) Icon-only buttons missing aria-label: Admin-Portal Organizations List's edit and delete row-action icon buttons (app/(admin-portal)/admin-portal/organizations/page.tsx), and 3 of Header.tsx's icon-only buttons (notification bell, account/org selector, user-avatar dropdown) — confirmed the hamburger menu button the audit named already has aria-label=\"Open menu\" and the theme-toggle button already has aria-label=\"Toggle dark mode\", so those two are dropped from scope as stale. (2) Error/success banners missing role=\"alert\"/aria-live: SignInForm.tsx's error banner, ForgotPasswordForm.tsx's error and success banners (which also auto-clear via setTimeout before most screen-reader users would discover them), and the Admin Login page's error banner — none announce themselves to assistive tech today. (3) Profile page (app/profile/page.tsx) form fields not programmatically associated via htmlFor/id: Job Title select, Mobile Phone, Work Phone, Birthdate, and the Street/City/State/Postal/Country address inputs — every editable field's label is a plain <label> with no htmlFor, and no control has a matching id. (4) Quote Line Detail's disabled Prev/Next navigation controls (app/quotes/[id]/lines/[lineid]/page.tsx) are rendered as plain non-focusable <span> elements instead of real <button disabled> elements — keyboard-unreachable and not announced as controls to assistive tech. (5) Admin-Portal Organization Detail's expandable sync-history row (app/(admin-portal)/admin-portal/organizations/[id]/page.tsx) is a <div onClick> with no role=\"button\", no tabIndex, and no onKeyDown handler — a confirmed keyboard trap reachable only by mouse. (6) Admin-Portal Organization Create's multi-step wizard (app/(admin-portal)/admin-portal/organizations/create/page.tsx) has step-indicator <div>s with only visual state and no aria-current=\"step\", no <nav>/<ol> semantics — the only step context conveyed to assistive tech is a plain-text \"Step X of 3\" string not programmatically linked to the visual indicators."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Every icon-only button announces its purpose (Priority: P2)

A screen-reader user browsing the Admin-Portal Organizations List or the main app's Header hears a meaningful name for every icon-only button — "Edit organization", "Delete organization", "Notifications", "Select account", "User menu" — instead of silence or a generic "button" announcement.

**Why this priority**: A real, recurring gap across two high-traffic surfaces (a primary list page and the global Header present on every authenticated page), but lower urgency than the outright keyboard traps and unannounced dynamic content below, since these controls are still visually discoverable and operable by mouse/touch users.

**Independent Test**: Using a screen reader (or the browser accessibility tree inspector), tab to each of the 5 identified icon-only buttons and confirm each announces a specific, meaningful label rather than being silent or generic.

**Acceptance Scenarios**:

1. **Given** the Admin-Portal Organizations List, **When** a screen-reader user reaches an organization row's edit or delete icon button, **Then** it announces "Edit organization" / "Delete organization" (or equivalently specific wording), not silence.
2. **Given** any authenticated page, **When** a screen-reader user reaches the Header's notification bell, account/org selector, or user-avatar dropdown button, **Then** each announces a specific, meaningful label.
3. **Given** the Header's hamburger menu and theme-toggle buttons, **When** inspected, **Then** they are confirmed unchanged (already correctly labeled) — this feature does not touch them.

---

### User Story 2 - Error and success messages are announced when they appear (Priority: P1)

A screen-reader user who submits the Sign In form, the Forgot Password form, or the Admin Login form with invalid input is told about the resulting error message as soon as it appears, without needing to manually navigate to find it — and if a message is timed to disappear, they are given a real chance to perceive it before it's gone.

**Why this priority**: Highest priority in this tier — a user who cannot perceive why their sign-in or password-reset attempt failed is fully blocked from a critical, often time-sensitive task (getting into the app or recovering account access), with no workaround.

**Independent Test**: Using a screen reader, submit each of the 3 forms with input that triggers an error (or, for Forgot Password, a success message) and confirm the message is announced automatically without requiring manual navigation to locate it.

**Acceptance Scenarios**:

1. **Given** the Sign In form, **When** a user submits invalid credentials, **Then** the resulting error message is automatically announced to assistive technology.
2. **Given** the Forgot Password form, **When** an error or success message appears, **Then** it is automatically announced, and it remains perceivable long enough (or persists until dismissed/replaced) rather than silently auto-clearing before a screen-reader user can act on it.
3. **Given** the Admin Login page, **When** a user submits invalid credentials, **Then** the resulting error message is automatically announced.

---

### User Story 3 - Profile form fields are properly labeled for assistive technology (Priority: P2)

A screen-reader user editing their Profile can identify what each field is for by its associated label being read aloud when the field receives focus, and can click any field's visible label text to move focus into that field.

**Why this priority**: A real, if narrower, gap — confined to one page (Profile) — versus the cross-cutting reach of the banner and icon-button issues above, but it affects every field on a page users return to regularly to keep their own account information current.

**Independent Test**: Using a screen reader, tab through every editable field on the Profile page and confirm each announces its correct label; click each visible label and confirm focus moves to its corresponding field.

**Acceptance Scenarios**:

1. **Given** the Profile page, **When** a screen-reader user tabs to the Job Title select, Mobile Phone, Work Phone, or Birthdate field, **Then** the correct label is announced for each.
2. **Given** the Profile page's address section, **When** a screen-reader user tabs to the Street, City, State, Postal Code, or Country field, **Then** the correct label is announced for each.
3. **Given** any of the above fields, **When** a mouse/touch user clicks its visible label text, **Then** focus moves into that field.

---

### User Story 4 - Disabled Prev/Next controls behave like real, inert buttons (Priority: P2)

A keyboard user navigating Quote Line Detail's line-by-line Prev/Next controls sees a disabled control announced and skipped consistently when it has no more lines to go to, exactly as any other disabled button would behave.

**Why this priority**: A real gap on a single page, but the underlying navigation itself is not blocked — the enabled direction always continues to work — so the impact is narrower than the full-page keyboard trap below.

**Independent Test**: On Quote Line Detail's first or last line, tab through the page's controls with a keyboard and confirm the disabled Prev/Next control does not silently disappear from expectations — it is either properly skipped as a disabled control or, if reached, announced as disabled.

**Acceptance Scenarios**:

1. **Given** the first line in Quote Line Detail, **When** a user reaches the Prev control, **Then** it behaves as a real disabled button (announced as disabled, not focusable as if active).
2. **Given** the last line in Quote Line Detail, **When** a user reaches the Next control, **Then** it behaves the same way.
3. **Given** a line that is neither first nor last, **When** a user activates Prev or Next, **Then** navigation continues to work exactly as it does today.

---

### User Story 5 - Every clickable control is keyboard-operable (Priority: P1)

A keyboard-only user viewing Admin-Portal Organization Detail's sync-history list can expand a failed sync run's details using only the keyboard, exactly as a mouse user already can by clicking.

**Why this priority**: Tied for highest priority — this is a genuine keyboard trap where an entire piece of functionality (viewing why a sync failed) is completely unreachable without a mouse, not just an announcement gap.

**Independent Test**: Using only a keyboard, tab to a failed sync run's row in Admin-Portal Organization Detail and confirm it can be expanded (and collapsed again) using Enter or Space, exactly as clicking it already does.

**Acceptance Scenarios**:

1. **Given** a sync run row with failures, **When** a keyboard user tabs to it and presses Enter or Space, **Then** the failure details expand exactly as a mouse click would produce.
2. **Given** an expanded sync run row, **When** a keyboard user presses Enter or Space again, **Then** it collapses.
3. **Given** a sync run row with no failures (not expandable today), **When** a keyboard user tabs through the list, **Then** it is not presented as an interactive control, matching its current non-clickable behavior.

---

### User Story 6 - Multi-step wizard progress is announced to assistive technology (Priority: P3)

A screen-reader user creating a new organization in the Admin Portal is told which step they are currently on, in a way that's programmatically tied to the visual step indicator, not just conveyed through a separate plain-text string.

**Why this priority**: Lowest priority — the plain-text "Step X of 3" string already conveys the same information today, just not in the ideal programmatically-associated form; this is a refinement, not a gap that blocks a user outright.

**Independent Test**: Using a screen reader, navigate through Admin-Portal Organization Create's steps and confirm the current step is announced as the active step via the step indicator itself, not solely via the separate text string.

**Acceptance Scenarios**:

1. **Given** Organization Create's step 1, **When** a screen-reader user reaches the step indicator, **Then** step 1 is announced as the current step.
2. **Given** the user advances to step 2, **When** they reach the step indicator again, **Then** step 2 is now announced as current and step 1 is not.

### Edge Cases

- What happens to Forgot Password's timed success/error messages once they gain `aria-live`/`role="alert"`? They must still visually behave as they do today (same timing, same styling) — only their announcement to assistive technology changes, not their visible duration, unless the auto-clear timing itself is confirmed too short to be perceived by a screen-reader user, in which case the duration may be extended as part of this fix.
- What happens to the 2 Header buttons the audit was wrong about (hamburger, theme toggle)? They must show zero changes — already correctly labeled.
- What happens to Quote Line Detail's *enabled* Prev/Next controls? Unaffected — this feature only changes the disabled-state rendering.
- What happens to a sync-history row that isn't expandable (no failures)? It must not gain keyboard/button semantics it doesn't need — only genuinely-interactive rows change.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Admin-Portal Organizations List's edit and delete row-action icon buttons MUST each have a specific, meaningful accessible label.
- **FR-002**: Header's notification bell, account/org selector, and user-avatar dropdown buttons MUST each have a specific, meaningful accessible label.
- **FR-003**: Header's hamburger menu and theme-toggle buttons MUST NOT be modified by this feature (already correctly labeled).
- **FR-004**: SignInForm's error banner MUST be automatically announced to assistive technology when it appears.
- **FR-005**: ForgotPasswordForm's error and success banners MUST be automatically announced to assistive technology when they appear, and MUST remain perceivable long enough for a screen-reader user to register them before auto-clearing.
- **FR-006**: The Admin Login page's error banner MUST be automatically announced to assistive technology when it appears.
- **FR-007**: Every editable field on the Profile page (Job Title, Mobile Phone, Work Phone, Birthdate, Street, City, State, Postal Code, Country) MUST have its label programmatically associated with its control, such that activating the label moves focus to the control and assistive technology announces the correct label when the control receives focus.
- **FR-008**: Quote Line Detail's disabled Prev/Next controls MUST be implemented as real disabled button elements, not non-focusable static elements.
- **FR-009**: Quote Line Detail's enabled Prev/Next navigation behavior MUST remain unchanged.
- **FR-010**: Admin-Portal Organization Detail's expandable sync-history rows MUST be operable via keyboard (Enter/Space) with the same expand/collapse behavior as a mouse click, and MUST be identifiable as interactive controls to assistive technology.
- **FR-011**: Sync-history rows with no expandable content MUST NOT be given interactive/button semantics they don't need.
- **FR-012**: Admin-Portal Organization Create's step indicator MUST programmatically convey which step is currently active to assistive technology.
- **FR-013**: None of the fixes in this feature MUST change any business logic, data-fetching, form validation, or Salesforce read/write behavior — every change is an accessibility/semantic-markup correction to existing, already-working UI behavior.

### Key Entities

- **Icon-only button**: A button whose only visible content is an icon (no visible text label), requiring a programmatic accessible name for assistive technology.
- **Error/success banner**: A transient or persistent message region communicating form-submission outcome, requiring an ARIA live-region role so its appearance is announced without manual navigation.
- **Form field label association**: The programmatic link (`htmlFor`/`id` or equivalent) between a visible `<label>` and its corresponding input/select control.
- **Disabled navigation control**: A Prev/Next-style control that is inert in one direction at the start/end of a sequence, requiring real disabled-button semantics rather than a static non-interactive element.
- **Keyboard-operable custom control**: A non-native clickable element (e.g. a `<div>` acting as an expand/collapse toggle) requiring `role`, keyboard focus, and key-handling to be operable without a mouse.
- **Wizard step indicator**: A multi-step progress UI requiring `aria-current="step"` (or equivalent) so the active step is programmatically identifiable, not just visually distinct.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the 5 identified icon-only buttons (2 in Organizations List, 3 in Header) have a specific accessible label, verified via accessibility tree inspection.
- **SC-002**: 100% of the 3 identified error/success banners are announced to assistive technology automatically, with 0 requiring manual navigation to discover.
- **SC-003**: 100% of the 9 identified Profile page fields have their label programmatically associated with their control.
- **SC-004**: 100% of Quote Line Detail's disabled Prev/Next states are implemented as real disabled buttons, with 0 regressions to enabled-state navigation.
- **SC-005**: 100% of Admin-Portal Organization Detail's expandable sync-history rows are operable via keyboard alone, with 0 regressions to mouse-click behavior.
- **SC-006**: 100% of Admin-Portal Organization Create's steps programmatically announce their active/inactive state via the step indicator.
- **SC-007**: 0 regressions in any business logic, data-fetching, form validation, or Salesforce interaction across all changes in this feature.

## Assumptions

- The audit's claim that Header's hamburger menu button lacks an `aria-label` was investigated and found stale — it already has `aria-label="Open menu"` — and is dropped from this feature's scope. The theme-toggle button was likewise confirmed to already have `aria-label="Toggle dark mode"` and is also out of scope.
- Fresh investigation found 3 additional Header icon-only buttons (notification bell, account/org selector, user-avatar dropdown) missing `aria-label` that the original audit text did not specifically enumerate — these are included in scope since they are the same confirmed defect category the audit's "Header's hamburger in one spot" claim was gesturing at, just on different specific buttons.
- ForgotPasswordForm's timed messages' exact auto-clear duration is not being redesigned wholesale — only extended if needed to give a screen-reader user a real chance to perceive the announcement, per FR-005; the visual/timing behavior for sighted users is otherwise unchanged.
- No database schema or Salesforce data changes are required — every fix is presentation-layer markup/ARIA-attribute correction to existing, already-functioning UI behavior, per the existing architecture where business data is mastered in Salesforce and the app is a presentation layer over it.
- No sibling-folder propagation, commit, or push is included in this feature's scope — per this repo's established convention, those happen only when explicitly requested after implementation and verification.

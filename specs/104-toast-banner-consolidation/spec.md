# Feature Specification: Toast Banner Consolidation

**Feature Branch**: `104-toast-banner-consolidation`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Fix the audit's remaining 'Forms'/'Toast' tier findings, confirmed via fresh investigation. Both components/ForgotPasswordForm.tsx and app/profile/page.tsx still show save/submit feedback via hand-rolled inline banners with manual setTimeout-based auto-clear, instead of the shared useToast() hook already used elsewhere in the app. The ToastProvider is already mounted at the app root, so both files already have access to useToast() with no new provider wiring needed. (1) app/profile/page.tsx's message state drives an inline banner auto-cleared by a single useEffect setTimeout at 5000ms. Fix replaces every setMessage call with the equivalent useToast().success/error call (matching the existing 5000ms duration), removes the message state, its clearing useEffect, and the inline banner JSX entirely. The separate fieldErrors state and the window.scrollTo call are untouched. (2) components/ForgotPasswordForm.tsx's error/success state strings drive 2 inline banners each auto-cleared by its own setTimeout call. Fix replaces every setError/setSuccess + setTimeout pair with the equivalent useToast() call (preserving each call site's existing duration), removing the error/success state and both inline banner JSX blocks entirely. The separate setTimeout calls that advance step or navigate are unrelated timers and are left completely untouched. Explicitly out of scope: any other content or behavior of either file."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Profile save feedback looks like every other toast in the app (Priority: P1)

A user saving changes on their Profile page sees the same floating toast notification used everywhere else in the app to confirm success or report an error — not an inline banner pushed into the page's own layout that only this one page uses.

**Why this priority**: Higher-severity of the two remaining findings (the audit rates this High vs. Forgot Password's Medium) — Profile is a frequently-visited page, and its feedback mechanism is entirely bespoke.

**Independent Test**: Save a valid profile change and confirm a success toast appears (matching the app's standard toast style) instead of an inline banner; trigger a save error and confirm an error toast appears the same way.

**Acceptance Scenarios**:

1. **Given** a successful profile save, **When** the save completes, **Then** a success toast appears with the existing confirmation message, auto-dismissing after the same duration as before.
2. **Given** a failed profile save (server error or validation failure), **When** the failure occurs, **Then** an error toast appears with the existing error message.
3. **Given** individual field-level validation errors (e.g., an invalid phone number), **When** they occur, **Then** they continue to display inline next to their field exactly as before — unaffected by this change.

---

### User Story 2 - Forgot Password's messages use the same toast mechanism as the rest of the app (Priority: P2)

A user requesting a password reset or submitting a new password sees the same floating toast notification used everywhere else in the app — not a form-embedded colored banner unique to this one flow.

**Why this priority**: The same class of fix as User Story 1, on a lower-traffic form — worth doing for full consistency but less impactful than Profile.

**Independent Test**: Submit the Forgot Password email step and confirm success/error is shown via a toast; submit the reset-code step (both validation failures and server responses) and confirm the same.

**Acceptance Scenarios**:

1. **Given** a successful "send reset code" request, **When** it completes, **Then** a success toast appears with the existing message, and the form still advances to the code-entry step after its existing delay.
2. **Given** a failed "send reset code" request (validation or server error), **When** it fails, **Then** an error toast appears with the existing message.
3. **Given** the reset-code step's client-side validation (code format, password match, password strength) or its server response, **When** either fails or succeeds, **Then** the corresponding toast appears with the existing message, and a successful reset still redirects to Sign In after its existing delay.

### Edge Cases

- What happens to Profile's field-level validation errors (shown inline next to each field)? Unchanged — this feature only replaces the generic success/error banner, not per-field validation display.
- What happens to Profile's `scrollTo`-to-top behavior on validation failure? Unchanged — it still has value for revealing the now-visible field-level errors, independent of where the generic message is shown.
- What happens to Forgot Password's step-advance (to the code-entry step) and post-reset redirect timers? Unchanged — those are unrelated to message display and continue to fire on their existing schedules.
- What happens to each message's visible-duration? Preserved exactly — each toast call uses the same duration the corresponding banner's `setTimeout` used today (5000ms for Profile; 3000ms or 5000ms per call site for Forgot Password, matching what's there now).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Profile's success and error feedback MUST be shown via the app's shared toast mechanism instead of an inline banner.
- **FR-002**: Profile's field-level validation errors MUST continue to display inline next to their respective fields, unaffected by FR-001.
- **FR-003**: Forgot Password's success and error feedback (both steps) MUST be shown via the app's shared toast mechanism instead of inline banners.
- **FR-004**: Forgot Password's step-advance and post-reset-redirect timing MUST NOT change as a result of FR-003.
- **FR-005**: Each migrated message's auto-dismiss duration MUST match the duration its former inline banner used.
- **FR-006**: None of the fixes in this feature MUST change any business logic, data submission, or Salesforce read/write behavior — every change is a presentation-layer correction to how feedback is displayed.

### Key Entities

- **Save/submit feedback message**: A success or error message shown after a user action (profile save, password-reset request, password-reset submission), which should render as the app's standard floating toast rather than a page-specific inline banner.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of Profile's and Forgot Password's success/error feedback renders via the shared toast mechanism.
- **SC-002**: 0 regressions in Profile's field-level validation display.
- **SC-003**: 0 regressions in Forgot Password's step-advance or redirect timing.
- **SC-004**: Each toast's visible duration matches its former inline banner's duration.
- **SC-005**: 0 regressions in any business logic, data submission, or Salesforce interaction across all changes in this feature.

## Assumptions

- The shared toast mechanism is already available in both files with no new setup, since its provider is mounted at the application root.
- Preserving each message's exact prior duration (rather than adopting the toast mechanism's own default duration everywhere) keeps this a presentation-layer consistency fix rather than a behavior change.
- Profile's field-level validation errors and Forgot Password's non-message timers (step-advance, redirect) are explicitly out of scope — only the generic success/error banner mechanism is replaced.
- No database schema or Salesforce data changes are required — every fix is presentation-layer, consistent with the existing architecture.
- No sibling-folder propagation, commit, or push is included in this feature's scope — per this repo's established convention, those happen only when explicitly requested after implementation and verification.

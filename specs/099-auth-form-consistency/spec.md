# Feature Specification: Auth Form Consistency

**Feature Branch**: `099-auth-form-consistency`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Fix the audit's 'Forms'/'Buttons' tier for the auth surface, scoped to two confirmed-via-fresh-investigation genuine defects on Sign In and Sign Up. (1) Both components/SignInForm.tsx and components/SignUpForm.tsx render Facebook/Google 'social sign-in' buttons that have zero onClick handler or any other wiring - confirmed no OAuth/social-login backend integration exists anywhere in the codebase. These buttons are fully decorative dead UI shipping the illusion of a login method that doesn't work, the same class of issue as the Invoice 'Pay Now' gap resolved in spec 083. Fix removes both social-login button blocks entirely from both forms. (2) components/SignUpForm.tsx's password field show/hide toggle is a plain text button reading 'Show'/'Hide', while the equivalent control on components/SignInForm.tsx and components/ForgotPasswordForm.tsx both use the identical eye-icon SVG toggle - a copy-paste-drift inconsistency across 3 instances of the identical control within the same 3-form auth flow. Fix replaces SignUpForm's text toggle with the same eye-icon SVG markup already used identically by the other 2 forms, preserving its existing aria-label and onClick logic. Also folded in as a small 3rd fix since it's the same control: ForgotPasswordForm's eye-icon toggle button is missing the aria-label its own SignInForm sibling already has - add the identical aria-label pattern to close that gap too. Explicitly out of scope: the confirm-password field on SignUpForm has no show/hide toggle at all today and this feature does not add one; broader Typography-category findings are a separate, not-yet-investigated audit category and are not part of this feature."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - No fake login options on Sign In or Sign Up (Priority: P1)

A user visiting Sign In or Sign Up sees only the login methods that actually work — not Facebook, Google, and LinkedIn buttons that look clickable but silently do nothing when pressed, which erodes trust in the whole login experience.

**Why this priority**: The clearest actual defect in this tier — three buttons per form (6 total) that are completely non-functional, shipping the appearance of a capability that doesn't exist. This is worse than a style inconsistency because it actively misleads a user into attempting something that cannot succeed.

**Independent Test**: Open Sign In and Sign Up and confirm neither page shows a Facebook, Google, or LinkedIn sign-in button; confirm the email/password form and its existing controls are otherwise unaffected.

**Acceptance Scenarios**:

1. **Given** the Sign In page, **When** viewed, **Then** no Facebook, Google, or LinkedIn sign-in button is present.
2. **Given** the Sign Up page, **When** viewed, **Then** no Facebook, Google, or LinkedIn sign-in button is present.
3. **Given** either page's remaining email/password form, **When** used, **Then** its existing submit/validation/error behavior is completely unchanged.

---

### User Story 2 - The password show/hide control looks and behaves the same on every auth form (Priority: P2)

A user typing a password on Sign In, Sign Up, or Forgot Password sees the identical eye-icon toggle to reveal or hide it — not a plain "Show"/"Hide" text link on one form while the other two use an icon, and the control is announced consistently to assistive technology on all three.

**Why this priority**: A real, isolated copy-paste-drift inconsistency across 3 instances of literally the same control within one flow — lower urgency than User Story 1 since nothing is broken, but it's the clearest remaining visual/behavioral mismatch in the auth surface.

**Independent Test**: Open Sign In, Sign Up, and Forgot Password in sequence and confirm each one's password field shows the identical eye-icon toggle button, and that a screen reader announces the same "Show password"/"Hide password" label on all three.

**Acceptance Scenarios**:

1. **Given** Sign Up's password field, **When** viewed, **Then** its show/hide control renders the same eye-icon SVG already used by Sign In and Forgot Password, not plain text.
2. **Given** Sign Up's password toggle, **When** clicked, **Then** it still correctly reveals/hides the password exactly as it did before this fix.
3. **Given** Forgot Password's password toggle, **When** inspected via assistive technology, **Then** it announces "Show password"/"Hide password" exactly as Sign In's equivalent control already does.

### Edge Cases

- What happens to Sign Up's confirm-password field? It has no show/hide toggle today and this feature does not add one — adding a new control would be new functionality, not a consistency fix, and is explicitly out of scope.
- What happens if a user had bookmarked or relied on the social-login buttons in some way? They were never functional (no `onClick`, no backend), so no working capability is removed — only decorative, always-inert UI.
- What happens to the rest of each auth form's layout after the social-login buttons are removed (the "or continue with" divider, spacing, etc.)? Any now-orphaned divider/spacing markup that existed solely to introduce the social buttons is removed along with them; the remaining email/password form fields are otherwise untouched.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sign In MUST NOT render a Facebook, Google, or LinkedIn sign-in button.
- **FR-002**: Sign Up MUST NOT render a Facebook, Google, or LinkedIn sign-in button.
- **FR-003**: Removing the social-login buttons MUST NOT change either form's email/password submit, validation, or error-handling behavior.
- **FR-004**: Sign Up's password field MUST use the same eye-icon toggle control already used by Sign In and Forgot Password, rendering an icon rather than plain "Show"/"Hide" text.
- **FR-005**: Sign Up's password toggle's existing reveal/hide behavior MUST continue to work exactly as before this fix.
- **FR-006**: Forgot Password's password toggle MUST have the same accessible label ("Show password"/"Hide password") that Sign In's equivalent control already has.
- **FR-007**: Sign Up's confirm-password field MUST NOT gain a new show/hide toggle — this feature does not add new functionality, only corrects existing inconsistencies.
- **FR-008**: None of the fixes in this feature MUST change any business logic, authentication behavior, or Salesforce read/write behavior — every change is a presentation-layer correction (removing dead UI, aligning existing markup, adding a missing accessible label).

### Key Entities

- **Social sign-in button**: A Facebook, Google, or LinkedIn-branded button rendered on Sign In and Sign Up with no functional wiring — decorative dead UI to be removed.
- **Password show/hide toggle**: The control that switches a password input between masked and plain text, which should render and behave identically across all 3 auth forms that have one (Sign In, Sign Up, Forgot Password).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 non-functional social-login buttons (of the 6 total across both forms) remain on Sign In or Sign Up.
- **SC-002**: 0 regressions in either form's email/password submit, validation, or error-handling behavior.
- **SC-003**: 100% of the 3 auth forms with a password show/hide toggle (Sign In, Sign Up, Forgot Password) render the identical eye-icon control.
- **SC-004**: 100% of those 3 forms' password toggles expose the same accessible label to assistive technology.
- **SC-005**: 0 regressions in any business logic, authentication, or Salesforce interaction across all changes in this feature.

## Assumptions

- Removing the social-login buttons (rather than wiring them to a real backend) is the correct fix, consistent with this repo's established precedent (spec `083`'s Invoice "Pay Now" decision): shipping a placeholder/fake control for functionality that doesn't exist is worse than removing it, and no OAuth/social-login backend exists anywhere in this codebase to wire to.
- Sign Up's password toggle converges onto the eye-icon SVG (the convention already used by 2 of the 3 forms) rather than the other 2 forms converging onto plain text — the icon is both the majority convention and the more standard, accessible pattern for this control.
- Forgot Password's toggle gaining an `aria-label` is a small, low-risk addition folded into this same feature since it's the identical control being touched by User Story 2, not a separate accessibility audit pass.
- No database schema or Salesforce data changes are required — every fix is presentation-layer, consistent with the existing architecture.
- No sibling-folder propagation, commit, or push is included in this feature's scope — per this repo's established convention, those happen only when explicitly requested after implementation and verification.

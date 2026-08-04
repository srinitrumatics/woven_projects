# Feature Specification: Auth Error Banner Consistency

**Feature Branch**: `101-auth-error-banner-consistency`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Fix the audit's remaining 'Forms'/'Accessibility' tier findings for the auth surface, a natural follow-on to spec 099 (touches the same 3 files: components/SignInForm.tsx, components/SignUpForm.tsx, components/ForgotPasswordForm.tsx). Two confirmed-via-fresh-investigation genuine defects in the error banner shown when login/signup/reset fails. (1) SignInForm.tsx's error banner has no border or entrance animation, while SignUpForm.tsx's and ForgotPasswordForm.tsx's error banners both use the identical bordered+animated style - a visual inconsistency across 3 instances of the same 'form-level error' control within one auth flow. Fix adds the missing border and animation classes to SignInForm's error banner, converging all 3 onto the same visual treatment. (2) SignUpForm.tsx's error banner is missing role='alert' entirely - both SignInForm.tsx and ForgotPasswordForm.tsx already have it (this is the exact same class of gap spec 093's accessibility pass fixed on those two forms plus Admin Login, but SignUpForm.tsx was missed at the time). Fix adds role='alert' to SignUpForm's error banner, closing that gap. Explicitly out of scope: ForgotPasswordForm's separate success banner (a distinct green 'code sent' message with no equivalent in Sign In or Sign Up, so there's no cross-form inconsistency to fix there); any other content or behavior of the three forms beyond the error-banner element itself (already fully addressed in spec 099)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Every auth form's error message looks the same (Priority: P1)

A user who enters invalid credentials on Sign In sees the same bordered, gently-animated error banner they'd see on Sign Up or Forgot Password if those failed too — not a plain, static banner on one form while the other two share a matching, more polished treatment.

**Why this priority**: The clearest actual defect in this tier — 3 instances of the identical "form-level error" control within one auth flow, where 2 already match and 1 has visibly drifted.

**Independent Test**: Trigger a failed submission on Sign In, Sign Up, and Forgot Password in turn and confirm all 3 error banners render with the identical border and entrance animation.

**Acceptance Scenarios**:

1. **Given** Sign In fails to authenticate, **When** the error banner appears, **Then** it renders with the same border and entrance animation as Sign Up's and Forgot Password's error banners.
2. **Given** the error banner's text content and color, **When** viewed on any of the 3 forms, **Then** they are unchanged from today.

---

### User Story 2 - Sign Up's error message is announced to assistive technology (Priority: P2)

A user relying on a screen reader who submits Sign Up with invalid data is told about the error as soon as it appears — not left to discover it by manually navigating the page, which is what happens today since Sign In and Forgot Password already announce their errors this way but Sign Up's was missed.

**Why this priority**: A real, isolated accessibility gap — the same class of fix spec `093` already applied to Sign In and Forgot Password, but Sign Up's own error banner never got it at the time.

**Independent Test**: Trigger a failed Sign Up submission and confirm, via the browser's accessibility inspector or a screen reader, that the error banner is announced as an alert.

**Acceptance Scenarios**:

1. **Given** Sign Up fails to submit, **When** the error banner appears, **Then** it is exposed to assistive technology as an alert, matching Sign In's and Forgot Password's existing behavior.
2. **Given** Sign Up's error banner's visual appearance, **When** viewed, **Then** it is unchanged by this fix.

### Edge Cases

- What happens to Forgot Password's separate success banner (the green "code sent" message)? Left untouched — it's a distinct message type with no equivalent on Sign In or Sign Up, so there's no cross-form inconsistency to resolve there.
- What happens to any other content or behavior on these 3 forms (social-login buttons, password-toggle icons, etc.)? Untouched — already fully addressed in spec `099`; this feature only touches the error-banner element.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sign In's error banner MUST render with the same border and entrance animation already used by Sign Up's and Forgot Password's error banners.
- **FR-002**: Sign In's error banner's text content and color MUST NOT change as a result of FR-001.
- **FR-003**: Sign Up's error banner MUST be exposed to assistive technology as an alert, matching Sign In's and Forgot Password's existing behavior.
- **FR-004**: Sign Up's error banner's visual appearance MUST NOT change as a result of FR-003.
- **FR-005**: Forgot Password's success banner MUST NOT be modified by this feature.
- **FR-006**: None of the fixes in this feature MUST change any business logic, authentication behavior, or Salesforce read/write behavior — every change is a presentation-layer correction.

### Key Entities

- **Form-level error banner**: The message shown when a login/signup/password-reset submission fails, which should render and be announced identically across all 3 auth forms that have one.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the 3 auth forms' error banners (Sign In, Sign Up, Forgot Password) render with the identical border and entrance animation.
- **SC-002**: 100% of the 3 auth forms' error banners are exposed to assistive technology as an alert.
- **SC-003**: 0 regressions in any of the 3 forms' error-banner text content or color.
- **SC-004**: 0 regressions in any business logic, authentication, or Salesforce interaction across all changes in this feature.

## Assumptions

- Sign In's error banner converges onto the border+animation treatment already shared by Sign Up and Forgot Password (2 of 3 forms), rather than the other 2 forms dropping theirs — the shared treatment is the majority convention and the more polished of the two.
- Sign Up's error banner gaining `role="alert"` is a small, low-risk completion of spec `093`'s accessibility pass, not a new audit pass — the identical fix was already applied to the other 2 forms and Admin Login at that time.
- No database schema or Salesforce data changes are required — every fix is presentation-layer, consistent with the existing architecture.
- No sibling-folder propagation, commit, or push is included in this feature's scope — per this repo's established convention, those happen only when explicitly requested after implementation and verification.

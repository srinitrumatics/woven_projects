# Feature Specification: Auth Form Final Consistency Pass

**Feature Branch**: `109-auth-form-final-consistency`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Fix the last 2 open auth-form findings from the design consistency audit: (1) Sign Up's CTA panel sits on the opposite side (left) from Sign In and Forgot Password (both form-left/CTA-right); Sign Up alone uses explicit order-1/order-2 Tailwind utilities to flip it, including its decorative background circles being repositioned to match. Align Sign Up onto the same form-left/CTA-right layout as its two siblings, removing the order-flip. (2) Sign In and Sign Up use sr-only labels + placeholder text as the only visible label substitute for every field; Forgot Password uses normal visible labels for all 4 of its fields. Converge Sign In and Sign Up onto Forgot Password's visible-label convention (the better accessibility practice, consistent with the app's existing accessibility remediation work), by making their labels visible instead of removing them — keep existing placeholder text as supplementary hint text, do not change any other styling (input padding, focus ring, icon behavior all already match)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign Up's CTA panel matches Sign In/Forgot Password's layout (Priority: P1)

A user navigating between Sign In, Sign Up, and Forgot Password today sees the branding/CTA panel jump from the right side to the left side and back, because Sign Up alone renders it in the opposite position. This user story removes that jump so all three auth pages present the same left-to-right layout.

**Why this priority**: This is a visible, page-load-instant layout inconsistency across 3 pages users move between constantly (e.g., "New here? Sign up" / "Already have an account? Sign in" links) — the panel visibly swapping sides on each navigation is jarring.

**Independent Test**: Visit Sign In, Sign Up, and Forgot Password back-to-back on a desktop-width viewport; confirm the form is on the left and the CTA/branding panel is on the right on all three, with no layout jump.

**Acceptance Scenarios**:

1. **Given** a user on a desktop-width viewport, **When** they view the Sign Up page, **Then** the sign-up form appears on the left and the CTA panel appears on the right, matching Sign In and Forgot Password.
2. **Given** a user on a mobile-width viewport, **When** they view the Sign Up page, **Then** the form still appears above the CTA panel (unchanged from today's mobile behavior).
3. **Given** the CTA panel is now on the right for Sign Up, **When** the user views its decorative background elements, **Then** they are positioned as mirror images of Sign In/Forgot Password's (matching a right-side panel), not left-side-oriented.

### User Story 2 - Sign In and Sign Up use visible field labels, matching Forgot Password (Priority: P2)

A user filling out Sign In or Sign Up sees no visible label above each field — only placeholder text that disappears once they start typing, unlike Forgot Password which keeps a visible label at all times. This user story makes Sign In's and Sign Up's labels visible too, so all three forms behave the same way once a user starts typing.

**Why this priority**: Secondary to the panel-side fix since it's a subtler, accessibility-oriented inconsistency rather than an instantly visible one, but still a real usability gap — once a user starts typing, Sign In/Sign Up fields lose all labeling, while Forgot Password's remain labeled throughout.

**Independent Test**: Start typing into any field on Sign In or Sign Up; confirm a visible label remains above the field the whole time, matching Forgot Password's existing behavior.

**Acceptance Scenarios**:

1. **Given** a user viewing Sign In, **When** they look at the Email and Password fields, **Then** each has a visible label above it (not only a screen-reader-only label + placeholder).
2. **Given** a user viewing Sign Up, **When** they look at its 5 fields (name, surname, email, password, confirm password), **Then** each has a visible label above it.
3. **Given** a user has typed into any of these fields, **When** the placeholder text disappears, **Then** the visible label remains, unlike today where no visible labeling exists once typing starts.
4. **Given** these fields already have working placeholder text, autocomplete attributes, and password show/hide icons, **When** labels become visible, **Then** none of that existing behavior changes.

### Edge Cases

- Sign Up's CTA panel content (headline, copy, and its extra "Sign In" button not present on the other two panels) is unchanged by this feature — only the panel's left/right position changes, not its contents.
- Existing `htmlFor`/`id` associations between labels and inputs (already correct, established in a prior accessibility spec) must be preserved unchanged.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sign Up's form and CTA panels MUST render in the same left-to-right order as Sign In and Forgot Password on desktop-width viewports (form left, CTA right).
- **FR-002**: Sign Up's mobile-width stacking order (form above CTA panel) MUST remain unchanged.
- **FR-003**: Sign Up's CTA panel's decorative background elements MUST be repositioned to suit a right-side panel, matching Sign In/Forgot Password's existing right-side decorative positioning.
- **FR-004**: Every field label on Sign In and Sign Up MUST be visually displayed, not screen-reader-only.
- **FR-005**: Existing placeholder text on Sign In's and Sign Up's fields MUST remain, now serving as supplementary hint text alongside the visible label rather than as the label's sole visible substitute.
- **FR-006**: No other visual or functional aspect of Sign In, Sign Up, or Forgot Password (input styling, focus rings, autocomplete, password visibility toggles, form submission logic) may change as a result of this feature.

### Key Entities

- N/A — this is a presentation-only fix with no data entities involved.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 3 auth pages (Sign In, Sign Up, Forgot Password) present the CTA/branding panel in the same position (right, on desktop) with zero layout jump when navigating between them.
- **SC-002**: 100% of Sign In's and Sign Up's form fields (7 total) have a visible label, matching Forgot Password's existing 4.
- **SC-003**: Zero regression to any other existing behavior across all 3 forms (verified via manual walkthrough of both fixes on all 3 pages).

## Assumptions

- "Align Sign Up onto Sign In/Forgot Password's layout" means changing Sign Up to match its two siblings (removing its `order-1`/`order-2` flip and re-mirroring its decorative elements), not changing Sign In/Forgot Password to match Sign Up — the majority convention (2 of 3) and the more recently-established pattern win.
- "Converge onto Forgot Password's visible-label convention" means making Sign In/Sign Up's existing labels visible, not removing Forgot Password's labels to match the other two — visible labels are the stronger accessibility practice and align with this project's prior dedicated accessibility remediation work.
- No commit, push, or sibling-repo propagation is performed as part of this feature; that remains a separate, explicit follow-up step per this project's established workflow.

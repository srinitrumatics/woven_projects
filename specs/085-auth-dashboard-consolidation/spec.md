# Feature Specification: Auth/Landing/Dashboard Route Consolidation

**Feature Branch**: `085-auth-dashboard-consolidation`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Consolidate the duplicated auth/landing routes and dead dashboard pages, based on a fresh current-state investigation. Decided: (1) Program360 and Dashboard pages are orphaned duplicates/dead mock pages — delete both, redirect to /home. (2) The '/' and '/auth' pages render a slide-toggle between Sign In and Sign Up that is confirmed dead code (the toggle callback is never actually invoked — both forms hard-navigate to /signin or /signup instead) — delete both, redirect to /signin, update the two files that currently redirect unauthenticated users to /auth (middleware.ts, ProtectedPageWrapper.tsx) to target /signin instead, and remove the now-fully-orphaned ForceLightMode.tsx and Navigation.tsx components. (3) As a directly adjacent cleanup, consolidate the 3 duplicated force-light-mode inline effects (signin, signup, forgot-password pages) into one shared hook, fixing a confirmed wrapper-class bug on the Forgot Password page in the process. Explicitly out of scope: building any new marketing/landing page content (no such CLAUDE.md requirement exists — the audit's citation was fabricated), and any change to the actual sign-in/sign-up/forgot-password form fields, validation, or submission logic beyond removing the dead toggle prop."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Every dashboard link always leads to one real, correct dashboard (Priority: P1)

A user (or an old bookmark/external link) navigating to `/program360` or `/dashboard` should land on the one real, currently-maintained dashboard (`/home`) instead of a stale, orphaned duplicate or a fully fake mock page.

**Why this priority**: `/program360` is a byte-for-byte duplicate of `/home` except for a confirmed bug (its manufacturer-detection logic disagrees with the same check used identically in 28 other files across the app, and its quick-actions grid has a visible layout gap). `/dashboard` is 100% hardcoded mock data with no real functionality. Neither is reachable from any in-app navigation today, so this is pure dead-weight and latent-bug risk with zero current user-facing benefit.

**Independent Test**: Navigate directly to `/program360` and to `/dashboard` and confirm both land on `/home` with no broken links or 404s.

**Acceptance Scenarios**:

1. **Given** a user navigates directly to `/program360` (e.g. an old bookmark), **When** the page loads, **Then** they are redirected to `/home` and see the real, correct dashboard.
2. **Given** a user navigates directly to `/dashboard`, **When** the page loads, **Then** they are redirected to `/home`.
3. **Given** the Home dashboard is used by manufacturer-type accounts (Supplier, Manufacturer, Manufacturer Rep, Logistics Partner), **When** any of these account types view it, **Then** manufacturer-oriented content displays correctly and consistently (matching every other page in the app that performs this same check) — no dependence on the now-removed duplicate's divergent logic.

---

### User Story 2 - Signing in or signing up always uses one real, working page (Priority: P1)

A user visiting the site's root URL, or redirected there after attempting to access a protected page while logged out, should land on a single, real, functioning sign-in page — not a page whose "switch to Sign Up" control silently fails to do what it visually implies it will do.

**Why this priority**: This is the most user-facing, highest-traffic surface in the app (every login and every session-expiry redirect passes through it), and it currently contains completely non-functional UI (a toggle animation that can never actually trigger). Consolidating removes a confusing dead interaction and a large volume of duplicated code without changing any real user-facing capability, since users already always end up on `/signin`/`/signup` today regardless.

**Independent Test**: Visit the bare root URL and the old `/auth` URL directly, and separately try to access a protected page while logged out, and confirm all three land on a single working sign-in experience.

**Acceptance Scenarios**:

1. **Given** a user visits the site's root URL, **When** the page loads, **Then** they see a working Sign In page (redirected to `/signin`).
2. **Given** a user navigates directly to the old `/auth` URL, **When** the page loads, **Then** they are redirected to the same working Sign In page.
3. **Given** an unauthenticated user attempts to open any protected page, **When** the app redirects them, **Then** they land on the working Sign In page (not a broken or removed page), and after signing in are returned to the page they originally requested.
4. **Given** a user is on the Sign In page, **When** they select "Sign Up", **Then** they reach a working Sign Up page (this already works today via direct navigation and continues to work identically).
5. **Given** a user's session expires while using the app, **When** the app detects they're no longer authenticated, **Then** they are redirected to the working Sign In page (not the removed page).

---

### User Story 3 - The forced light-mode behavior on auth pages is implemented once and looks right everywhere (Priority: P3)

A user viewing the Sign In, Sign Up, or Forgot Password page should always see the same, correct light-theme presentation, regardless of their system/app dark-mode preference — including correct base text color on every one of these pages.

**Why this priority**: Lowest-impact of the three groups — a visual consistency and maintainability improvement, not a functional break. Bundled with this feature because it directly touches the same 2 pages (`/signin`, `/signup`) already being simplified in User Story 2, plus the adjacent Forgot Password page.

**Independent Test**: View all three pages (Sign In, Sign Up, Forgot Password) with the app's dark mode toggled on beforehand, and confirm all three consistently force light presentation with correctly colored base text.

**Acceptance Scenarios**:

1. **Given** the app's dark mode is active, **When** a user navigates to Sign In, Sign Up, or Forgot Password, **Then** all three consistently display in light mode.
2. **Given** the Forgot Password page is viewed, **When** its base text color is inspected, **Then** it matches the same base text color convention used by Sign In and Sign Up (not a mismatched color from a copy-paste error).

### Edge Cases

- What happens to a deep link with query parameters (e.g. `?return=/orders/123`) pointing at the old `/auth` path? The redirect to `/signin` must preserve this behavior so users are still returned to their originally-requested page after signing in.
- What happens to any other in-app link that still points at `/`, `/auth`, `/program360`, or `/dashboard`? None should remain after this feature (verified during implementation), but any external/stale link must still redirect correctly rather than 404.
- What happens if a manufacturer-type account was relying on Program360's specific (buggy) manufacturer-detection behavior? Not expected — no real usage path reaches Program360 today (unreachable via navigation), so removing it changes no real observed behavior, only removes latent risk.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Navigating to `/program360` MUST redirect to `/home`.
- **FR-002**: Navigating to `/dashboard` MUST redirect to `/home`.
- **FR-003**: Navigating to the root URL (`/`) MUST redirect to `/signin`.
- **FR-004**: Navigating to `/auth` (with or without query parameters) MUST redirect to `/signin`, preserving any query parameters (specifically the `return` parameter used to send users back to their originally-requested page after login).
- **FR-005**: Every place in the system that currently redirects an unauthenticated user to `/auth` MUST instead redirect to `/signin`, with no loss of the existing return-destination behavior.
- **FR-006**: The Sign In and Sign Up pages MUST continue to function exactly as they do today (fields, validation, submission, cross-links to each other and to Forgot Password) — this feature changes only which routes lead to them and removes a non-functional toggle prop, not their real behavior.
- **FR-007**: Sign In, Sign Up, and Forgot Password MUST all continue to force light-mode presentation regardless of the user's dark-mode preference, implemented once rather than three times.
- **FR-008**: The Forgot Password page's base text color MUST match the convention used by Sign In and Sign Up.
- **FR-009**: This feature MUST NOT introduce any new marketing/landing page content — the root URL's only behavior is the redirect in FR-003.
- **FR-010**: No page anywhere in the app MUST be left with a dead link pointing to the removed `/`, `/auth`, `/program360`, or `/dashboard` routes.

### Key Entities

- **Dashboard route**: The single real dashboard is `/home`; `/program360` and `/dashboard` become pure redirects to it, no longer independent pages.
- **Auth entry route**: The single real sign-in destination is `/signin`; `/` and `/auth` become pure redirects to it, no longer independent pages.
- **Redirect-target reference**: Any code location that currently names `/auth` as where to send an unauthenticated user (route middleware, client-side auth guard) is updated to name `/signin` instead.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of navigations to `/program360` or `/dashboard` land on `/home` with no broken page or 404.
- **SC-002**: 100% of navigations to `/` or `/auth` land on a working Sign In page, with any `return` query parameter preserved.
- **SC-003**: 100% of session-expiry / protected-page-while-logged-out redirects land on the working Sign In page.
- **SC-004**: 0 remaining in-app links pointing at the 4 removed routes.
- **SC-005**: Sign In, Sign Up, and Forgot Password all force light mode consistently, verified with the app's dark mode pre-enabled.

## Assumptions

- No CLAUDE.md requirement for a marketing/landing page exists (confirmed by direct search of the file) — the original audit document's citation for this requirement was inaccurate, so this feature does not build any new landing content.
- `/signin` and `/signup` are the correct long-term canonical routes because they are already the de-facto real entry points every user reaches today (the `/`/`/auth` toggle to reach the other form never actually fires), and because both are already the target of existing hardcoded cross-links inside `SignInForm.tsx`, `SignUpForm.tsx`, and `ForgotPasswordForm.tsx` — consolidating onto them requires touching only 2 external redirect-target references (`middleware.ts`, `components/ProtectedPageWrapper.tsx`) rather than updating those 3 forms' internal links.
- `components/ForceLightMode.tsx` and `components/Navigation.tsx` are removed as part of this feature because they become fully unreferenced once `/auth` and `/` are removed (confirmed via codebase-wide search prior to this feature — `Navigation.tsx` already had zero importers even before this change).
- The `onToggle` prop, and the `isSignUp` state/slide-transform UI it was meant to support, are removed from `SignInForm.tsx` and `SignUpForm.tsx` since no remaining page will ever pass it — this is dead-code removal, not a behavior change, because the prop was never actually invoked by either form.
- Redirects are implemented as permanent route-level redirects (not client-side page content that renders then redirects), so they work correctly for direct navigation, bookmarks, and server-side requests alike.
- No database, Salesforce, or session-token format changes are required — this is entirely a routing/presentation-layer consolidation.

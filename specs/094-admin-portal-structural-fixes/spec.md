# Feature Specification: Admin-Portal Structural Fixes

**Feature Branch**: `094-admin-portal-structural-fixes`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Fix the audit's 'Admin-Portal structural fixes' tier (non-color items from §17.11), based on a fresh current-state re-audit. Covers: (1) The Admin-Portal (Super Admin console under app/(admin-portal)/admin-portal/) reuses the exact same Header component as the main commerce app, whose account/org-selector button and notification bell are meaningless for a Super Admin identity — the account-selector button literally renders the fallback text 'Accounts Missing' since a Super Admin session has no accounts array, and the dropdown body shows 'No accounts found'. Investigation confirmed Sidebar.tsx already correctly special-cases Super Admin/Admin roles (rendering only a single 'Organizations' nav link instead of the full commerce nav array) — only Header.tsx lacks the equivalent role check. Fix: hide the account-selector button and notification bell in Header.tsx when the signed-in user's role is Super Admin or Admin, mirroring the exact same role check Sidebar.tsx already uses. (2) Admin-Portal Organizations List (app/(admin-portal)/admin-portal/organizations/page.tsx) renders an unpaginated card grid over the full unfiltered organization list with no search or sort control, unlike every other list page in the app (e.g. Purchase Orders), which use the shared Pagination/SortableHeader/useSortableData/useResizableColumns primitives. (3) Organizations List's data-fetching silently swallows failures — the catch block only does console.error, leaving orgs empty and loading false, which falls through to the same empty state shown for a genuinely-empty organization list, indistinguishable from a real fetch failure; the shared ErrorMessage component already exists and is unused here. (4) Three native blocking window.alert() calls exist in this same module (Organizations List's 'no site URL' check, and Organization Create's 'no site URL' check plus its 'complete Load/Index Products first' validation) despite a working useToast hook already being imported and used in this exact same List page for its delete-confirmation flow — these three alerts should use the same established toast pattern instead."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin-Portal chrome matches the Super Admin identity (Priority: P1)

A Super Admin using the Admin-Portal console no longer sees a commerce-app account selector showing "Accounts Missing," or a notification bell that means nothing in this context — both concepts that only make sense for a customer/partner account identity, not a platform-level Super Admin session.

**Why this priority**: The most visibly broken and confusing defect in this tier — a literal "Accounts Missing" label is user-facing evidence of a role mismatch, actively undermining confidence in an internal admin tool used by the team responsible for the whole platform.

**Independent Test**: Log in as a Super Admin and open any Admin-Portal page; confirm the account-selector button and notification bell are no longer shown, while the rest of the shell (logo, sidebar "Organizations" link, user-avatar menu, theme toggle) renders exactly as before.

**Acceptance Scenarios**:

1. **Given** a Super Admin (or Admin) session, **When** any Admin-Portal page loads, **Then** the account/org-selector button (and its "Accounts Missing"/"No accounts found" text) is not rendered.
2. **Given** the same session, **When** the page loads, **Then** the notification bell is not rendered.
3. **Given** a regular Customer/Partner user in the main commerce app, **When** any commerce page loads, **Then** the account selector and notification bell render exactly as they do today — unaffected by this change.

---

### User Story 2 - Organizations List can be searched and sorted like every other list page (Priority: P2)

A Super Admin managing a large number of organizations can search for one by name and sort the list by a column, instead of scrolling through every card in an unfiltered grid.

**Why this priority**: A real usability gap on a page whose whole purpose is finding and managing organizations, but lower urgency than the identity-mismatch defect above since the page is at least functional (just inconvenient) at current scale.

**Independent Test**: Open Organizations List with more than one organization, type a partial organization name into a search field, and confirm the grid filters to matching results; use a sort control and confirm the order changes accordingly.

**Acceptance Scenarios**:

1. **Given** the Organizations List, **When** a Super Admin types a search term, **Then** the displayed organizations filter to those matching the term.
2. **Given** the Organizations List, **When** a Super Admin applies a sort option, **Then** the organizations reorder accordingly.
3. **Given** a very large number of organizations, **When** the list is displayed, **Then** it is paginated rather than rendering every organization at once, consistent with the app's established list-page convention.

---

### User Story 3 - A failed organization fetch is visibly distinguishable from an empty list (Priority: P2)

A Super Admin who opens Organizations List while the backend is unreachable sees a clear error message telling them the load failed, with a way to retry — not the same "no organizations yet" empty state a brand-new, genuinely-empty deployment would show.

**Why this priority**: A real trust gap — an admin seeing what looks like zero organizations, when there are actually many and the request simply failed, could make a badly-informed decision (e.g. believing a tenant was never provisioned).

**Independent Test**: Simulate a failed organizations fetch (e.g. via dev tools network throttling/blocking) and confirm a distinct error state appears, separate from the genuine empty state, with a retry option.

**Acceptance Scenarios**:

1. **Given** the Organizations List, **When** the underlying fetch fails or the API responds unsuccessfully, **Then** a visible error message is shown, not the empty-state UI.
2. **Given** that error state, **When** a Super Admin retries, **Then** a fresh fetch attempt is made.
3. **Given** a genuinely empty organization list (fetch succeeds, zero results), **When** the page loads, **Then** the existing "no organizations yet" empty state still shows, unchanged.

---

### User Story 4 - Validation messages use the same toast pattern as the rest of the module (Priority: P3)

A Super Admin who triggers a validation issue (a missing site URL, or an incomplete product-load/index step) sees the same non-blocking toast notification style already used elsewhere in this module, instead of a jarring native browser alert dialog that must be dismissed before continuing.

**Why this priority**: Lowest priority — a polish/consistency fix on functionality that already works and already communicates the problem, just via a jarring, inconsistent mechanism.

**Independent Test**: Trigger each of the 3 identified validation cases (List page's "no site URL," Create page's "no site URL," Create page's "complete Load/Index Products first") and confirm each shows a toast instead of a native `alert()` dialog.

**Acceptance Scenarios**:

1. **Given** an organization with no site URL configured, **When** a Super Admin clicks its "Launch Webapp" action on Organizations List, **Then** a toast notification appears instead of a native alert dialog.
2. **Given** the same missing-site-URL condition on Organization Create's launch action, **When** triggered, **Then** a toast notification appears instead of a native alert dialog.
3. **Given** an incomplete Load/Index Products step on Organization Create, **When** the user attempts to proceed, **Then** a toast notification appears instead of a native alert dialog.

### Edge Cases

- What happens to the Admin-Portal's user-avatar dropdown, theme toggle, and hamburger menu once the account selector and bell are hidden for Super Admin? They must remain exactly as they are today — only the 2 identified elements are affected.
- What happens if a future Admin-Portal feature genuinely needs a notification mechanism? Out of scope for this fix — hiding the current meaningless bell is not the same as building a real admin-specific notification system, which is a separate, future decision.
- What happens to the search/sort/pagination fix if the organization list is small (e.g. 2-3 orgs)? The controls must still be present and functional — this is a consistency fix, not a scale-triggered one.
- What happens to the existing delete-confirmation toast flow already working on Organizations List? It must be completely unaffected by adding the fetch-error toast/message and the alert-to-toast conversions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Admin-Portal's Header MUST NOT render the account/org-selector button when the signed-in user's role is Super Admin or Admin.
- **FR-002**: The Admin-Portal's Header MUST NOT render the notification bell when the signed-in user's role is Super Admin or Admin.
- **FR-003**: The main commerce app's Header rendering for non-Super-Admin/non-Admin users MUST remain completely unchanged.
- **FR-004**: Organizations List MUST provide a way to filter the displayed organizations by a search term.
- **FR-005**: Organizations List MUST provide a way to sort the displayed organizations.
- **FR-006**: Organizations List MUST paginate its results rather than rendering the entire organization list at once.
- **FR-007**: Organizations List MUST display a distinct, visible error state when its underlying data fetch fails or the API responds unsuccessfully, rather than falling through to the empty-list state.
- **FR-008**: Organizations List's error state MUST offer a way to retry the fetch.
- **FR-009**: Organizations List's genuine empty-state (fetch succeeds, zero organizations) MUST remain unchanged and distinguishable from the new error state.
- **FR-010**: The 3 identified native `alert()` calls (Organizations List's "no site URL" check; Organization Create's "no site URL" check; Organization Create's "complete Load/Index Products first" validation) MUST be replaced with the same toast notification pattern already used elsewhere in this module.
- **FR-011**: None of the fixes in this feature MUST change any underlying organization data, Salesforce/provisioning logic, or permission-check behavior — every change is either a role-conditional UI-chrome fix, a presentation-layer list-page consistency fix, or a validation-messaging mechanism swap.

### Key Entities

- **Admin-Portal session**: A signed-in user whose role is Super Admin or Admin, distinct from a Customer/Partner commerce-app session; has no meaningful `accounts` array or notification concept.
- **Organization**: The core managed entity on Organizations List — name, org ID, Salesforce URL, site URL, creation date — searchable, sortable, and paginated once this feature lands.
- **Organizations List fetch state**: One of three distinguishable states — loading, error (fetch failed or unsuccessful response), or loaded (which may itself be empty or populated).
- **Toast notification**: The existing shared non-blocking notification mechanism (`useToast`) already used by this module's delete-confirmation flow, extended to cover the 3 identified validation cases.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 instances of the account-selector button or notification bell rendering for a Super Admin/Admin session, verified across every Admin-Portal page.
- **SC-002**: 100% of commerce-app (non-admin-portal) Header renders show 0 change from before this feature.
- **SC-003**: 100% of a search term's matching organizations appear in Organizations List's filtered results, and 0 non-matching organizations remain visible.
- **SC-004**: Organizations List renders no more than one page's worth of organizations at a time when the total exceeds the page size.
- **SC-005**: 100% of simulated fetch failures on Organizations List produce a distinct visible error state (not the empty-list state), with a working retry action.
- **SC-006**: 0 remaining native `window.alert()` calls across the 3 identified sites; all 3 now use the shared toast pattern.
- **SC-007**: 0 regressions in organization data, Salesforce/provisioning logic, or permission-check behavior across all changes in this feature.

## Assumptions

- Investigation confirmed `Sidebar.tsx` already correctly special-cases Super Admin/Admin roles (rendering only an "Organizations" nav link, not the full commerce navigation array) — this feature does not touch Sidebar's navigation logic at all; only `Header.tsx`'s account-selector and notification-bell elements need the equivalent role check, mirroring the exact same `user?.role === 'Super Admin' || user?.role === 'Admin'` pattern Sidebar.tsx already uses.
- The original audit framed this defect narrowly ("account-selector + notification bell meaningless for this role"); investigation confirmed this is accurate and did not surface any additional Header elements needing the same treatment beyond these two.
- Hiding the notification bell for Admin-Portal sessions is treated as the correct fix (not building a replacement admin-specific notification system), since no admin-specific notification concept currently exists anywhere in the codebase — introducing one would be new functionality beyond this feature's fix-what-exists scope.
- Organizations List's search/sort/pagination fix follows the same shared primitives (`Pagination`, `SortableHeader`, `useSortableData`, `useResizableColumns`) other list pages in the app already use, rather than inventing a new pattern specific to this page.
- The fetch-error fix reuses the existing shared `ErrorMessage` component already present in the codebase (with its built-in retry-callback support) rather than building a new error-display component.
- The 3 `alert()`-to-toast conversions reuse the `useToast` hook already imported and working in Organizations List for its delete-confirmation flow — no new toast infrastructure is needed.
- No database schema or Salesforce data changes are required — every fix is presentation-layer (role-conditional rendering, list-page UI consistency, error-state display, notification-mechanism swap), consistent with the existing architecture.
- No sibling-folder propagation, commit, or push is included in this feature's scope — per this repo's established convention, those happen only when explicitly requested after implementation and verification.

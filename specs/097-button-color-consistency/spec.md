# Feature Specification: Button Color Consistency

**Feature Branch**: `097-button-color-consistency`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Fix the audit's 'Buttons'/'Colors' tier, scoped to two confirmed-via-fresh-investigation genuine mismatches for the same semantic action rendering in different colors. (1) Products module's 'Add to Order' action: the catalog card's quick-add button (app/products/ProductClientPage.tsx:597) correctly uses bg-primary hover:bg-primary-dark, but the identical action on Product Detail's info card (app/products/[id]/components/ProductInfoCard.tsx:93) and inside AddToOrderModal (app/products/[id]/components/AddToOrderModal.tsx:216,225) both use bg-blue-600 hover:bg-blue-700 instead - three call sites for one semantic action, two different colors. (2) Admin Login (/admin-login, app/(admin-portal)/admin-login/page.tsx) renders as a visually different product from the main portal's /signin page: it uses a bg-gradient-to-br from-blue-500 to-indigo-600 button/icon-bubble gradient and rounded-2xl inputs with focus:ring-blue-500, while /signin (components/SignInForm.tsx) uses the primary-token shell, rounded-md inputs, and focus:ring-[var(--primary)] - fix aligns Admin Login's button/icon-bubble/input treatment onto the same primary-token/rounded-md family already used by /signin, without merging the two separate auth systems (Admin Login intentionally remains structurally independent per CLAUDE.md's two-auth-system architecture - only the visual token family changes, not the shell/layout/auth logic). Explicitly out of scope: Admin Login's overall page layout/shell (centered card vs. split-screen) stays as-is since that's a legitimate structural difference between the two auth systems, not a token-consistency bug; Orders' 'Cancel'/'Save Draft' (outlined) vs. OrderHeader's 'Clone' (filled-gray) button-style difference was investigated and found to be a reasonable secondary-action-tier distinction between two different UI regions (sticky bottom action bar vs. page header), not a genuine same-tier mismatch, so it is not included."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - "Add to Order" looks like one consistent action everywhere (Priority: P1)

A user browsing the Products catalog, viewing a specific Product's Detail page, or using the "Add to Order" modal sees the exact same brand-colored button for the same action — not a brand-blue button on the catalog card that switches to a generic blue on the very next screen for the identical action.

**Why this priority**: The clearest actual bug in this tier — three call sites for one semantic action ("Add to Order"), where 2 of the 3 have drifted off the brand token entirely, most visible since a user encounters all three within a single task flow (browse → view detail → add to order).

**Independent Test**: Open the Products catalog and note the "Add to Order" button's color, then click into a product's Detail page and open its "Add to Order" modal — confirm all three renderings use the same brand color.

**Acceptance Scenarios**:

1. **Given** the Products catalog, **When** viewing a product card's "Add to Order" button, **Then** it renders in the app's brand `primary` color (unchanged from today).
2. **Given** a Product's Detail page, **When** viewing its "Add to Order" button, **Then** it renders in the same brand `primary` color as the catalog card.
3. **Given** the "Add to Order" modal opened from Product Detail, **When** viewing its confirm button, **Then** it renders in the same brand `primary` color as the catalog card.

---

### User Story 2 - Admin Login uses the same brand color family as the main portal's sign-in (Priority: P2)

A Super Admin visiting `/admin-login` sees a button, icon accent, and input treatment drawn from the same brand-color family as the main portal's `/signin` page — not an unrelated blue-to-indigo gradient and a different input shape that make the two look like different products, even though both are the same app's login screens.

**Why this priority**: A real, isolated token mismatch between 2 pages performing the same conceptual job (logging in) — lower urgency than User Story 1 since it's a single page most users never see, but it's the clearest remaining "same job, different brand" gap in this tier.

**Independent Test**: Open `/signin` and note its input shape and accent color, then open `/admin-login` and confirm its button, icon bubble, and inputs now draw from the same brand-color family — while its overall page layout (centered card vs. split-screen) remains visibly its own.

**Acceptance Scenarios**:

1. **Given** `/admin-login`, **When** viewing its submit button, **Then** it renders in the app's brand `primary` color family rather than a blue-to-indigo gradient.
2. **Given** `/admin-login`, **When** viewing its icon bubble and input fields, **Then** they use the same rounded/accent treatment as `/signin`'s inputs, not the divergent `rounded-2xl`/`focus:ring-blue-500` treatment.
3. **Given** `/admin-login`, **When** viewed after this fix, **Then** its overall page layout (centered single-card shell) remains unchanged — only the color/shape tokens shift, not the structure.

### Edge Cases

- What happens to Admin Login's overall page shell (centered card vs. `/signin`'s split-screen layout)? It remains unchanged — this is a legitimate structural difference between the two independent auth systems, not a token-consistency defect, and is explicitly out of scope.
- What happens to the disabled/loading states of the "Add to Order" button and Admin Login's submit button? Their existing disabled/loading treatment (opacity, spinner, `cursor-not-allowed`) is preserved — only the base/hover color tokens change.
- What happens to Orders' "Cancel"/"Save Draft" vs. "Clone" button-style difference named in the original audit? Investigated and found to be a reasonable secondary-action-tier distinction between two different UI regions (sticky bottom action bar vs. page header), not a genuine mismatch — explicitly out of scope.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Product Detail's "Add to Order" button MUST render in the same `primary` brand color already used by the Products catalog's "Add to Order" button.
- **FR-002**: The "Add to Order" modal's confirm button MUST render in the same `primary` brand color already used by the Products catalog's "Add to Order" button.
- **FR-003**: None of the three "Add to Order" call sites' disabled/loading visual states MUST change — only the base/hover color tokens are corrected.
- **FR-004**: Admin Login's submit button MUST use the app's `primary` brand color family instead of the blue-to-indigo gradient.
- **FR-005**: Admin Login's icon bubble and input fields MUST use the same rounded-shape/accent-color family as `/signin`'s inputs.
- **FR-006**: Admin Login's overall page layout/shell (centered single-card structure) MUST NOT change — this feature is a token/color correction only, not a layout redesign.
- **FR-007**: The two separate auth systems (main portal vs. admin portal) MUST remain structurally and functionally independent — no shared component, route, or auth-logic merge is introduced by this feature.
- **FR-008**: None of the fixes in this feature MUST change any business logic, data-fetching, authentication behavior, or Salesforce read/write behavior — every change is a presentation-layer styling correction.

### Key Entities

- **Add to Order action**: The single semantic "add this product to the current order" action, rendered at 3 independent call sites (catalog card, Product Detail info card, Add to Order modal) that should share one brand color.
- **Admin Login token family**: The button/icon-bubble/input color and shape tokens on `/admin-login`, which should draw from the same brand-color family as `/signin`'s equivalent tokens, while the two pages' surrounding layouts remain independently structured.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the 3 identified "Add to Order" call sites render in the same brand `primary` color.
- **SC-002**: 0 regressions in the "Add to Order" button/modal's disabled/loading states or click behavior.
- **SC-003**: Admin Login's submit button, icon bubble, and input fields visually match `/signin`'s brand-color family, verified by direct side-by-side comparison.
- **SC-004**: Admin Login's page layout (centered single-card shell) shows 0 change from before this feature.
- **SC-005**: 0 regressions in any business logic, data-fetching, or authentication behavior across all changes in this feature.

## Assumptions

- The "Add to Order" fix converges on `bg-primary hover:bg-primary-dark` (the convention already used by the Products catalog, 1 of 3 call sites) rather than introducing a new color, since it's both already-correct and already the majority-intended brand token per `tailwind.config.ts`.
- Admin Login's fix targets only its button, icon-bubble, and input color/shape tokens — its centered-card layout, form structure, and auth logic are a legitimate, intentional structural difference from `/signin` (per CLAUDE.md's documented two-separate-auth-systems architecture) and are left untouched.
- Orders' "Cancel"/"Save Draft" vs. "Clone" button-style difference, named in the original audit, was investigated fresh and found to be a reasonable secondary-action-tier distinction between two different UI regions (sticky bottom action bar vs. page header) rather than a genuine same-tier mismatch — excluded from this feature's scope.
- No database schema or Salesforce data changes are required — every fix is presentation-layer styling, consistent with the existing architecture.
- No sibling-folder propagation, commit, or push is included in this feature's scope — per this repo's established convention, those happen only when explicitly requested after implementation and verification.

# Feature Specification: Card Consistency Fixes

**Feature Branch**: `096-card-consistency-fixes`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Fix the audit's 'Card consistency' tier, scoped down after a fresh current-state re-audit found the dominant card pattern is already consistent, and Dashboard/Program360 (named in the original audit) were already deleted in spec 085. Investigation found: (1) 37 files across every commerce module already use the exact same 'detail-page info card' treatment (rounded-lg shadow-md border, bg-white dark:bg-gray-800) — this is the established norm, not a defect, and is left untouched; (2) Product Detail has a genuine 2-file mismatch for what is conceptually the same 'product card' surface — the catalog card in app/products/ProductClientPage.tsx uses rounded-xl shadow-sm hover:shadow-lg while app/products/[id]/components/ProductInfoCard.tsx uses a heavier rounded-2xl shadow-xl hover:shadow-2xl treatment; (3) an icon-bubble/icon-color copy-paste bug recurs identically in 3 Billing-info cards (app/orders/[id]/components/BillingInfo.tsx, app/quotes/[id]/components/QuoteBillingInfo.tsx, app/proposals/[id]/components/BillingInfo.tsx) — each renders a blue-50 icon bubble containing a green-600 icon, a mismatched pairing, while the sibling Invoice and Supplier Bill Billing-info cards (already correct, majority convention) consistently pair blue-50 bubbles with blue-600 icons; (4) app/reports/page.tsx is the one remaining page still on the audit's named 'older, bare shadow' card treatment (Dashboard and Unauthorized, also named by the audit, are moot — Dashboard is deleted, and Unauthorized was investigated and found to already use shadow-md, correcting the audit). Explicitly out of scope, confirmed already internally consistent and not worth disturbing: the 37-file dominant detail-card pattern; Home/Profile's 5-file rounded-2xl stat-card treatment (self-consistent); and a 7-file list-page stat/filter-card treatment (rounded-xl shadow-sm hover:shadow-lg) that the original audit didn't even name and which is already consistent across all 7 of its own pages, just a different (equally valid) pattern from the detail-card one, shared with the Product catalog card family."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Billing Information cards show a color-consistent icon everywhere (Priority: P1)

A user viewing the Billing Information card on Order Detail, Quote Detail, or Proposal Detail sees an icon whose color matches the circle it sits inside, exactly as every other module's Billing Information card already does — not a green icon inexplicably sitting inside a blue circle.

**Why this priority**: The clearest actual bug in this tier — a real, identically-repeated copy-paste mismatch (not a style-opinion difference), most visible since Billing Information is one of the first cards a user sees on 3 of the app's core detail pages.

**Independent Test**: Open Order Detail, Quote Detail, and Proposal Detail and confirm each one's Billing Information icon color now matches its bubble color, consistent with Invoice Detail and Supplier Bill Detail's already-correct Billing Information cards.

**Acceptance Scenarios**:

1. **Given** Order Detail's Billing Information card, **When** viewed, **Then** the icon color matches its bubble color.
2. **Given** Quote Detail's Billing Information card, **When** viewed, **Then** the icon color matches its bubble color.
3. **Given** Proposal Detail's Billing Information card, **When** viewed, **Then** the icon color matches its bubble color.
4. **Given** Invoice Detail's and Supplier Bill Detail's Billing Information cards (already correct), **When** viewed, **Then** they remain completely unchanged.

---

### User Story 2 - Product Detail's card matches the catalog card it came from (Priority: P2)

A user who clicks from the Products catalog into a specific Product's detail page sees the same card language carry through — not a noticeably heavier, more dramatic card shadow/radius appearing out of nowhere for what is conceptually the same "product card" surface.

**Why this priority**: A real, isolated mismatch between exactly 2 files representing the same conceptual card — lower urgency than User Story 1 since it's a style difference, not a copy-paste color bug, but it's the clearest genuine card-shape inconsistency confirmed in this tier.

**Independent Test**: Open the Products catalog, note the card shape/shadow on a product card, then open that product's Detail page and confirm its info card now uses a visually consistent treatment rather than a noticeably heavier one.

**Acceptance Scenarios**:

1. **Given** a Products catalog card and the same product's Detail page info card, **When** compared side by side, **Then** both share the same radius and shadow-weight language.
2. **Given** Product Detail's info card, **When** viewed in both light and dark mode, **Then** its hover behavior and visual weight remain appropriate for a static (non-clickable) info card, not simply copy-pasted from the clickable catalog card without adjustment.

---

### User Story 3 - Reports page uses the app's current card styling (Priority: P3)

A user viewing the Reports page sees a card treatment consistent with the rest of the app, not a visibly older, flatter shadow style left over from before the app's other legacy pages (Dashboard, Program360) were consolidated away.

**Why this priority**: Lowest priority — a single low-traffic page with a stub "coming soon" message, isolated visual drift with no functional impact.

**Independent Test**: Open the Reports page and confirm its card now uses the same shadow weight as other simple content cards elsewhere in the app (e.g. Unauthorized, which already uses the correct treatment).

**Acceptance Scenarios**:

1. **Given** the Reports page, **When** viewed, **Then** its card shadow matches the app's current standard (not the older, flatter legacy shadow).
2. **Given** the Reports page's content (heading, "coming soon" text, disabled Generate Report button from a prior spec), **When** viewed, **Then** none of it changes except the card's shadow styling.

### Edge Cases

- What happens to the 37 files already using the dominant `rounded-lg shadow-md` detail-card treatment? They are explicitly out of scope and must show zero change — they are the established norm, not a defect.
- What happens to Home/Profile's stat cards and the 7 list-page stat/filter cards? Both are confirmed self-consistent populations and are explicitly out of scope — must show zero change.
- What happens to Unauthorized's card? Confirmed already correct (uses `shadow-md`, not the older bare `shadow` the audit claimed) — must show zero change, serving only as the reference pattern for User Story 3's fix.
- What happens if the icon-bubble fix in User Story 1 changes which of the 2 existing "correct" conventions (blue-based, used by 2 of 3 already-correct files, vs. green-based, used by 1) the 3 buggy files converge toward? The majority convention (blue-50 bubble + blue-600 icon, matching Invoice and Supplier Bill) is used, since it's already the bubble color present in all 3 buggy files today — only the icon color needs to change, not the bubble.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Order Detail's, Quote Detail's, and Proposal Detail's Billing Information card icons MUST render in a color that matches their icon-bubble background color.
- **FR-002**: The icon-color fix in FR-001 MUST follow the majority already-correct convention (blue-based icon matching the existing blue-based bubble), not introduce a new, third color.
- **FR-003**: Invoice Detail's and Supplier Bill Detail's Billing Information cards MUST NOT be modified.
- **FR-004**: Product Detail's info card MUST visually reconcile with the Products catalog card's shape/shadow language, eliminating the currently much-heavier, disproportionate treatment.
- **FR-005**: Product Detail's info card MUST retain visual behavior appropriate to a static, non-interactive info card (it must not become a hover-interactive element merely because the catalog card is).
- **FR-006**: Reports page's card MUST use the app's current standard shadow treatment instead of the older, flatter legacy shadow.
- **FR-007**: The 37-file dominant detail-page info-card treatment, Home/Profile's stat-card treatment, and the 7-file list-page stat/filter-card treatment MUST NOT be modified by this feature.
- **FR-008**: None of the fixes in this feature MUST change any business logic, data-fetching, or Salesforce read/write behavior — every change is a presentation-layer styling correction.

### Key Entities

- **Icon bubble**: A circular colored background behind a small icon, used across Billing/Shipping/Notes-style info cards; correctness means the icon's color matches the bubble's color family.
- **Product card surface**: The conceptual "this is a product" card shown in 2 different contexts — the Products catalog (clickable, hover-interactive) and Product Detail's info card (static, non-interactive) — both currently rendered with different visual weight for what should be a recognizably related surface.
- **Legacy card shadow**: The older, flatter `shadow` (no intensity suffix) treatment, now confirmed to remain only on the Reports page.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the 3 identified Billing Information cards (Orders, Quotes, Proposals) render an icon color matching their bubble color.
- **SC-002**: 0 regressions on Invoice Detail's and Supplier Bill Detail's already-correct Billing Information cards.
- **SC-003**: Product Detail's info card visually reconciles with the Products catalog card's shape/shadow language, verified by direct side-by-side comparison.
- **SC-004**: Reports page's card shadow matches the app's current standard treatment.
- **SC-005**: 0 regressions across the 37-file dominant detail-card population, Home/Profile's stat cards, and the 7-file list-page stat/filter-card population.
- **SC-006**: 0 regressions in any business logic, data-fetching, or Salesforce interaction across all changes in this feature.

## Assumptions

- The original audit's claim of "4 card variants" was investigated and found to undercount the real population (a 5th-6th treatment exists on list-page stat/filter cards), but also to substantially overstate the actual defect surface — the dominant treatment (37 files) is already fully consistent, and 2 of the audit's 3 named "older shadow" pages (Dashboard, Program360) no longer exist (deleted in spec 085), with the 3rd (Unauthorized) found to already be correct.
- This feature deliberately does not attempt to build one universal shared `Card` component covering every card population in the app — the 3 largest populations (37-file detail cards, 5-file stat cards, 7-file list-page stat/filter cards) are each already internally consistent, and forcing them into one shared abstraction would be a much larger, more opinionated redesign than "fix confirmed inconsistencies," which is this feature's actual scope.
- The icon-bubble fix converges on the blue-based convention (2 of 3 already-correct sibling files) rather than the green-based one (1 of 3), since the 3 buggy files already use a blue bubble today — changing the icon color is a smaller, more targeted fix than also changing the bubble color.
- No database schema or Salesforce data changes are required — every fix is presentation-layer styling, consistent with the existing architecture.
- No sibling-folder propagation, commit, or push is included in this feature's scope — per this repo's established convention, those happen only when explicitly requested after implementation and verification.

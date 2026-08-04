# Feature Specification: Responsive Breakpoint Fixes

**Feature Branch**: `098-responsive-breakpoint-fixes`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Fix the audit's 'Responsiveness' tier, scoped to two confirmed-via-fresh-investigation genuine defects, after investigation found a 3rd audit-named item was a larger paradigm decision not a bug. (1) Shipment Line Detail's ProductInformationCard.tsx (app/shipments/[id]/lines/[lineid]/components/ProductInformationCard.tsx:26) uses an arbitrary min-[1000px]: Tailwind variant for its internal grid, while its own parent page (app/shipments/[id]/lines/[lineid]/page.tsx:203) and every other grid on that same page use the app's actual custom w1025: breakpoint token (defined in tailwind.config.ts) - a ~25px behavioral mismatch where this one nested component silently diverges from its own parent's breakpoint everywhere else on the page. Fix changes the arbitrary variant to the standard w1025: token, matching the parent. (2) Products List's Card view (app/products/ProductClientPage.tsx) renders both an IntersectionObserver-driven auto-load sentinel AND a manual 'Load More Products' button simultaneously (both visible under the identical condition !isLastPage && viewMode === 'card', both calling the exact same showMore() handler) - confirmed genuinely redundant, not two different affordances for two different needs, since both appear at the same time doing the same thing. Fix removes the redundant manual button, keeping only the auto-load sentinel (which already shows its own loading spinner and text). Explicitly out of scope: unifying Products List's two view-mode pagination paradigms themselves - List view uses discrete-page <Pagination> (via Algolia's usePagination/useHits hooks) while Card view uses continuous infinite-scroll (via Algolia's useInfiniteHits hook) - this is a genuine UX-paradigm choice between two already-internally-consistent patterns (List optimized for scanning fixed pages, Card optimized for continuous browsing), not a confirmed defect, and forcing them onto one paradigm would be a larger redesign than this feature's bug-fix scope, consistent with this repo's established pattern (e.g. spec 096) of not forcing genuinely-different-but-individually-coherent UI populations into one shared treatment."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Shipment Line Detail's product panel resizes at the same width as the rest of the page (Priority: P1)

A user resizing their browser window on Shipment Line Detail sees every panel on the page — including the Product Information panel — switch from stacked to side-by-side layout at the exact same window width, instead of one panel silently switching ~25px earlier or later than everything else around it.

**Why this priority**: A real, isolated breakpoint mismatch — the nested component's own internal grid uses a different (and non-standard) breakpoint from its parent page and every sibling panel on that page, causing a visible layout "hitch" at a narrow window-width range.

**Independent Test**: Resize the browser window on Shipment Line Detail across the page's layout-switch width and confirm every panel, including the Product Information panel's internal 2-vs-3-column grid, switches at the same point.

**Acceptance Scenarios**:

1. **Given** Shipment Line Detail, **When** the browser window is resized across the page's standard layout-switch width, **Then** the Product Information panel's internal grid switches column count at that same width, not a different one.
2. **Given** Shipment Line Detail's other panels, **When** viewed at any width, **Then** their layout behavior is unchanged by this fix.

---

### User Story 2 - Products catalog's "load more" control isn't shown twice (Priority: P2)

A user browsing the Products catalog in Card view and scrolling to the bottom sees one clear way to load more products — either it loads automatically as they scroll, or they click a button to load more — not both an automatic loader and a redundant manual button appearing at the same time for the identical action.

**Why this priority**: Lower urgency than User Story 1 since it's not a layout-breaking bug, but it's a confirmed, genuine redundancy — two visible controls doing the exact same thing at the exact same moment, which is confusing and makes the page look unfinished.

**Independent Test**: Scroll to the bottom of the Products catalog in Card view and confirm only one "load more" affordance is visible/active — the automatic scroll-triggered loader — with no separate manual button appearing alongside it.

**Acceptance Scenarios**:

1. **Given** the Products catalog in Card view with more results available, **When** scrolling near the bottom, **Then** additional products load automatically and no separate manual "Load More" button is shown alongside the auto-loader.
2. **Given** the Products catalog in Card view, **When** all results have been loaded, **Then** the existing "end of results" message still displays exactly as before.
3. **Given** the Products catalog in List view, **When** viewed, **Then** its discrete-page `Pagination` control is completely unaffected by this fix.

### Edge Cases

- What happens to Products List's two different pagination paradigms (List view's discrete pages vs. Card view's infinite scroll)? Both remain exactly as they are today — this is a legitimate UX-paradigm choice between two internally-consistent patterns, not a defect, and is explicitly out of scope for this feature.
- What happens if a user's browser doesn't support `IntersectionObserver`? Out of scope — no browser-compatibility fallback is introduced or removed by this feature; the existing sentinel-based auto-load behavior is unchanged except for removing its redundant manual-button sibling.
- What happens to the loading spinner and "Loading more products..." text shown while more products are being fetched? Unchanged — this feature only removes the separate, always-simultaneous manual button, not the existing auto-loader's own loading indicator.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Shipment Line Detail's Product Information panel's internal grid MUST switch column count at the same window width as the rest of that page's layout, using the app's standard custom breakpoint token.
- **FR-002**: No other panel or layout behavior on Shipment Line Detail MUST change as a result of FR-001.
- **FR-003**: Products catalog's Card view MUST NOT display a separate manual "load more" control alongside its automatic scroll-triggered loader when more results are available.
- **FR-004**: Products catalog's Card view's automatic scroll-triggered loading behavior (including its loading indicator and "end of results" message) MUST continue to function exactly as before.
- **FR-005**: Products catalog's List view's discrete-page pagination control MUST NOT be modified by this feature.
- **FR-006**: The two distinct pagination paradigms between Products catalog's List view and Card view MUST NOT be unified or otherwise changed by this feature — both are out of scope.
- **FR-007**: None of the fixes in this feature MUST change any business logic, data-fetching, or Salesforce/Algolia read behavior — every change is a presentation-layer correction (a breakpoint token correction and a redundant-control removal).

### Key Entities

- **Breakpoint token**: The app's custom responsive-layout threshold, used consistently by a page and its panels to decide when to switch from stacked to side-by-side layout; one nested component currently uses a different, non-standard threshold than its own parent.
- **Load more control**: The affordance a user interacts with (automatically or manually) to fetch additional results in an infinite-style list; currently duplicated into two simultaneous controls doing the identical thing in one view mode.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of Shipment Line Detail's panels, including the Product Information panel, switch layout at the identical window width.
- **SC-002**: 0 regressions on Shipment Line Detail's other panels' layout behavior.
- **SC-003**: 0 instances of a manual "load more" button appearing alongside the automatic scroll-triggered loader in Products catalog's Card view.
- **SC-004**: 0 regressions in Products catalog's automatic loading behavior, loading indicator, "end of results" message, or List view's pagination.
- **SC-005**: 0 regressions in any business logic, data-fetching, or Salesforce/Algolia interaction across all changes in this feature.

## Assumptions

- The Product Information panel's grid fix converges on the app's actual custom `w1025` breakpoint token (already used by its own parent page and every sibling panel on the same page) rather than a different arbitrary value — matching the already-established, page-wide convention is the correct target, not inventing a new threshold.
- Removing the redundant manual "Load More Products" button is safe because it is confirmed to render under the exact same condition as, and call the exact same handler as, the existing auto-load sentinel — it is not a distinct fallback for a different scenario (e.g., no separate no-JS or reduced-motion path exists that depends on it).
- Unifying Products List's List-view (discrete pagination) and Card-view (infinite scroll) paradigms into one shared pattern is a larger UX-paradigm decision, not a confirmed defect, and is explicitly out of scope — consistent with this repo's established pattern of leaving genuinely-different-but-individually-coherent UI populations alone rather than forcing premature consolidation.
- No database schema or Salesforce/Algolia query changes are required — every fix is presentation-layer, consistent with the existing architecture.
- No sibling-folder propagation, commit, or push is included in this feature's scope — per this repo's established convention, those happen only when explicitly requested after implementation and verification.

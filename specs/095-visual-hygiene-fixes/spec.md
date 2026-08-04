# Feature Specification: Visual Hygiene Fixes

**Feature Branch**: `095-visual-hygiene-fixes`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Fix the audit's 'Visual Hygiene' tier, scoped down after a fresh current-state re-audit found 2 of the original 6 items (card shape/shadow/radius consistency, and loading-spinner consolidation) were far larger than a small-fixes tier — cards span at least 5 distinct treatments across dozens of files, and the shared LoadingSpinner.tsx component is completely unused while animate-spin appears 65 times across ~45 files with 6+ distinct visual patterns. Per user decision, both are deferred to their own future dedicated specs (matching how Modal/SubTabs/ReadOnlyField each needed a dedicated spec due to scale), and this spec covers only the 4 well-bounded remaining items: (1) Order Line Detail's quantity stepper has 2 visually divergent skins (not 3 files, as the audit claimed) within the same file, OrderDetailsTable.tsx — mobile-card view uses one style, desktop-table view uses another, for the identical +/- control; (2) Sidebar.tsx's navigation array uses the identical SVG icon path for 'Catalog'/'My Inventory' and again for 'Orders'/'Purchase Orders' — a Hybrid-type account, which can see all 4 of these nav items simultaneously, sees only 2 visually distinguishable icons across 4 distinct destinations; (3) breadcrumb markup is hand-copied independently in 3 places (ProposalHeader.tsx, the Proposal Summary page, and Proposal Line Detail page) with no shared component, and ProposalHeader.tsx's copy has a real functional regression beyond styling — its 'Proposals' and 'Proposal Details' segments are static non-clickable text, while the other two copies correctly implement them as working navigation; (4) Shipments List, Inventory List, and Admin Delivery Windows each hand-roll their own filter-pill row instead of importing the shared Tabs.tsx component — Shipments and Inventory share an identical wrong-token bug (inactive state uses bg-gray-100 instead of Tabs.tsx's bg-primary-light), while Delivery Windows uses a third, differently-shaped pill style (rounded-full, bg-gray-50) — confirmed all 3 pages' filter data already maps cleanly onto Tabs.tsx's existing {tabs, activeKey, onChange} API with no new props needed."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Order Line Detail's quantity stepper looks and behaves the same on mobile and desktop (Priority: P3)

A user adjusting an order line's quantity sees the same +/- stepper control styling whether they're viewing the mobile card layout or the desktop table layout, instead of two visually different button styles for the identical control.

**Why this priority**: Lowest priority — a real but narrow visual inconsistency confined to one control on one page, with zero functional impact (both versions already work correctly).

**Independent Test**: Open Order Line Detail in edit mode at both a mobile and a desktop viewport width and confirm the +/- stepper buttons render with identical styling in both.

**Acceptance Scenarios**:

1. **Given** Order Line Detail in edit mode at a desktop viewport, **When** viewing the quantity stepper, **Then** its +/- buttons match the same color/border treatment as the mobile version.
2. **Given** Order Line Detail in edit mode at a mobile viewport, **When** viewing the quantity stepper, **Then** it renders exactly as it does today (unaffected).
3. **Given** either viewport, **When** a user clicks +/-, **Then** the quantity updates exactly as it does today — no behavior change.

---

### User Story 2 - Every Sidebar nav item has its own distinguishable icon (Priority: P2)

A user whose account type shows both "Catalog" and "My Inventory," or both "Orders" and "Purchase Orders," in the Sidebar can tell the two apart by icon alone, not just by reading the label text.

**Why this priority**: A real, if narrow, usability gap — a Hybrid-type account (the only account type that can see all 4 of these items simultaneously, confirmed via investigation) currently sees 2 pairs of identical icons pointing to 4 different destinations.

**Independent Test**: Log in as a Hybrid-type account and view the Sidebar; confirm "Catalog," "My Inventory," "Orders," and "Purchase Orders" each render with a visually distinct icon.

**Acceptance Scenarios**:

1. **Given** a Hybrid-type account, **When** viewing the Sidebar, **Then** "Catalog" and "My Inventory" render with different icons.
2. **Given** the same account, **When** viewing the Sidebar, **Then** "Orders" and "Purchase Orders" render with different icons.
3. **Given** any account type, **When** clicking any of these 4 nav items, **Then** navigation behaves exactly as it does today — icons are the only change.

---

### User Story 3 - Every breadcrumb trail looks the same and always navigates (Priority: P1)

A user viewing a Proposal's header, its Workspace/Summary page, or a Proposal Line Detail page sees the same breadcrumb trail styling everywhere, and can always click an earlier segment (like "Proposals") to navigate back — never a breadcrumb segment that looks clickable but silently does nothing.

**Why this priority**: Highest priority in this tier — one of the 3 existing breadcrumb copies (`ProposalHeader.tsx`) is not just visually inconsistent but genuinely broken: its "Proposals" and "Proposal Details" segments look like the other two pages' working links but don't navigate anywhere.

**Independent Test**: Open a Proposal Detail page (which renders `ProposalHeader.tsx`'s breadcrumb) and click its "Proposals" segment; confirm it now navigates to the Proposals list, matching the already-working behavior on the Proposal Summary and Proposal Line Detail pages.

**Acceptance Scenarios**:

1. **Given** a Proposal Detail page, **When** a user clicks the "Proposals" breadcrumb segment, **Then** they navigate to the Proposals list.
2. **Given** the same page, **When** a user clicks the "Proposal Details" breadcrumb segment (if present as a non-current segment elsewhere), **Then** it navigates correctly.
3. **Given** a Proposal Summary page and a Proposal Line Detail page, **When** a user views their breadcrumb trails, **Then** all 3 pages' breadcrumbs render with identical shared styling and identical navigation behavior for equivalent segments.
4. **Given** any of the 3 pages, **When** viewing the final (current-page) breadcrumb segment, **Then** it remains plain, non-clickable text, exactly as today.

---

### User Story 4 - Filter pills look and behave the same across every list page (Priority: P2)

A user filtering Shipments List, Inventory List, or Admin Delivery Windows by status sees the exact same filter-pill visual treatment on all 3 pages, matching the shared `Tabs` component already used for tab bars elsewhere in the app.

**Why this priority**: A real, cross-page consistency gap with a confirmed functional-adjacent bug (Shipments and Inventory's inactive-pill color uses a token that isn't the app's actual "inactive tab" color) — but not a functional break, since filtering itself already works correctly on all 3 pages today.

**Independent Test**: Open Shipments List, Inventory List, and Admin Delivery Windows and compare their filter-pill rows; confirm all 3 render with identical shape, active/inactive colors, and spacing, matching the shared `Tabs` component's existing visual style.

**Acceptance Scenarios**:

1. **Given** Shipments List, **When** viewing its filter pills, **Then** the inactive-state color matches the app's established inactive-tab token, not the previous incorrect gray.
2. **Given** Inventory List, **When** viewing its filter pills, **Then** the same correction applies.
3. **Given** Admin Delivery Windows, **When** viewing its filter pills, **Then** they now match the same shape/color treatment as Shipments and Inventory's, replacing their previously-unique third pill style.
4. **Given** any of the 3 pages, **When** a user clicks a filter pill, **Then** the underlying filtering behavior works exactly as it does today — only the visual treatment changes.

### Edge Cases

- What happens to Order Line Detail's stepper sizing (mobile uses larger touch-friendly buttons, desktop uses smaller table-density buttons)? Sizing stays responsive to context — only the color/border treatment is unified, not the dimensions, since the size difference serves a legitimate layout purpose (touch target vs. table density).
- What happens to Sidebar's other, already-distinct nav icons (Home, Configure, Proposals, Quotes, Supplier Bills, Shipments, Invoices, Locations)? Unaffected — only the 2 confirmed duplicate-icon pairs are touched.
- What happens to the final (current-page) segment of any breadcrumb once consolidated? It remains plain, non-interactive text, exactly as all 3 current implementations already do for their last segment.
- What happens to Delivery Windows' filter-pill click behavior (`setActiveTab`) once migrated onto `Tabs`? It must continue to work exactly as today — only the rendering component changes, not the state it drives.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Order Line Detail's mobile and desktop quantity-stepper buttons MUST render with identical color/border styling.
- **FR-002**: Order Line Detail's quantity-update behavior (increment, decrement, manual entry) MUST remain unchanged on both mobile and desktop.
- **FR-003**: Sidebar's "Catalog" and "My Inventory" nav items MUST render with visually distinct icons.
- **FR-004**: Sidebar's "Orders" and "Purchase Orders" nav items MUST render with visually distinct icons.
- **FR-005**: All other Sidebar nav items and all nav-item click/navigation behavior MUST remain unchanged.
- **FR-006**: A shared breadcrumb component MUST be used by `ProposalHeader.tsx`, the Proposal Summary page, and the Proposal Line Detail page, replacing their 3 independently-implemented copies.
- **FR-007**: Every non-current breadcrumb segment MUST be a working navigation link; every current (final) segment MUST remain non-interactive text.
- **FR-008**: `ProposalHeader.tsx`'s "Proposals" and "Proposal Details" breadcrumb segments MUST become clickable and navigate correctly, resolving their current non-functional state.
- **FR-009**: Shipments List, Inventory List, and Admin Delivery Windows MUST render their filter pills using the shared `Tabs` component, replacing their 3 independently hand-rolled implementations.
- **FR-010**: Each of the 3 pages' existing filter/click behavior MUST remain functionally unchanged after migrating onto the shared `Tabs` component.
- **FR-011**: None of the fixes in this feature MUST change any business logic, data-fetching, or Salesforce read/write behavior — every change is a presentation-layer styling consolidation or a breadcrumb-navigation bug fix.

### Key Entities

- **Quantity stepper**: The +/- control for adjusting an order line's quantity, present in both a mobile-card and a desktop-table rendering within `OrderDetailsTable.tsx`.
- **Sidebar navigation item**: An entry in the app's persistent left navigation, each with a label, destination, an icon, and an optional account-type visibility filter.
- **Breadcrumb trail**: A sequence of navigation segments showing a user's location within a section of the app, ending in a non-interactive current-page label.
- **Filter pill**: A clickable pill-shaped control on a list page that filters the page's data by a status/category value, visually matching the app's shared tab styling once consolidated.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 remaining visual differences between Order Line Detail's mobile and desktop quantity-stepper button styling.
- **SC-002**: 100% of Sidebar's 4 previously-duplicate-icon nav items ("Catalog," "My Inventory," "Orders," "Purchase Orders") render with a unique icon.
- **SC-003**: 100% of the 3 breadcrumb instances render via one shared component, with 0 remaining independently-hand-rolled copies.
- **SC-004**: 100% of `ProposalHeader.tsx`'s non-current breadcrumb segments are clickable and navigate correctly (previously 0%).
- **SC-005**: 100% of Shipments List, Inventory List, and Admin Delivery Windows' filter pills render via the shared `Tabs` component, with 0 remaining independently hand-rolled implementations.
- **SC-006**: 0 regressions in any business logic, data-fetching, filtering, or Salesforce interaction across all changes in this feature.

## Assumptions

- Card shape/shadow/radius consistency and loading-spinner consolidation were investigated and confirmed to be substantially larger in scope than this tier's other items (cards: 5+ distinct treatments across dozens of files; spinners: a completely unused shared `LoadingSpinner.tsx` and 65 one-off `animate-spin` instances across ~45 files) — both are explicitly out of scope for this feature, per user decision, and are expected to become their own dedicated future specs, matching how the Modal/SubTabs/ReadOnlyField shared-component consolidations each needed dedicated specs due to similar scale.
- The audit's original claim of "3 stepper files" on Order Line Detail was investigated and corrected: only 1 file (`OrderDetailsTable.tsx`) contains stepper logic, with 2 divergent skins (mobile vs. desktop) inside it — a 3rd, unrelated stepper style exists in the Products module but is not part of Order Line Detail and is out of scope.
- The audit's original claim that all 3 filter-pill pages share the identical wrong-token bug was investigated and corrected: only Shipments and Inventory share the exact `bg-gray-100` bug; Admin Delivery Windows uses a third, differently-shaped pill style entirely (`rounded-full`, `bg-gray-50`) — all 3 are still included in scope since migrating all 3 onto the shared `Tabs` component resolves all 3 variants at once.
- The shared breadcrumb component is scoped to the 3 confirmed Proposal-module instances only; no other module's breadcrumb-like markup was confirmed as part of this investigation, so no other pages are touched.
- No database schema or Salesforce data changes are required — every fix is presentation-layer styling consolidation or client-side navigation-link correction, consistent with the existing architecture.
- No sibling-folder propagation, commit, or push is included in this feature's scope — per this repo's established convention, those happen only when explicitly requested after implementation and verification.

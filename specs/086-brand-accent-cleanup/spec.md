# Feature Specification: Brand Accent Color Cleanup

**Feature Branch**: `086-brand-accent-cleanup`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Consolidate off-brand accent colors onto the primary Tailwind token, based on a fresh current-state re-audit. Scope, confirmed by direct investigation and user decision: (1) Search page themed entirely in indigo instead of primary; (2) Configure page's '+Add Group' affordance themed in purple; (3) Admin Organizations page (worst offender — orange/amber/indigo/purple all in one file, zero primary usage) plus its matching Admin Dashboard tile icon; (4) four line-detail pages hardcoding a near-clone-of-primary hex literal for their 'Back to X' button where four sibling files already correctly use the primary token; (5) Product Gallery's two hardcoded hex decorative backgrounds. Explicitly out of scope, confirmed legitimate: the entire Admin-Portal internal-tool system (including its login page), StatusBadge's deliberate status-color system, the admin-portal's deliberate sequential-step action colors, Home page's categorical per-section tile colors, file-type icon color conventions, semantic status/warning colors, and a small number of icon-container color-pairing mismatches deferred to a future 'Cards' consistency spec."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search page matches the rest of the app's brand color (Priority: P1)

A user browsing the Search page should see the same brand accent color (the light blue used everywhere else in the app) rather than a completely different purple-blue (indigo) theme that makes the page feel like it belongs to a different product.

**Why this priority**: Search is a primary-CTA-tier page (product cards, a "View" action, a "Load More" action, active filter checkboxes) themed in a color that appears nowhere else in the app's brand identity — the single most visible full-page instance of color drift found in this audit.

**Independent Test**: Browse the Search page and confirm every previously-indigo element (price badges, category labels, the "View" button, loading spinners, "Load More", filter checkboxes and links) now renders in the app's brand color, matching how the same kinds of elements look on every other page.

**Acceptance Scenarios**:

1. **Given** a user is on the Search page, **When** they view a product result, **Then** its price badge and "View" action use the app's brand color, not a different blue-purple tone.
2. **Given** search results are loading, **When** the loading spinner displays, **Then** it uses the brand color.
3. **Given** a user applies a filter, **When** the filter checkbox/link is active, **Then** it displays in the brand color, consistent with active-state styling elsewhere in the app.

---

### User Story 2 - Configure's "Add Group" control matches the app's brand color (Priority: P1)

A user adding a new line group while configuring an order should see the "+Add Group" button and its related inputs in the app's brand color, not purple.

**Why this priority**: This is a primary creation action (the app's convention is that "add new X" actions use the brand color everywhere else), currently the sole purple-themed control in this page.

**Independent Test**: Open Configure, use "+Add Group", and confirm the button and its associated inputs (quick-add focus ring, new-group-name input, confirm button, inline-edit input) all display in the brand color.

**Acceptance Scenarios**:

1. **Given** a user is configuring an order, **When** they view the "+Add Group" button, **Then** it displays in the app's brand color.
2. **Given** a user is actively adding or renaming a group, **When** they interact with the relevant input fields, **Then** the focus/border styling uses the brand color, not purple.

---

### User Story 3 - Admin Organizations matches the rest of the admin section's brand color (Priority: P1)

An administrator managing organizations should see the same brand color used throughout the rest of the Admin section (e.g. Authorize Locations), not a page themed in three different off-brand colors at once.

**Why this priority**: This is the single worst offender found — an entire page (background, header, primary action button, form fields, tabs, empty state) plus its own dashboard tile icon, using orange/amber as the dominant theme with additional indigo and purple accents mixed in, and zero use of the app's actual brand color anywhere in the file.

**Independent Test**: Open the Admin Dashboard and the Organizations page and confirm every element that was previously orange, amber, indigo, or purple now uses the brand color, matching the already-correct Authorize Locations page in the same section.

**Acceptance Scenarios**:

1. **Given** an administrator views the Admin Dashboard, **When** they look at the Organizations tile, **Then** its icon uses the brand color, matching its sibling tiles.
2. **Given** an administrator opens the Organizations page, **When** they view the page background, header, primary action button, any modal, form fields, tabs, and empty state, **Then** all use the app's brand color consistently, with no remaining orange, amber, indigo, or purple accents.
3. **Given** an administrator compares Organizations to Authorize Locations (a sibling admin page), **When** viewing both, **Then** they share a visually consistent brand color treatment.

---

### User Story 4 - "Back" buttons on line-detail pages match their siblings (Priority: P2)

A user navigating back from a line-detail page (Invoice, Shipment, Quote, or Delivery Window) should see the same "Back" button styling used on every other line-detail page in the app.

**Why this priority**: Four pages hardcode a slightly-off, undocumented color for this exact button while four sibling pages with the identical button pattern already correctly use the brand color — a clear, low-risk, high-confidence fix with an exact template to copy.

**Independent Test**: Visit each of the four affected line-detail pages and confirm their "Back" button now visually matches the "Back" button on the four already-correct sibling pages.

**Acceptance Scenarios**:

1. **Given** a user is on an Invoice, Shipment, Quote, or Delivery Window line-detail page, **When** they view the "Back" button, **Then** it uses the app's brand color, matching the equivalent button on Order, Purchase Order, Proposal, and Supplier Bill line-detail pages.

---

### User Story 5 - Product Gallery's decorative backgrounds match the brand palette (Priority: P3)

A user viewing a product's image gallery should see background colors that belong to the app's actual color palette rather than two undocumented one-off hex values.

**Why this priority**: Lowest impact of the five groups — purely decorative background colors, not an interactive or CTA element, but still a real instance of undocumented color drift worth closing while the surrounding cleanup is happening.

**Independent Test**: View a product's image gallery and confirm the main image-display panel and the "No Image" placeholder use colors from the app's documented brand palette.

**Acceptance Scenarios**:

1. **Given** a user views a product's image gallery, **When** they look at the image-display panel background and the "No Image" placeholder, **Then** both use a shade from the app's brand color family rather than an undocumented one-off hex value.

### Edge Cases

- What happens to elements that are *intentionally* a different color for a legitimate reason (e.g. status badges, warning banners, categorical tile colors, file-type icons, the separate Admin-Portal internal tool)? These must remain untouched — this feature only touches confirmed brand-accent drift, not deliberate semantic or categorical color usage.
- What happens if a color change on the Configure page's group-tag array accidentally makes two different tags render identically? The replacement tag color chosen for the removed purple entry must remain visually distinct from every other color already in that same categorical array.
- What happens in dark mode? Every element touched by this feature must continue to have a correct, legible dark-mode variant using the brand color's existing dark-mode equivalents (already established elsewhere in the app), not just a light-mode-only fix.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Search page MUST use the app's brand color (not indigo) for its price badges, category labels, title hover state, "View" action, loading spinners, "Load More" action, and active-filter checkboxes/links.
- **FR-002**: The Configure page's "+Add Group" button and its associated input focus/border states MUST use the app's brand color (not purple).
- **FR-003**: The Configure page's categorical group-tag color set MUST no longer include purple, replaced with a color that remains visually distinct from every other color already in that same set.
- **FR-004**: The Admin Organizations page MUST use the app's brand color consistently across its background, header, primary action button, modal/card headers, form fields, section headers, row icons, active-tab state, and empty state — with no remaining orange, amber, indigo, or purple accents.
- **FR-005**: The Admin Dashboard's Organizations tile icon MUST use the app's brand color, matching its sibling dashboard tiles.
- **FR-006**: The "Back" button on Invoice, Shipment, Quote, and Delivery Window line-detail pages MUST use the app's brand color, matching the equivalent button already correctly implemented on Order, Purchase Order, Proposal, and Supplier Bill line-detail pages.
- **FR-007**: The Product Gallery's main image-display panel background and "No Image" placeholder background MUST use a color from the app's documented brand palette rather than an undocumented hex literal.
- **FR-008**: This feature MUST NOT alter any color usage confirmed to be legitimate and intentional: the Admin-Portal internal-tool system (including its login page), the shared status-badge component's semantic status colors, the Admin-Portal's sequential-step action colors, the Home dashboard's categorical per-section tile colors, file-type icon color conventions, and semantic warning/status indicators elsewhere in the app.
- **FR-009**: None of these fixes MUST change any underlying data, business logic, or interactive behavior — only the color styling of already-correct elements.
- **FR-010**: Every element touched by this feature MUST retain a correct, legible dark-mode appearance using the brand color's existing dark-mode variants.

### Key Entities

- **Search page elements**: price badge, category label, product title, "View" action, loading spinner, "Load More" action, filter checkboxes/links — all currently indigo, target brand color.
- **Configure "Add Group" control**: button, quick-add input, new-group-name input, confirm button, inline-edit input — all currently purple, target brand color; plus a categorical group-tag color array that loses its purple entry.
- **Admin Organizations page elements**: page background, header, primary action button, modal/card headers, form field focus states, section headers, row icons, active-tab indicator, empty state — currently orange/amber/indigo/purple, target brand color.
- **Admin Dashboard Organizations tile**: an icon currently orange, target brand color.
- **Line-detail "Back" button**: currently a hardcoded near-brand-color hex on 4 pages, target the same brand color token already used correctly on 4 sibling pages.
- **Product Gallery backgrounds**: main panel and "No Image" placeholder, currently two hardcoded hex values, target the brand palette's existing light-tint family.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of previously-indigo elements on the Search page render in the app's brand color.
- **SC-002**: 100% of previously-purple elements in Configure's "+Add Group" control render in the app's brand color.
- **SC-003**: 0 remaining orange, amber, indigo, or purple color occurrences on the Admin Organizations page or its Admin Dashboard tile icon.
- **SC-004**: 100% of the 4 affected line-detail "Back" buttons visually match their already-correct sibling pages.
- **SC-005**: 0 remaining undocumented hex color literals in the Product Gallery component.
- **SC-006**: 100% of elements touched by this feature retain correct, legible styling in both light and dark mode.
- **SC-007**: 0 changes to any of the explicitly out-of-scope legitimate color usages (status badges, Admin-Portal, categorical tiles, file-type icons, warning indicators).

## Assumptions

- This feature is scoped to exactly the 5 groups of findings confirmed by a fresh, current-state code re-audit conducted during planning — not the original static `UI_UX_DESIGN_CONSISTENCY_AUDIT.md` document, which was found to be substantially stale in three separate prior specs (079-085's investigations).
- The Admin-Portal internal-tool system (including its login page's indigo Sign In button) is explicitly excluded per user decision — it is an architecturally independent system per CLAUDE.md, and its own distinct visual identity is treated as intentional, not drift.
- Several other colorful elements found during research (StatusBadge's semantic status colors, the Admin-Portal's sequential-step action colors, Home's categorical tile colors, file-type icon conventions, EOL/warning indicators) are confirmed legitimate and explicitly out of scope — forcing them onto the brand color would destroy real semantic distinctions they exist to provide.
- A small number of icon-container color-pairing mismatches found during research (in Key Dates, Proposal Details, and PO Details cards) are a different class of defect — icon/bubble color pairing, not brand-accent drift — and are deferred to a possible future "Cards" consistency spec rather than bundled here.
- The replacement color for Configure's removed purple group-tag entry is a design decision to be made during planning, constrained only by "must remain visually distinct from the array's other existing colors."
- No database, Salesforce, or business-logic changes are required — this is a presentation-layer-only color consolidation.

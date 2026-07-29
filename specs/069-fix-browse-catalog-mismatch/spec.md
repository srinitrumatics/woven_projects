# Feature Specification: Fix Browse Catalog Showing Non-Salesforce Products

**Feature Branch**: `069-fix-browse-catalog-mismatch`

**Created**: 2026-07-29

**Status**: Draft

**Input**: User description: "in app/configure/page.tsx broewse catalog is not loading aloglia index products. it showing 1000 products which is not belong to salesforce"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Catalog shows this organization's real Salesforce products (Priority: P1)

A user building an order opens the Browse Catalog panel on the Configure Order page expecting to see the products that actually exist for their organization in Salesforce. Today the panel instead shows a flat list of roughly 1,000 products that do not correspond to the organization's real Salesforce catalog, making the panel unusable for finding and adding real products.

**Why this priority**: This is the core reported defect. If the list shown is not the organization's real catalog, every downstream action (search, add-to-order, drag-and-drop) is built on wrong data, so nothing else in the feature matters until this is fixed.

**Independent Test**: Can be fully tested by opening Browse Catalog as a user belonging to an organization with a known, synced Algolia index and confirming every product shown matches a product that exists in that organization's Salesforce catalog — not a generic/default list.

**Acceptance Scenarios**:

1. **Given** an organization with a properly configured and synced Algolia index, **When** a user opens Browse Catalog, **Then** the list shows only products belonging to that organization's Salesforce catalog.
2. **Given** the organization's Algolia index configuration cannot be resolved (e.g., lookup fails or is missing), **When** a user opens Browse Catalog, **Then** the panel shows an empty or clearly-messaged state instead of silently falling back to an unrelated/default product list.
3. **Given** a product has been removed from Salesforce and the search index has since been re-synced, **When** a user opens Browse Catalog, **Then** that product no longer appears in the list.

---

### User Story 2 - Catalog list stays accurate as the organization's real catalog grows past the current cap (Priority: P2)

A user whose organization has more products than the panel's current fixed load limit expects to still be able to find every real product, either by scrolling for more or by searching, rather than the list silently stopping at an arbitrary cut-off.

**Why this priority**: Once Story 1 ensures the list is sourced correctly, this ensures it stays correct and complete as catalogs grow — a smaller, secondary risk compared to showing the wrong data entirely.

**Independent Test**: Can be fully tested with an organization whose real Salesforce-backed catalog exceeds the panel's current single-fetch limit, confirming a product beyond that limit is still reachable via search or continued scrolling.

**Acceptance Scenarios**:

1. **Given** an organization's real catalog has more products than the panel's initial load, **When** the user searches for a product beyond that initial load, **Then** it is still found.
2. **Given** an organization's real catalog has more products than the panel's initial load, **When** the user scrolls to the end of the currently loaded list, **Then** additional real products continue to load rather than the list simply ending.

---

### Edge Cases

- What happens when the organization's Algolia index name cannot be resolved (host/org lookup failure) — must the panel avoid falling back to any shared/default index that could show another organization's or a non-production set of products?
- How does the panel behave when the resolved index exists but has never been synced (zero records)?
- How does the panel behave when the index temporarily disagrees with Salesforce (e.g., sync lag) — is a brief staleness window acceptable, or must every shown product be verified against Salesforce before display?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Browse Catalog panel MUST source its product list only from the Algolia index belonging to the current user's organization, resolved the same way other org-scoped features resolve it.
- **FR-002**: The Browse Catalog panel MUST NOT fall back to a shared, global, or default search index when the organization-specific index cannot be resolved; it MUST instead show an empty or clearly-messaged state.
- **FR-003**: Every product displayed in the Browse Catalog list MUST correspond to a product that currently exists in that organization's Salesforce catalog (per the latest completed sync), with no unrelated, stale, or placeholder records shown.
- **FR-004**: The panel MUST continue to support the existing add-to-order actions (click "+" and drag-and-drop) for any product shown, unchanged from current behavior.
- **FR-005**: The panel MUST continue to source per-product order-line fields (quantity, MOQ, price) from Salesforce at add-time, not from the search index, unchanged from current behavior.
- **FR-006**: The panel MUST allow users to reach products beyond the current fixed load limit through search and/or continued scrolling, so real catalog size is never silently truncated.
- **FR-007**: When the organization's index has zero synced records, the panel MUST show an empty state rather than displaying unrelated data.

### Key Entities

- **Organization Algolia Index**: The per-organization search index name, resolved from the organization's configuration record; the only valid source for the Browse Catalog list.
- **Catalog Product Record**: A single indexed product (id, sku, name, description, manufacturer, brand, family, price, availability) that must trace back to a real Salesforce product owned by the current organization.
- **Order Line**: A line added to the in-progress order from a selected catalog product, whose qty/MOQ/price fields are always populated from Salesforce, independent of the catalog list's source.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of products shown in Browse Catalog for a given organization correspond to real, currently-existing products in that organization's Salesforce catalog.
- **SC-002**: 0% of Browse Catalog sessions show any product from a different organization's catalog or from a non-organization-specific default list.
- **SC-003**: Users can locate any real catalog product via search or scrolling, regardless of total catalog size, in under 5 seconds.
- **SC-004**: Support reports related to "wrong" or "unrecognized" products in Browse Catalog drop to zero after the fix.

## Assumptions

- Each organization has (or is expected to have) its own Algolia index, kept in sync with Salesforce by the existing background sync worker; this feature does not change how or when that sync runs.
- The reported "1000 products not belonging to Salesforce" are the result of the panel falling back to a non-organization-specific index/environment variable when the organization-specific index lookup fails or is unset, rather than the sync worker itself writing wrong data — this fix addresses the panel's index-resolution and display behavior, not the sync worker's write path.
- No change is required to the add-to-order flow, qty/MOQ stepper, grouping, or order submission — this is scoped strictly to what the Browse Catalog list shows and where it gets it from.
- Existing session/auth and permission gating for the Configure Order page are unchanged.

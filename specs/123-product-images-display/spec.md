# Feature Specification: Real Product Images on Catalog and Product Detail Pages

**Feature Branch**: `123-product-images-display`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "add product images into algolia index and display in app/products/page.tsx page and need to show product images in app/products/[id]/page.tsx pages too"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real product photos in the Catalog list (Priority: P1)

A user browsing the Catalog page (`/products`, card or list view) sees a generic package icon for every product today, instead of that product's actual photo. The user needs to see the real product image wherever one exists, so they can visually recognize and distinguish products while browsing or searching.

**Why this priority**: This is the primary, most-visible half of the request — the Catalog is the main browsing surface, used in both card and list view, and today shows zero real images anywhere.

**Independent Test**: Open the Catalog page in both card view and list view for a product known to have a photo, and confirm the real photo renders in the thumbnail position instead of the generic package icon.

**Acceptance Scenarios**:

1. **Given** a product has a photo, **When** a user views it in Catalog card view, **Then** the product's real photo renders as the card's image instead of the generic package icon.
2. **Given** a product has a photo, **When** a user views it in Catalog list view, **Then** the product's real photo renders as the row's thumbnail instead of the generic icon.
3. **Given** a product has no photo, **When** a user views it in either Catalog view, **Then** the existing generic placeholder icon continues to show — no broken image, no blank space.
4. **Given** a user searches or filters the Catalog, **When** results render, **Then** each result's thumbnail reflects that same product's real photo (or placeholder), consistent with card/list view elsewhere.

---

### User Story 2 - Real product photos on the Product Detail page (Priority: P1)

A user opens a specific product's detail page (`/products/[id]`) and sees only a placeholder image repeated in the photo gallery today, regardless of what photo(s) the product actually has. The user needs the detail page's photo gallery to show that product's real photo(s).

**Why this priority**: Explicitly called out in the request as equally necessary; the detail page is where a user makes the closest visual inspection of a product before adding it to an order, so a placeholder here is more consequential than in the list view's small thumbnail.

**Independent Test**: Open the detail page for a product known to have one or more photos and confirm the gallery (main image plus thumbnail strip) shows those real photos, including working next/previous navigation between them if there is more than one.

**Acceptance Scenarios**:

1. **Given** a product has exactly one photo, **When** a user opens its detail page, **Then** the gallery's main image shows that photo (no placeholder, no thumbnail strip needed for just one image).
2. **Given** a product has multiple photos, **When** a user opens its detail page, **Then** the gallery shows all of them, with working thumbnail selection and next/previous navigation between them.
3. **Given** a product has no photo, **When** a user opens its detail page, **Then** the existing placeholder image continues to show in the gallery — no broken image, no blank space.

---

### Edge Cases

- What happens when a product's photo fails to load (broken URL, network error)? → Falls back to the same generic placeholder used for "no photo," rather than showing a broken-image icon.
- What happens when the Catalog list and the Product Detail page are viewed for the very same product? → Both must show the same real photo(s) for that product — no inconsistency between the two surfaces.
- What happens for a product whose photo was removed or changed after it was already shown to a user? → Out of scope for this feature to guarantee a specific refresh latency; standard expectation is that the next time the data is reloaded/re-synced, the updated photo appears — no requirement for instant push updates.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST make each product's real photo(s) available to both the Catalog page and the Product Detail page — today, neither page has access to any real photo data for any product.
- **FR-002**: The Catalog page (card view and list view) MUST display a product's real photo in its thumbnail position when one exists.
- **FR-003**: The Product Detail page's photo gallery MUST display all of a product's real photo(s) when one or more exist, including working navigation between multiple photos.
- **FR-004**: When a product has no photo (or its photo fails to load), both the Catalog page and the Product Detail page MUST continue to show their existing generic placeholder — this fallback behavior must not regress.
- **FR-005**: A product's photo(s) must be consistent between the Catalog page and the Product Detail page — both surfaces are showing the same underlying photo data for a given product, not two independently-sourced images that could disagree.

### Key Entities *(include if feature involves data)*

- **Product Photo**: One or more images associated with a product record. A product may have zero, one, or multiple photos. When multiple exist, one is treated as primary/first for thumbnail purposes; all are available in the Detail page's gallery.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For any product that has a photo, that real photo appears on the Catalog page (both view modes) and on that product's Detail page — 0% of products with a photo still show only the generic placeholder.
- **SC-002**: For any product with no photo, the existing placeholder still renders cleanly on both pages — 0% of products with no photo show a broken image or blank space.
- **SC-003**: A user comparing the same product's image on the Catalog page and its Detail page sees the same photo in both places, every time.

## Assumptions

- **Where product photos come from**: [NEEDS CLARIFICATION: no Salesforce field, attachment mechanism, or external image source for products was found anywhere in the current integration — every existing "image" reference in the codebase (an Algolia-side jsonb column, a Catalog-page field guess, and the Detail page's hardcoded placeholder) is unpopulated scaffolding, not a working data path. This feature cannot be scoped further without knowing: does Salesforce already have (or will gain) a field/attachment holding product photo URLs, or should photos be sourced from somewhere else (e.g. an external asset host keyed by product/SKU)?]
- A product may have more than one photo, and the Detail page's gallery should support that (matching the gallery component's existing multi-image design); the Catalog page's single thumbnail uses whichever photo is designated primary/first.
- The existing placeholder-icon fallback behavior (package icon in Catalog, placeholder image in the Detail gallery) is the correct "no photo" experience and is preserved as-is — this feature only adds the real-photo path, it doesn't redesign the empty state.
- No specific freshness/latency guarantee is required for photo updates propagating to these pages beyond however product data already refreshes today.

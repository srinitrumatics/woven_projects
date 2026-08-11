# Feature Specification: Product Images Sourced from Algolia (Catalog) and Salesforce (Detail)

**Feature Branch**: `124-product-image-sources`

**Created**: 2026-08-11

**Status**: Draft

**Input**: User description: "in app/products/page.tsx file need to show product image from algolia index and in app/products/[id]/page.tsx need to show product images from salaforce"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real product photos in the Catalog list, sourced from Algolia (Priority: P1)

A user browsing the Catalog page (`/products`, card or list view) sees a generic package icon for every product today, instead of that product's actual photo. The user needs to see the real product photo, drawn from the Algolia search index, wherever one exists.

**Why this priority**: The Catalog is the primary browsing surface, used in both card and list view, and today shows zero real images anywhere.

**Independent Test**: Open the Catalog page in both card view and list view for a product known to have a photo indexed in Algolia, and confirm the real photo renders in the thumbnail position instead of the generic package icon.

**Acceptance Scenarios**:

1. **Given** a product's Algolia record has a photo, **When** a user views it in Catalog card view, **Then** the product's real photo renders as the card's image instead of the generic package icon.
2. **Given** a product's Algolia record has a photo, **When** a user views it in Catalog list view, **Then** the product's real photo renders as the row's thumbnail instead of the generic icon.
3. **Given** a product's Algolia record has no photo, **When** a user views it in either Catalog view, **Then** the existing generic placeholder icon continues to show — no broken image, no blank space.
4. **Given** a user searches or filters the Catalog, **When** results render, **Then** each result's thumbnail reflects that same product's real photo (or placeholder), consistent with card/list view elsewhere.

---

### User Story 2 - Real product photos on the Product Detail page, sourced from Salesforce (Priority: P1)

A user opens a specific product's detail page (`/products/[id]`) and sees only a placeholder image repeated in the photo gallery today, regardless of what photo(s) the product actually has in Salesforce. The user needs the detail page's photo gallery to show that product's real photo(s), sourced directly from Salesforce.

**Why this priority**: Explicitly called out in the request as equally necessary; the detail page is where a user makes the closest visual inspection of a product before adding it to an order, so a placeholder here is more consequential than in the list view's small thumbnail.

**Independent Test**: Open the detail page for a product known to have one or more photos in Salesforce and confirm the gallery (main image plus thumbnail strip) shows those real photos, including working next/previous navigation between them if there is more than one.

**Acceptance Scenarios**:

1. **Given** a product has exactly one photo in Salesforce, **When** a user opens its detail page, **Then** the gallery's main image shows that photo (no placeholder).
2. **Given** a product has multiple photos in Salesforce, **When** a user opens its detail page, **Then** the gallery shows all of them, with working thumbnail selection and next/previous navigation between them.
3. **Given** a product has no photo in Salesforce, **When** a user opens its detail page, **Then** the existing placeholder image continues to show in the gallery — no broken image, no blank space.

---

### Edge Cases

- What happens when a product's photo fails to load (broken URL, network error)? → Falls back to the same generic placeholder used for "no photo," rather than showing a broken-image icon.
- What happens when a product has a photo in Salesforce but its Algolia record hasn't been (re)synced with that photo yet, or vice versa? → Each page shows whatever its own source (Algolia for Catalog, Salesforce for Detail) currently has; the two pages are allowed to be briefly out of sync with each other since they intentionally read from two different systems — this is expected, not a defect.
- What happens for a product whose photo was removed or changed after it was already shown to a user? → Out of scope for this feature to guarantee a specific refresh latency; standard expectation is that the next time the respective source is reloaded/re-synced, the updated photo appears — no requirement for instant push updates.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Catalog page (card view and list view) MUST display a product's real photo, read from that product's Algolia index record, in its thumbnail position when one exists.
- **FR-002**: The Product Detail page's photo gallery MUST display all of a product's real photo(s), read from Salesforce, when one or more exist, including working navigation between multiple photos.
- **FR-003**: The system MUST retrieve each product's photo(s) from a URL field on the Salesforce `Product2` record, and make the resolved photo URL(s) available to the Detail page's gallery.
- **FR-004**: When a product has no photo (or its photo fails to load), both the Catalog page and the Product Detail page MUST continue to show their existing generic placeholder — this fallback behavior must not regress.
- **FR-005**: The Catalog page's photo and the Product Detail page's photo(s) for the same product are each authoritative from their own source (Algolia for Catalog, Salesforce for Detail) — the two are not required to be pixel-identical or perfectly in sync at every moment, only each individually correct relative to its own source.

### Key Entities *(include if feature involves data)*

- **Catalog Product Photo**: The photo (or photos) associated with a product's Algolia index record, used for the Catalog page's card/list thumbnail. A product may have zero or more; when multiple exist, the first/primary is used for the thumbnail.
- **Detail Product Photo**: The photo(s) associated with a product's Salesforce record, used for the Detail page's gallery. A product may have zero, one, or multiple; all are shown in the gallery when present.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For any product whose Algolia record has a photo, that real photo appears on the Catalog page in both card and list view — 0% of such products still show only the generic placeholder icon.
- **SC-002**: For any product with a photo in Salesforce, that real photo (or photos) appears in the Detail page's gallery — 0% of such products still show only the placeholder image.
- **SC-003**: For any product with no photo in the relevant source, the existing placeholder still renders cleanly — 0% of such products show a broken image or blank space, on either page.

## Assumptions

- Salesforce product photos are held in a `Product2` URL field (confirmed); when a product has more than one photo, that field's value is a delimited/structured list of URLs rather than a single URL — the exact multi-value format is a planning-time detail, not a scoping question.
- The Catalog page's existing thumbnail-rendering logic and package-icon/box-icon placeholders (card and list view) are the correct "no photo" experience and are preserved as-is.
- The Detail page's existing multi-image gallery component (main image, thumbnail strip, prev/next navigation, placeholder fallback) is the correct presentation and is preserved as-is; this feature is about supplying it with real photo data rather than redesigning it.
- The Catalog page and Detail page are intentionally allowed to source images independently (Algolia vs. Salesforce) per the request; no requirement is being introduced to unify them onto a single shared source.
- No specific freshness/latency guarantee is required for photo updates propagating to either page beyond however each source (Algolia index sync, Salesforce fetch) already refreshes today.

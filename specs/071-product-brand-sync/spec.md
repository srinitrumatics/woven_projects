# Feature Specification: Product Brand Name Sync from Salesforce

**Feature Branch**: `071-product-brand-sync`

**Created**: 2026-07-29

**Status**: Draft

**Input**: User description: "brand name is fetch from salesforce and added in postgres product2 table"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Catalog shows the correct brand for every product (Priority: P1)

As someone browsing or configuring an order from the product catalog, I see the brand name for each product so that I can identify and select the right item, instead of seeing a blank or placeholder value.

**Why this priority**: Brand is a primary identifying attribute buyers use to distinguish otherwise similar products. Missing brand data directly degrades the core browse/search/configure experience and was the source of a recent defect (repeated failed lookups for products with no resolvable brand).

**Independent Test**: Can be fully tested by opening the product catalog / configure-order screen and confirming every active product displays a brand name (or an explicit "no brand" indicator, never blank or stuck in a loading state).

**Acceptance Scenarios**:

1. **Given** a Salesforce product with a brand assigned, **When** the product appears anywhere in the catalog or order configuration UI, **Then** the correct brand name is displayed.
2. **Given** a product record already stored locally with its brand name populated, **When** the catalog loads, **Then** no additional lookup is made for that product.

---

### User Story 2 - New or updated products carry the correct brand immediately (Priority: P2)

As a system keeping the local product data in sync with Salesforce, when a product is created or updated in Salesforce, its brand name is captured and stored locally as part of that same sync event, so the catalog never shows stale or missing brand data for recently changed products.

**Why this priority**: Real-time product creation/edit flows (e.g., adding a new product during order configuration) are a common path; without this, newly added products would always start with missing brand data until a separate backfill ran.

**Independent Test**: Can be fully tested by creating or updating a product's brand in Salesforce, triggering the app's product sync for that single record, and confirming the stored local record reflects the new brand name without any further action.

**Acceptance Scenarios**:

1. **Given** a product is created in Salesforce with a brand assigned, **When** the product is synced into the app, **Then** the brand name is stored with that product record.
2. **Given** an existing product's brand assignment changes in Salesforce, **When** the product is next synced, **Then** the locally stored brand name is updated to match.

---

### User Story 3 - Existing products missing brand data are backfilled (Priority: P3)

As someone responsible for data quality, I want product records that were synced before brand data was reliably captured (or that were missed for other reasons) to be backfilled with their brand name from Salesforce, so historical catalog data is complete without needing to touch each product individually.

**Why this priority**: Addresses already-existing gaps in previously synced data; lower priority than keeping new/ongoing syncs correct (Stories 1-2), since it's a one-time cleanup rather than an ongoing behavior.

**Independent Test**: Can be fully tested by running the backfill against a dataset containing products with missing brand names and confirming that every product whose Salesforce record has a brand assigned is subsequently updated in the local product data.

**Acceptance Scenarios**:

1. **Given** locally stored products with no brand name recorded, **When** the backfill runs, **Then** each product whose Salesforce record has a brand assigned is updated with that brand name.
2. **Given** a locally stored product whose Salesforce record genuinely has no brand assigned, **When** the backfill runs, **Then** the product is marked as having no brand rather than being left in an unresolved state that triggers repeated retries.

---

### Edge Cases

- What happens when a Salesforce product has no brand assigned at all? The system must record this as a definite "no brand" state rather than leaving it blank/unresolved, so it is not repeatedly re-fetched.
- How does the system handle a product whose brand lookup exists in Salesforce but resolves to a deleted or inaccessible brand record? Treat the same as "no brand" rather than failing the whole product sync.
- What happens if Salesforce is temporarily unreachable during a sync? The affected product(s) keep their last-known brand value locally and are retried on the next scheduled sync, not in an immediate tight loop.
- How does the system handle a product that exists in the catalog/search index but has no corresponding local product record at all (e.g., removed or never synced)? It is treated as "no brand" for display purposes rather than causing repeated lookup attempts.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST retrieve the brand name associated with a Salesforce product's brand assignment whenever that product is synced (both full/bulk syncs and single-product create/update syncs).
- **FR-002**: System MUST persist the retrieved brand name on the corresponding local product record.
- **FR-003**: System MUST update the persisted brand name whenever a product's brand assignment changes in Salesforce on a subsequent sync.
- **FR-004**: System MUST distinguish between "brand not yet synced" and "product genuinely has no brand assigned" so that products with no brand are not repeatedly re-queried.
- **FR-005**: System MUST provide a way to backfill brand names for product records that were synced before this capability existed or are otherwise missing brand data, without requiring manual per-product action.
- **FR-006**: Product catalog and order configuration views MUST display each product's synced brand name, or an explicit "no brand" indicator when none is assigned.
- **FR-007**: System MUST NOT issue unbounded repeated lookup requests for a product's brand once an attempt has been made and the result (including "no brand found") has been recorded.

### Key Entities

- **Product**: A sellable item mastered in Salesforce and mirrored locally; relevant attributes include its unique identifier, name, and brand name.
- **Brand**: The named brand/label associated with a product in Salesforce; a product has at most one brand assigned, or none.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of active products whose Salesforce record has a brand assigned display that brand name in the catalog after their next sync completes.
- **SC-002**: A newly created or brand-updated Salesforce product reflects its correct brand name locally within one sync cycle of that change, with no manual intervention.
- **SC-003**: After a single backfill run, zero previously-unsynced products with a Salesforce-assigned brand remain missing that brand name.
- **SC-004**: No product triggers more than one brand-lookup attempt per sync pass, eliminating repeated/duplicate lookup traffic for the same product.

## Assumptions

- "Postgres product2 table" refers to the existing per-organization product table already used to mirror Salesforce Product2 records; this feature does not change that data model, only ensures brand name is reliably captured and kept current within it.
- Brand is modeled in Salesforce as a single lookup from a product to a separate brand record; this spec does not change how brand is modeled in Salesforce.
- The existing full/bulk product sync and the existing single-product real-time sync are the two integration points responsible for capturing brand name; no new sync mechanism is introduced.
- A product with no brand assigned in Salesforce is a valid, permanent state and should be shown as "no brand" rather than treated as an error or an incomplete sync.
- Backfilling existing records is a one-time (or re-runnable on demand) operation rather than a continuously running process.

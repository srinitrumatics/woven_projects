# Feature Specification: Split Product Load & Search-Index Sync with Progress Indicator

**Feature Branch**: `[051-product-algolia-sync-split]`

**Created**: 2026-07-17

**Status**: Draft

**Input**: User description: "in admin-login org creation part i try to add 22k and more that product into alogolia index it fails. it have two parts one is load products from salesforce to postgres products table and last one is load that products into algolia index. need to split that into two we need two buttons one to load products into postgres from salesforce and the second one is load that products into algolia index. show log in page how many products add into algolia index like indicator or progress bar"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Load products from Salesforce reliably, regardless of catalog size (Priority: P1)

An admin managing an organization in the admin portal needs to bring that organization's product catalog in from Salesforce so it is available in the platform. Today this step is bundled with search-indexing in a single action, and for organizations with 22,000+ products the combined action fails before the products are even usable, forcing the admin to retry the whole thing repeatedly with no way to know how far it got.

**Why this priority**: Loading the catalog is the foundational step — nothing else (search, browsing, ordering) works until products exist in the platform. It must succeed on its own, independent of whether indexing later succeeds.

**Independent Test**: Can be fully tested by triggering only the "load products" action for an organization with a large catalog (22,000+ products) and confirming it completes successfully and the products are visible in the platform's product records, without triggering or depending on search indexing.

**Acceptance Scenarios**:

1. **Given** an organization has no products loaded yet, **When** the admin triggers the "Load Products" action, **Then** the system retrieves the organization's current products from Salesforce and stores them, without also attempting to push them to the search index.
2. **Given** an organization already has products loaded, **When** the admin triggers "Load Products" again, **Then** the system refreshes the existing records (adds new products, updates changed ones) without creating duplicates.
3. **Given** an organization has 22,000 or more products, **When** the admin triggers "Load Products", **Then** the action completes successfully rather than timing out or failing partway through.
4. **Given** a load is already running for an organization, **When** the admin tries to trigger "Load Products" again, **Then** the system prevents a second concurrent run and indicates one is already in progress.

---

### User Story 2 - Push loaded products into the search index, with visible progress (Priority: P1)

Once products are loaded, an admin needs to make them searchable by pushing them into the search index — as a separate, deliberate step, so a large catalog can be indexed without being tied to (or blocked by) the load step, and so the admin can see it progressing rather than just waiting on a single pass/fail result.

**Why this priority**: Indexing is what makes products actually findable to end users; it is the step that previously failed at scale. Splitting it out and giving it visible progress directly addresses the reported failure and the "is it stuck?" uncertainty.

**Independent Test**: Can be fully tested by triggering only the "Index Products" action for an organization whose products are already loaded, and observing a progress indicator that updates as products are pushed to the search index, ending in an accurate final count.

**Acceptance Scenarios**:

1. **Given** an organization has products already loaded, **When** the admin triggers "Index Products", **Then** the system begins pushing those products into the search index and shows a progress indicator (e.g., "14,203 / 22,105 indexed").
2. **Given** an indexing run is in progress, **When** the admin views the organization's page, **Then** the count of products indexed so far updates without the admin needing to manually refresh the page.
3. **Given** an organization has 22,000 or more loaded products, **When** the admin triggers "Index Products", **Then** the run completes and every loaded product ends up reflected in the search index (allowing for any items that individually fail and are reported, per Story 3).
4. **Given** no products have been loaded yet for an organization, **When** the admin looks at the "Index Products" action, **Then** it is clearly unavailable/disabled with an indication that products must be loaded first.
5. **Given** an indexing run is already running for an organization, **When** the admin tries to trigger "Index Products" again, **Then** the system prevents a second concurrent run and indicates one is already in progress.

---

### User Story 3 - Review sync history and recover from partial failures (Priority: P2)

An admin needs to know whether a past load or index run fully succeeded, and if some products failed to index, needs enough detail to retry just the indexing step without re-loading everything from Salesforce.

**Why this priority**: At this scale, some individual records failing is expected occasionally; the admin needs a way to see what happened and recover without engineering help, but this is a refinement on top of Stories 1 and 2 rather than blocking them.

**Independent Test**: Can be fully tested by reviewing an organization's sync history after a run that had partial failures, confirming failure counts/details are visible, and confirming the admin can retry indexing without re-triggering the load step.

**Acceptance Scenarios**:

1. **Given** a load or index run has completed (fully or partially), **When** the admin views the organization's sync history, **Then** they see the run's start/end time, total products processed, success count, and failure count.
2. **Given** an index run finished with some products failing to index, **When** the admin views that run's detail, **Then** they can see how many failed and a plain-language reason where available.
3. **Given** a previous index run had failures, **When** the admin triggers "Index Products" again, **Then** the system re-attempts indexing for the organization's currently loaded products without requiring the load step to be repeated.

---

### Edge Cases

- What happens if the admin navigates away or closes the page while an index run is in progress? The run continues in the background; reopening the organization's page shows current progress.
- What happens if Salesforce is unreachable during a "Load Products" run? The action fails clearly with an error message and no partial/corrupted product data is left in an inconsistent state.
- What happens if the search index is unreachable during an "Index Products" run? The run stops, already-indexed products remain indexed, progress reflects what completed, and the failure is recorded for retry.
- What happens when an organization's product count is very small (e.g., fewer than 10)? Both actions still work correctly and the progress indicator still displays sensibly (e.g., "3 / 3 indexed").
- How does the system handle a product that was removed from Salesforce since the last load? It is out of scope for this feature to define catalog deletion/removal behavior beyond current behavior; loading refreshes existing/new products.
- What happens if the admin triggers "Index Products" while a "Load Products" run for the same organization is still in progress? The system prevents indexing from starting until the current load run finishes, since indexing operates on loaded product data.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The organization management screen MUST present two distinct, independently triggerable actions: "Load Products" (Salesforce → platform catalog) and "Index Products" (platform catalog → search index).
- **FR-002**: Triggering "Load Products" MUST retrieve the organization's current products from Salesforce and store/update them in the platform's product records, without automatically starting indexing.
- **FR-003**: Triggering "Index Products" MUST push the organization's currently loaded products into the search index, independent of whether a load was just run or ran previously.
- **FR-004**: The system MUST disable or block "Index Products" until at least one successful "Load Products" run has completed for that organization, with a clear message explaining why.
- **FR-005**: The system MUST prevent a second concurrent run of the same action (load or index) for the same organization while one is already in progress, and clearly indicate the in-progress state.
- **FR-006**: While "Index Products" is running, the system MUST display a progress indicator showing the number of products indexed so far and the total to index (e.g., a count and/or progress bar), updating automatically without requiring a manual page refresh.
- **FR-007**: While "Load Products" is running, the system MUST display a status indicator showing that loading is in progress, and the number of products loaded so far when available.
- **FR-008**: The system MUST support organizations with catalogs of at least 25,000 products completing both "Load Products" and "Index Products" successfully, without failing due to the size or duration of the run.
- **FR-009**: The system MUST record the outcome of every load and index run (start time, end time, total products processed, success count, failure count) for later review.
- **FR-010**: When an index run finishes with one or more products failing to index, the system MUST report the failure count and make it possible to retry indexing for the organization without repeating the load step.
- **FR-011**: The system MUST show, per organization, the timestamp of the last successful load and the last successful (or most recent) index run, so admins can see catalog freshness at a glance.

### Key Entities

- **Product Catalog Record**: A single product belonging to an organization, sourced from Salesforce and stored in the platform; the unit of work for both loading and indexing.
- **Sync Run**: A single execution of either the "Load Products" or "Index Products" action for an organization; has a type (load/index), status (in progress, completed, completed with failures, failed), start/end time, and processed/success/failure counts.
- **Sync Failure Detail**: Information about an individual product that failed during a load or index run, used to explain partial failures and support retry.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An organization with 22,000+ products can complete both "Load Products" and "Index Products" successfully in separate runs, with zero timeout-driven failures, verified against at least one organization of that size.
- **SC-002**: During an "Index Products" run, the displayed indexed-count updates at least every 10 seconds, so admins are never left staring at an unchanging screen for longer than that during an active run.
- **SC-003**: Admins can run "Index Products" on its own (without re-running "Load Products") to refresh the search index, and can run "Load Products" on its own without it triggering indexing.
- **SC-004**: 100% of completed runs (successful, partially failed, or failed) are visible in the organization's sync history with enough detail (counts and, for failures, a reason) that an admin can determine next steps without contacting engineering.
- **SC-005**: When an index run has partial failures, an admin can retry indexing and reach full completion without needing to re-run the load step.

## Assumptions

- The admins who use these two actions are the same existing admin-portal users who currently trigger the combined sync; no new permission tiers are introduced.
- "Index Products" always re-pushes all of the organization's currently loaded, active products to the search index (a full refresh), rather than only pushing products changed since the last run; this matches current combined-sync behavior.
- Progress reporting is near-real-time (e.g., refreshed every few seconds via polling) rather than instantaneous; a few seconds of latency in the displayed count is acceptable.
- Removing products that no longer exist in Salesforce from the platform catalog or search index is existing/unchanged behavior and is out of scope for this feature.
- Search index configuration (which index, field mappings) is already established per organization and does not change as part of this feature — this feature only changes how and when the load and index steps run and are surfaced to the admin.

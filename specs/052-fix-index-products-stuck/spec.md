# Feature Specification: Fix Index Products Button Hang & Preserve Sync Trigger

**Feature Branch**: `[052-fix-index-products-stuck]`

**Created**: 2026-07-17

**Status**: Draft

**Input**: User description: "load products from salesforceto postgres by clicking button laod products. it only add products into products2 table.already we have trigger to craete a records simultanoulsy in algolia_synce_queue keep that as it is and add product from postgres to algolia index only make it separate when i click on button add products to index. now i click on button index product button nothing happen still loading. check and fix"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Load Products keeps writing only to the product catalog, untouched (Priority: P1)

An admin clicks "Load Products" to pull the organization's catalog from Salesforce. This must continue to only write product records to the platform's catalog storage. The organization's existing automatic bookkeeping — a database rule that logs every catalog write as a pending search-sync entry — must keep working exactly as it already does; this fix must not remove, disable, or clean up those automatically-created entries.

**Why this priority**: A previous change to split "Load" from "Index" went further than intended and started deleting the automatically-created sync bookkeeping entries during Load, to avoid indexing starting automatically. That bookkeeping is existing, desired behavior and must be restored — deleting it is an unwanted side effect, not a feature.

**Independent Test**: Trigger "Load Products" for an organization, then confirm the catalog is updated AND that the automatic sync-bookkeeping entries created by the existing database rule are present and untouched (not deleted) afterward.

**Acceptance Scenarios**:

1. **Given** an organization's catalog is being loaded from Salesforce, **When** each product record is written to catalog storage, **Then** the organization's existing automatic rule still logs a corresponding pending search-sync bookkeeping entry, exactly as it did before any splitting of Load/Index was introduced.
2. **Given** a Load Products run has just finished, **When** an admin inspects the pending search-sync bookkeeping entries, **Then** none of them have been removed or altered as a side effect of the Load run itself.

---

### User Story 2 - Index Products reliably completes instead of hanging forever (Priority: P1)

An admin clicks "Index Products" expecting the queued catalog changes to be pushed into the live search index, with visible progress. Today, after clicking, the button shows a permanent loading/spinner state that never resolves — no progress, no error, no completion — leaving the admin unable to tell whether anything is happening at all.

**Why this priority**: This is the core reported defect. An action that silently never finishes is worse than no action at all, because it gives false confidence that something is in progress while leaving the admin with no way to diagnose or recover.

**Independent Test**: With products already loaded and pending search-sync bookkeeping entries present, click "Index Products" and confirm that, without any additional manual step, the indexed count visibly increases over time and the run reaches a completed state within a bounded, reasonable time for the catalog's size.

**Acceptance Scenarios**:

1. **Given** an organization has loaded products with pending search-sync bookkeeping entries (whether created by the automatic rule from Story 1, by a prior "Index Products" click, or both), **When** the admin clicks "Index Products", **Then** those entries begin being processed into the live search index without requiring the admin to take any further action.
2. **Given** an "Index Products" run is in progress, **When** the admin watches the progress indicator, **Then** the indexed count increases over successive checks until it reaches the total, rather than remaining at zero indefinitely.
3. **Given** an "Index Products" run has processed everything there is to process, **When** the admin views the button/indicator, **Then** it shows a completed state (with a success or partial-failure summary) instead of continuing to show a loading state.
4. **Given** the mechanism that pushes queued entries to the search index is not currently active for any reason, **When** the admin clicks "Index Products", **Then** the system does not silently spin forever — it either makes the push happen on its own or surfaces a clear message that indexing could not proceed.

---

### Edge Cases

- What happens if "Index Products" is clicked while older pending sync-bookkeeping entries already exist from a previous Load (created by the automatic rule) that were never processed? They must be included and processed, not ignored.
- What happens if the admin clicks "Index Products", then closes the page before it finishes? Progress must continue server-side and be visible again when the admin returns, per existing behavior from the prior split-sync feature.
- What happens if pushing to the search index fails partway through (e.g., a transient error)? The run must still reach a definite end state (completed with errors) rather than hanging, and failures must be visible, per the existing sync-history behavior.
- What happens on an organization with a very large number of pending entries? Progress must still visibly advance over time rather than appearing stalled for long stretches with no feedback.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: "Load Products" MUST only write product records to catalog storage. It MUST NOT delete, suppress, or otherwise interfere with the pending search-sync bookkeeping entries that the organization's existing automatic database rule creates as a side effect of those writes.
- **FR-002**: "Index Products" MUST result in visible, ongoing progress after being clicked, with no additional manual step required from the admin, regardless of whether the entries being processed originated from the automatic rule (Story 1) or from a previous "Index Products" run.
- **FR-003**: The system MUST NOT leave "Index Products" in an indefinite loading state with no progress and no explanation. If progress cannot be made, the admin MUST see a clear indication of that within a reasonable time.
- **FR-004**: "Index Products" progress MUST reach one of a completed, completed-with-errors, or clearly-surfaced-error end state within a bounded, reasonable time proportional to the number of pending entries — never remaining "in progress" forever with no change.
- **FR-005**: All pending search-sync bookkeeping entries for an organization — however they were created — MUST be eligible for processing by "Index Products"; none are silently orphaned or skipped.
- **FR-006**: The existing sync history and per-run progress reporting (counts, start/end time, failures) already built for "Load Products" and "Index Products" MUST continue to work correctly after this fix.

### Key Entities

- **Search-Sync Bookkeeping Entry**: A pending record (created automatically by an existing database rule whenever a catalog record is written, or explicitly by an "Index Products" run) representing "this catalog item needs to be pushed to the search index." The unit of work "Index Products" processes.
- **Index Run**: A single "Index Products" click's execution — must always reach a definite end state, visible to the admin, and must account for all bookkeeping entries relevant to it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of "Load Products" runs leave the automatic rule's search-sync bookkeeping entries intact and unmodified by the Load action itself.
- **SC-002**: 100% of "Index Products" runs show the indexed count increasing within the first minute of being clicked, for organizations that have pending entries to process.
- **SC-003**: 0% of "Index Products" runs remain in a "loading" state for longer than a reasonable bounded window (on the order of a few minutes, scaled to catalog size) without either completing or surfacing a clear message.
- **SC-004**: An admin can always determine, from the admin portal alone, whether an "Index Products" run is progressing, finished, or unable to proceed — with no need to inspect server logs or the database directly.

## Assumptions

- The organization's existing automatic database rule that logs catalog writes as pending search-sync entries is correct, desired, pre-existing behavior; this fix restores/preserves it rather than redesigning it.
- "Index Products" should not depend on the admin knowing about, or manually starting, any separate process for progress to occur — the action itself is responsible for making progress happen once clicked, which is the most robust way to eliminate the reported "nothing happens" symptom regardless of *why* progress previously stalled.
- A "reasonable bounded time" for reaching a definite end state scales with the number of pending entries; there is no fixed universal number of seconds, but the admin must never be left with a spinner that has been static for an extended period with zero explanation.
- This fix builds on and does not change the previously delivered sync-history, progress-polling, and concurrency-guard behavior for Load/Index runs — only the specific defects described above.

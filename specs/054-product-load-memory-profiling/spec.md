# Feature Specification: Product Load Memory Profiling on Heroku

**Feature Branch**: `054-product-load-memory-profiling`

**Created**: 2026-07-21

**Status**: Draft

**Input**: User description: "want to check how much memory needs to load from 0-1000 to 19000-20000 products loads in hroku server"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See memory usage at each 1,000-product checkpoint during a Load run (Priority: P1)

An engineer responsible for the platform's reliability on Heroku wants to know how much server memory the "Load Products" operation (Salesforce → catalog storage) consumes as it processes an organization's catalog, broken down in checkpoints of 1,000 products (0-1,000, 1,000-2,000, ... up to the largest organizations the platform is expected to support). Today, the Load run fetches an organization's entire active catalog into memory in a single pass before any data is written to storage, and there is no visibility into how much memory that consumes at any point — so there is no way to know how close a large organization's Load run gets to exhausting the Heroku dyno's memory limit before it happens in production.

**Why this priority**: Without this visibility, the team is flying blind on a known risk: the existing Load implementation holds the entire fetched catalog in memory before writing anything, and the platform's own stated target scale is organizations with 25,000+ products. A dyno that runs out of memory during a Load is killed by the platform, producing a failed, non-diagnosable run for the admin who triggered it — this is the production incident this feature exists to prevent by making the risk measurable ahead of time.

**Independent Test**: Trigger a Load Products run for an organization whose catalog is at least 20,000 products, and confirm that memory-usage measurements are captured and are retrievable at each 1,000-product checkpoint from 0 up to the catalog's full size, without needing to inspect the server process directly while the run is in progress.

**Acceptance Scenarios**:

1. **Given** a Load Products run is in progress for an organization with 20,000+ products, **When** the run's product count crosses each 1,000-product boundary (1,000, 2,000, 3,000, ... 20,000), **Then** a memory-usage measurement is recorded for that checkpoint.
2. **Given** a Load Products run has completed, **When** an engineer looks at that run afterward, **Then** they can see the recorded memory measurement at every checkpoint the run reached, in order, without needing server/dyno shell access.
3. **Given** an organization's catalog is smaller than 1,000 products, **When** its Load run completes, **Then** at least one memory measurement (covering the whole run) is still recorded, so small orgs are not silently excluded from this visibility.

---

### User Story 2 - Compare memory growth across organizations of different catalog sizes (Priority: P2)

The engineer wants to compare memory-usage measurements across multiple Load runs — for example, an organization with 1,000 products versus one with 20,000 — to understand how memory scales with catalog size and estimate a safe upper bound before the current Heroku dyno's memory limit is at risk.

**Why this priority**: A single run's numbers are useful, but the real capacity-planning question ("at what catalog size do we start to worry?") requires comparing checkpoints across runs of different sizes. This depends on User Story 1 already capturing consistent, comparable checkpoint data.

**Independent Test**: After Load runs have completed for at least two organizations of different catalog sizes, retrieve both runs' checkpoint measurements and confirm they can be lined up by checkpoint (e.g., both runs' 1,000-product measurement) for direct comparison.

**Acceptance Scenarios**:

1. **Given** two completed Load runs for organizations of different catalog sizes, **When** the engineer retrieves both runs' checkpoint measurements, **Then** each run's measurements are labeled with the same checkpoint boundaries so the two can be compared side by side.

---

### Edge Cases

- What happens if a Load run fails or is interrupted partway through (e.g., a Salesforce error) before reaching a checkpoint? Whatever checkpoints were reached before the failure MUST remain recorded and retrievable, even though the run itself ends in a failed state.
- What happens if an organization's catalog is larger than 20,000 products? Checkpoint recording MUST continue at every subsequent 1,000-product boundary beyond 20,000, not stop there — 20,000 is the currently-expected upper range to examine, not a hard ceiling on measurement.
- What happens on an organization with a catalog so small that it never reaches even the first 1,000-product checkpoint? Per Acceptance Scenario 3 of User Story 1, one measurement covering the full (sub-1,000) run is still recorded.
- What happens if memory usage cannot be read on the platform for some reason? The Load run itself MUST still complete normally; a missing measurement must not fail or delay the underlying catalog load.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST record a memory-usage measurement for a Load Products run at each 1,000-product checkpoint as the run's fetched/processed count crosses that boundary (1,000, 2,000, 3,000, ... continuing beyond 20,000 for larger catalogs).
- **FR-002**: The system MUST record at least one memory-usage measurement for every Load run, even if the organization's catalog never reaches the first 1,000-product checkpoint.
- **FR-003**: Each recorded measurement MUST be associated with the specific Load run and the checkpoint (product count) it corresponds to, so measurements from different runs can be compared by matching checkpoints.
- **FR-004**: Memory measurements recorded before a run fails or is interrupted MUST remain retrievable after the run ends, regardless of the run's final status.
- **FR-005**: A failure to capture a memory measurement MUST NOT cause the underlying Load run to fail, stall, or produce incorrect catalog data — measurement is strictly observational and must not change existing Load behavior (FR-001 of `052-fix-index-products-stuck` — Load must continue to only write product records and preserve existing sync bookkeeping).
- **FR-006**: [NEEDS CLARIFICATION: is this memory-measurement capability a one-time diagnostic to be run manually against one or two large-catalog organizations to gather capacity-planning numbers, or should every future Load Products run always capture these checkpoints going forward?]
- **FR-007**: [NEEDS CLARIFICATION: where must these measurements be visible to the engineer — the existing Heroku dyno logs only, or also surfaced as a new section in the admin portal's existing sync-history view (from `052-fix-index-products-stuck`/`051-product-algolia-sync-split`)?]
- **FR-008**: [NEEDS CLARIFICATION: should the system only measure and report memory usage, or should it also actively warn/guard (e.g., surface a clear warning, or abort the Load) if a measurement crosses a defined risk threshold relative to the Heroku dyno's memory limit?]

### Key Entities

- **Memory Checkpoint Measurement**: A single recorded data point tying a Load run, a product-count checkpoint (e.g., 1,000, 2,000, ... 20,000), and the amount of server memory in use at that point during the run.
- **Load Run** *(existing entity, from `052-fix-index-products-stuck`)*: The existing per-organization Load Products execution record; this feature adds memory checkpoint data associated with a run but does not change the run's existing fields or lifecycle.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For a Load run against a 20,000+-product organization, an engineer can retrieve memory-usage measurements for at least 20 distinct checkpoints (every 1,000 products from 1,000 through 20,000) after the run completes.
- **SC-002**: 100% of Load runs — regardless of catalog size or whether the run ultimately succeeds, fails, or is interrupted — have at least one memory measurement recorded and retrievable afterward.
- **SC-003**: An engineer can determine, using only the measurements this feature records (no server shell access), whether memory usage is growing linearly, growing faster than linearly, or roughly flat as catalog size increases from 0 to 20,000 products.
- **SC-004**: Adding this measurement capability does not change the outcome of any existing Load run — the same products are loaded, in the same way, with the same pass/fail result, as before this feature existed.

## Assumptions

- "Memory needed to load" refers to server-side (Heroku dyno) memory consumed by the Load Products operation itself, not client/browser memory — the operation in question (`lib/product-load-service.ts`'s `fetchAllProducts`/`runLoadAsync`) runs entirely server-side with no browser involvement.
- The 0-1,000-through-19,000-20,000 range named in the request is treated as checkpoints at every 1,000-product boundary across that range, continuing past 20,000 if an organization's catalog is larger, per the Edge Cases above.
- This feature is additive instrumentation only; it does not change the existing Load behavior of fetching the full Salesforce catalog before writing to storage, and does not itself introduce batching/streaming of the Salesforce fetch — any decision to change that fetch strategy is a separate, follow-on effort informed by what this feature measures.
- The existing `product_sync_runs` tracking (organization-scoped, per-schema) established by `052-fix-index-products-stuck` is the run this feature's measurements attach to; no new, separate run-tracking mechanism is introduced.

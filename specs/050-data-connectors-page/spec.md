# Feature Specification: Data Connectors Management Page

**Feature Branch**: `[050-data-connectors-page]`

**Created**: 2026-07-16

**Status**: Draft

**Input**: User description: "Data connector page mock — a page for managing external data-source connections (provider endpoints, vaulted credentials, sync schedule/webhook trigger, field mapping, health/fault monitoring) that feeds a catalog normalization review queue. Add a 'Connectors' entry to the side navigation menu."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View connector health at a glance (Priority: P1)

A staff user responsible for keeping the product catalog current opens the Data Connectors page from the side menu to see, at a glance, which external data sources (resellers, distributors, marketplaces) are feeding the catalog successfully and which need attention.

**Why this priority**: Without visibility into connector health, broken data feeds go unnoticed and the catalog silently goes stale or incomplete. This is the core reason the page exists.

**Independent Test**: Can be fully tested by navigating to the Connectors page and confirming it lists every configured connector with a clear status (healthy/degraded/down), key sync metrics, and any active faults — deliverable on its own even before add/edit capability exists.

**Acceptance Scenarios**:

1. **Given** one or more connectors are configured, **When** the user opens the Data Connectors page, **Then** each connector is listed with its provider name, connection type, current health status, last sync time, and record count from its most recent run.
2. **Given** a connector has active faults (e.g., expired credentials, delivery gaps, repeated failures), **When** the user views that connector's card, **Then** the fault(s) are displayed with a severity indicator, a plain-language message, and when it was detected.
3. **Given** the user is on any other page in the app, **When** they look at the side navigation, **Then** a "Connectors" entry is visible, and if any connector has an active fault, the entry shows a count badge.

---

### User Story 2 - Add a new data connector (Priority: P1)

A staff user needs to onboard a new reseller or distributor feed so its offers start flowing into the catalog normalization pipeline.

**Why this priority**: The page is not useful if connectors can only be viewed and never added — onboarding new sources is the primary write action on this page.

**Independent Test**: Can be fully tested by opening "Add Connection," completing the required fields (provider name, connection type, endpoint, auth method, credential reference, trigger mode), saving, and confirming the new connector appears in the list in a "healthy, never synced" state.

**Acceptance Scenarios**:

1. **Given** the user opens the "Add Connection" form, **When** they submit without filling in provider name, endpoint URL, or credential reference, **Then** the system blocks submission and indicates which required fields are missing.
2. **Given** the user selects a scheduled (cron-style) trigger, **When** they save the connector, **Then** the connector is created with that recurring schedule and a computed "next run" time.
3. **Given** the user selects a webhook (push) trigger instead, **When** they save the connector, **Then** the connector is created with an inbound delivery endpoint and is marked as event-driven rather than on a fixed schedule.
4. **Given** the user is filling out the form, **When** they enter a credential, **Then** only a reference/pointer to the credential is stored by the system — the actual secret value is never persisted or displayed in the application.
5. **Given** the user defines how raw provider fields map to the common offer fields (part number, description, product family, manufacturer, brand, price), **When** they save, **Then** that mapping is stored with the connector and shown wherever the connector's configuration is reviewed.

---

### User Story 3 - Diagnose and recover a broken connector (Priority: P2)

A staff user notices a connector is down or degraded and needs to understand why and take corrective action without leaving the page.

**Why this priority**: Detecting a problem (Story 1) is only half the job — the page must also let staff act on it, or they still have to go elsewhere to fix it.

**Independent Test**: Can be fully tested by taking a connector that is flagged as down due to an expired credential, using the page's recovery action, and confirming the connector returns to a healthy state with faults cleared.

**Acceptance Scenarios**:

1. **Given** a connector is healthy, **When** the user clicks "Test Connection," **Then** the system attempts to reach the provider using the stored credential reference and reports success or failure with a specific reason.
2. **Given** a connector's credential has expired, **When** the user re-authorizes it, **Then** the fault clears, the connector's status returns to healthy, and its token/credential expiry is refreshed.
3. **Given** a connector is healthy or degraded, **When** the user triggers "Run Now," **Then** the system attempts an on-demand sync outside its normal schedule and reports how many records were pulled.
4. **Given** a connector has failed repeatedly and its automatic pulls have been suspended, **When** the user views it, **Then** this suspended state is clearly indicated and distinguished from a connector that is merely degraded.
5. **Given** a connector is currently down, **When** the user attempts to resume/unpause it without first resolving the underlying fault, **Then** the system prevents the resume and explains that the fault must be cleared first.

---

### Edge Cases

- What happens when a user tries to add a connector with a provider name or endpoint that's already registered? The system should flag it rather than silently creating a duplicate.
- How does the system handle a connector whose scheduled sync overlaps with a manual "Run Now" trigger for the same connector?
- What happens when "Test Connection" is run against a connector that has never been saved (mid-creation, in the Add Connection form) versus an existing, already-saved connector?
- How is a connector's health status determined when it has no faults but also has never completed a successful sync (e.g., newly added, webhook connector awaiting its first event)?
- What happens when a webhook-based connector receives no events for longer than its expected cadence — is this surfaced differently than a scheduled connector missing its run window?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a "Connectors" entry in the side navigation, visible to any authenticated user (Client, Partner, or Client-Partner) whose role has been granted the relevant permission, that navigates to the Data Connectors page.
- **FR-001a**: System MUST hide the "Connectors" navigation entry, and block direct access to the Data Connectors page, for users whose role lacks the relevant permission.
- **FR-002**: The Connectors navigation entry MUST display a count badge when one or more connectors currently have an active fault, and MUST hide the badge when there are none.
- **FR-003**: System MUST display a summary of all connectors including total count, count healthy, count degraded, count down, total records synced in the last 24 hours, and total active faults.
- **FR-004**: System MUST list each configured connector showing: provider name, connection type, authentication method, endpoint, credential reference (never the raw secret), rate limit, trigger mode (scheduled or webhook) with its schedule or webhook detail, current health status, last sync time, latency, success rate, records pulled in the last run, next scheduled trigger, and credential/token expiry.
- **FR-005**: System MUST allow a user to view the boundary field mapping for each connector — how raw provider fields translate to the common offer schema (part number, description, product family, manufacturer name, brand name, list price).
- **FR-006**: System MUST allow a user to add a new connector by supplying provider name, connection type, endpoint URL, authentication method, a credential reference, an optional rate limit, and a trigger mode (scheduled cadence or webhook).
- **FR-007**: System MUST require provider name, endpoint URL, and credential reference before a new connector can be saved, and MUST clearly indicate any missing required field.
- **FR-008**: System MUST store only a reference/pointer to each connector's credential; the underlying secret value MUST NOT be persisted in or displayed by the application.
- **FR-009**: System MUST allow a user to define, at creation time, how each of the six common offer fields maps to a raw field name from the provider.
- **FR-010**: System MUST allow a user to test an existing connector's reachability on demand and report a clear success or failure outcome, including a reason on failure.
- **FR-011**: System MUST allow a user to trigger an on-demand sync ("Run Now") for a connector that is not currently down, and MUST report how many records were pulled.
- **FR-012**: System MUST prevent an on-demand sync from being triggered on a connector that is currently down, and MUST explain why.
- **FR-013**: System MUST allow a user to pause an active connector and resume a paused connector, except that a connector with unresolved faults MUST NOT be resumable until those faults are cleared.
- **FR-014**: System MUST allow a user to re-authorize a connector whose credential/token has expired, which MUST clear the related fault(s) and return the connector to a healthy state.
- **FR-015**: System MUST surface each connector's faults with a severity level, a human-readable description, and when the fault was detected.
- **FR-016**: System MUST distinguish, in the connector list, between connectors that are healthy, degraded (reachable but underperforming), and down (unreachable or suspended).
- **FR-017**: System MUST allow the user to trigger a reachability check across all configured connectors at once and see a rolled-up healthy/degraded/down count as a result.

### Key Entities

- **Data Connector**: Represents one external data source configured to feed catalog offers into the system. Attributes include provider identity, connection type, endpoint, authentication method, a reference to its vaulted credential, rate limit, trigger configuration (schedule or webhook), current health status, sync metrics (last sync time, latency, success rate, records pulled, next trigger, credential expiry), a boundary field mapping to the common offer schema, and any active faults.
- **Fault**: Represents a detected problem with a specific connector — a severity (warning or critical), a descriptive message, a detection code/category, and a timestamp. Faults are cleared automatically when their underlying condition (e.g., credential re-authorization) is resolved.
- **Field Mapping**: Represents the correspondence between one raw field name from a provider's data and one of the common offer schema fields (part number, description, product family, manufacturer name, brand name, list price) for a given connector.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A staff user can determine the health of every configured data source within 5 seconds of opening the Connectors page, without needing to open any individual connector.
- **SC-002**: A user can onboard a new data connector (from opening "Add Connection" to seeing it appear in the list) in under 3 minutes.
- **SC-003**: 100% of credential values entered while adding or editing a connector are stored only as references — no raw secret is ever visible in the connector list, detail view, or field-mapping display.
- **SC-004**: A user can identify the root cause of a connector fault and take the correct recovery action (test, re-authorize, or run now) without leaving the Connectors page in at least 90% of fault scenarios.
- **SC-005**: The side navigation accurately reflects the current count of connectors with active faults at all times, with no more than a few seconds of staleness after a fault is created or cleared.

## Assumptions

- The Data Connectors page is a net-new capability; there is no existing connector-management feature in the current navigation to migrate or replace.
- Scope for this feature is the Data Connectors page and its side-navigation entry only. The "Catalog Normalization" review queue and "Configure Order" promotion flow shown in the reference mock represent downstream consumers of connector data and are out of scope for this specification; they may be defined separately.
- The connectors referenced in this spec's examples (e.g., a photo/video reseller, a distributor, a marketplace) are illustrative only. This specification defines the generic connector-management capability (add, monitor, test, and recover any provider connection); it does not require a specific fixed set of named, real provider integrations to be considered complete.
- Actual execution of a sync (pulling and normalizing offers from a provider) is assumed to be a backend capability this feature's UI triggers and reports on; the mechanics of the sync itself are covered by separate technical design, not this specification.
- "Test Connection," "Run Now," and "Re-authorize" are assumed to reflect real outcomes from attempting to reach the provider, not simulated/cosmetic state changes.

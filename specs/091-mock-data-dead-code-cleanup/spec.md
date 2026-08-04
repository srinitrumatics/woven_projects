# Feature Specification: Mock Data & Dead Code Cleanup

**Feature Branch**: `091-mock-data-dead-code-cleanup`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Fix the audit's 'Mock Data & Dead Code' tier, based on a fresh current-state re-audit (some original audit claims were stale and corrected below). Covers: (1) Shipment Detail's TrackingTimelineModal falls back to hardcoded mock tracking data — including a corrupted location string 'Oakland, CA \" Oakland, CA 94612' — whenever real tracking events are absent, and its opening 'Track Timeline' button has no loading/disabled guard unlike the adjacent 'Track Shipment' button; fix removes the mock fallback (the component already has an honest 'No tracking events found' empty-state branch that's currently dead code), adds a loading state passed from ManifestSummary, and guards the button the same way its sibling already is. (2) Proposal Line Detail and Shipment Line Detail each ship a fully-interactive image carousel (arrows, dot indicators, fake 'Image 1'/'Image 2' labels) that can never show a real image, because — confirmed via investigation — neither line item's fetched data includes any product-image reference at all (unlike Product Detail's ProductGallery, which does correctly render real images and is NOT part of this fix; the audit's inclusion of Product Detail here was stale/incorrect). Fix strips both fake carousels down to a static placeholder icon with no navigation controls and no fabricated per-image labels. (3) Supplier Bill Line Detail's SBLFilesTab has a copy-paste bug: it calls the orders API (/api/salesforce/orders) with a prop still named poId and objectName=Supplier_Bill_Line__c, instead of the dedicated /api/supplier-bills endpoint that already supports the same preview/download actions — fix mirrors the known-working sibling pattern (Purchase Order Line Detail's POFilesTable.tsx calling /api/purchase-orders) by switching SBLFilesTab to call /api/supplier-bills and renaming the poId prop appropriately. (4) app/purchase-orders/[id]/components/PODetails.tsx is a confirmed-dead 94-line file with zero incoming references anywhere in the repo — delete it. (Note: the audit's companion claim of a dead Badges.tsx file under supplier-bills was investigated and found stale — no such file exists in the current repo, so it's dropped from scope.) (5) app/purchase-orders/[id]/components/POSupplierInfo.tsx is mislabeled — it renders a 'Billing Information' / 'Invoice Destination' heading and only billing/invoice fields (Bill to Account, Bill to Location, Billing Address, Payment Terms, Customer PO), never any actual supplier name/DBA/contact field, despite its name and prop-type both saying 'Supplier'. Fix renames the file/component/interface to POBillingInfo.tsx (matching the module-prefixed billing-info naming convention already used by InvoiceBillingInfo.tsx and QuoteBillingInfo.tsx in sibling modules) and updates its single import site in page.tsx — a pure rename to correct the mislabeling, not new supplier-data functionality, since building real supplier fields would be new scope beyond fixing what exists."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Shipment tracking timeline shows real data or an honest empty state (Priority: P1)

A user viewing a Shipment Detail page clicks "Track Timeline" expecting to see that shipment's actual tracking history — never fabricated events for a shipment that has no real tracking data yet, and never a clickable button before tracking data has even loaded.

**Why this priority**: This is the most user-deceptive defect in this tier — a user could reasonably believe a shipment has already been delivered to a specific (garbled) address when no such event ever occurred. It actively misinforms an operational decision, not just a cosmetic gap.

**Independent Test**: Open a Shipment Detail page for a shipment with no real tracking events, click "Track Timeline", and confirm the modal shows a genuine "no tracking events found" state (or a loading spinner while data is still in flight) rather than fabricated delivery history.

**Acceptance Scenarios**:

1. **Given** a shipment with no real tracking events, **When** a user opens the Track Timeline modal, **Then** it shows an honest empty state, never the previously hardcoded mock events.
2. **Given** a shipment's tracking data is still being fetched, **When** a user views the "Track Timeline" button, **Then** the button reflects a loading state consistent with the adjacent "Track Shipment" button's own loading guard.
3. **Given** a shipment with real tracking events, **When** a user opens the Track Timeline modal, **Then** it renders those real events exactly as it does today (unaffected by this fix).

---

### User Story 2 - Line-detail image carousels don't promise images that don't exist (Priority: P2)

A user viewing a Proposal Line Detail or Shipment Line Detail page sees a static placeholder for the product image — not a fully interactive carousel (arrows, dot indicators, "Image 1 of 3"-style labels) that implies multiple real photos exist when none are ever available for these record types.

**Why this priority**: A visible, user-facing honesty gap — lower urgency than the tracking-data defect because no operational decision is misinformed, but it invites a user to click controls that can never do anything.

**Independent Test**: Open any Proposal Line Detail or Shipment Line Detail page and confirm the image area shows a plain static placeholder with no arrows, dots, or per-image label — and that this in no way affects Product Detail's own image gallery, which continues to show real images unchanged.

**Acceptance Scenarios**:

1. **Given** a Proposal Line Detail page, **When** a user views the product image area, **Then** it shows a static placeholder icon with no carousel navigation controls.
2. **Given** a Shipment Line Detail page, **When** a user views the product image area, **Then** it shows a static placeholder icon with no carousel navigation controls.
3. **Given** a Product Detail page, **When** a user views its image gallery, **Then** it is completely unaffected by this change and continues to render real product images when available.

---

### User Story 3 - Supplier Bill Line file previews/downloads use the correct endpoint (Priority: P2)

A user viewing a Supplier Bill Line Detail's Files tab and clicking preview or download gets that file served through the Supplier Bill module's own API, not a Purchase-Order-flavored endpoint left over from a copy-pasted component.

**Why this priority**: A correctness/maintainability defect — the current call happens to work today because the underlying file-fetch logic ignores the mismatched parameters, but it's calling the wrong endpoint with a misleadingly-named prop, and is one Salesforce/API change away from silently breaking.

**Independent Test**: Open a Supplier Bill Line Detail page's Files tab, preview and download a file, and confirm (via network inspection) that the request goes to the Supplier Bills API rather than the Orders API, with no regression in the file actually opening/downloading correctly.

**Acceptance Scenarios**:

1. **Given** a Supplier Bill Line Detail's Files tab, **When** a user clicks "Preview" on a file, **Then** the request is sent to the Supplier Bills API and the file preview opens exactly as it did before.
2. **Given** a Supplier Bill Line Detail's Files tab, **When** a user clicks "Download" on a file, **Then** the request is sent to the Supplier Bills API and the file downloads exactly as it did before.

---

### User Story 4 - No dead files or mislabeled components linger in the Purchase Order module (Priority: P3)

A developer working in the Purchase Order Detail module doesn't encounter an unused 94-line component file while trying to understand what's actually rendered, and doesn't find a component named "Supplier Info" that actually displays billing information.

**Why this priority**: Pure codebase hygiene — no end-user-visible behavior change from the deletion, and the rename only changes an internal file/component name, not what's displayed. Lowest priority because nothing a user sees is incorrect today (the heading already correctly says "Billing Information"); only the file/component name is misleading to developers.

**Independent Test**: Confirm the dead file no longer exists and nothing references it; confirm Purchase Order Detail's billing card renders identically before and after the rename, under its new file name.

**Acceptance Scenarios**:

1. **Given** the codebase after this change, **When** searching for the deleted dead file, **Then** it no longer exists and no remaining file references it.
2. **Given** the Purchase Order Detail page, **When** it renders after the rename, **Then** the billing information card displays exactly the same heading, fields, and data as before.

### Edge Cases

- What happens if a shipment's tracking fetch fails outright (network/API error), not just "no events yet"? The modal must still show a genuine empty/error state, never fall back to fabricated data, regardless of why real data is unavailable.
- What happens to the Track Timeline button while tracking data is actively loading for the first time? It must reflect a loading state rather than being immediately clickable into a premature empty state.
- What happens to the static placeholder replacing each carousel visually — does it still communicate "no image available" clearly? Yes — it keeps the existing placeholder icon already used elsewhere in the app for missing images, just without the fake interactive chrome around it.
- What happens to any in-flight or cached Supplier Bill Line file requests using the old endpoint during rollout? Not a concern — this is a client-side call-site change with no persisted URLs or bookmarks pointing at the old endpoint pattern.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Shipment Detail "Track Timeline" modal MUST NOT display fabricated/mock tracking events under any circumstance where real tracking data is unavailable.
- **FR-002**: The Shipment Detail "Track Timeline" modal MUST display a genuine "no tracking events found" state when no real tracking events exist for that shipment.
- **FR-003**: The "Track Timeline" button MUST reflect a loading state while tracking data is being fetched, consistent with the adjacent "Track Shipment" button's existing loading/disabled behavior.
- **FR-004**: Shipment Detail's real-tracking-data rendering path (when tracking events do exist) MUST remain unchanged by this feature.
- **FR-005**: Proposal Line Detail's product-image area MUST render as a static placeholder with no carousel navigation controls (no arrows, no dot indicators) and no fabricated per-image label text.
- **FR-006**: Shipment Line Detail's product-image area MUST render as a static placeholder with no carousel navigation controls (no arrows, no dot indicators) and no fabricated per-image label text.
- **FR-007**: Product Detail's existing image gallery MUST NOT be modified or regressed by this feature.
- **FR-008**: Supplier Bill Line Detail's Files tab MUST send preview and download requests to the Supplier Bills API rather than the Orders API.
- **FR-009**: Supplier Bill Line Detail's Files tab MUST continue to successfully preview and download files with no regression in functionality after the endpoint change.
- **FR-010**: The confirmed-dead `PODetails.tsx` file MUST be deleted, with zero remaining references to it anywhere in the codebase.
- **FR-011**: The Purchase Order Detail billing-information component MUST be renamed (file, component, and prop-type name) to a name reflecting its actual billing-information purpose, consistent with the naming convention used by equivalent components in sibling modules.
- **FR-012**: Purchase Order Detail's billing-information card MUST render identically (same heading, fields, and data) before and after the rename.
- **FR-013**: None of the fixes in this feature MUST change any business logic, data-fetching source, or Salesforce read/write behavior beyond the specific endpoint correction in FR-008 — every other fix is either dead-code removal, a UI-honesty correction, or a pure rename.

### Key Entities

- **Shipment tracking event**: A real, Salesforce-sourced tracking history entry for a shipment; today can be silently replaced by fabricated placeholder events when absent.
- **Line-detail product image placeholder**: The static "no image" affordance already used elsewhere in the app for missing images, replacing the fake interactive carousel on two line-detail page types.
- **Supplier Bill Line file**: A file/attachment associated with a Supplier Bill Line, fetched via a preview/download action that must be routed through the correct module-specific API.
- **`PODetails.tsx`**: A confirmed-dead component file in the Purchase Order module, deleted as part of this feature.
- **Purchase Order billing-information component**: The existing, correctly-functioning billing-information card on Purchase Order Detail, renamed (not rebuilt) to match its actual displayed content.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 instances of fabricated tracking data appearing in the Track Timeline modal, verified across shipments with zero real tracking events.
- **SC-002**: 100% of Proposal Line Detail and Shipment Line Detail pages show a static placeholder image with 0 remaining carousel navigation controls.
- **SC-003**: 100% of Supplier Bill Line Detail file preview/download actions route through the Supplier Bills API, verified via direct request inspection.
- **SC-004**: 0 remaining references anywhere in the codebase to the deleted dead file.
- **SC-005**: 100% of Purchase Order Detail page loads render the billing-information card with 0 visible or data differences from before the rename.
- **SC-006**: 0 regressions in any business logic, data-fetching, or Salesforce interaction across all changes in this feature.

## Assumptions

- The original audit's inclusion of Product Detail among the "placeholder image carousel" findings was investigated and confirmed stale: `ProductGallery.tsx` already renders real product images correctly today and is explicitly out of scope for this feature.
- The original audit's claim of a dead `Badges.tsx` file under the Supplier Bills module was investigated and confirmed stale: no such file exists anywhere in the current repo, so it is dropped from this feature's scope entirely.
- Renaming `POSupplierInfo.tsx` to a billing-info-appropriate name is a pure rename (file, component, prop-type identifiers, and its single import site) — it does not add real supplier name/DBA/contact fields, since building genuine supplier-data display would be new functionality beyond this feature's fix-what-exists scope, and no such data was confirmed available on the existing Purchase Order data model during investigation.
- Proposal Line Detail and Shipment Line Detail have no product-image reference available anywhere in their currently-fetched data, confirmed via direct investigation of both pages' data types and the services backing them — wiring real images is not feasible without a new data source, which is out of scope.
- Supplier Bill Line file preview/download currently functions correctly today only because the underlying file-fetch logic happens to ignore the mismatched order-specific parameters; this feature corrects the call site proactively rather than waiting for a future Salesforce/API change to break it.
- No database schema or Salesforce data changes are required — all fixes are presentation-layer, dead-code-removal, or client-side API call-site corrections, per the existing architecture where business data is mastered in Salesforce and the app is a presentation layer over it.
- No sibling-folder propagation, commit, or push is included in this feature's scope — per this repo's established convention, those happen only when explicitly requested after implementation and verification.

# Feature Specification: Line Detail Status Badge Consistency

**Feature Branch**: `081-line-detail-status-badges` (no dedicated feature branch — no `before_specify` git hook configured for this repo, consistent with `080-status-badge-audit`)

**Created**: 2026-08-02

**Status**: Draft

**Input**: User description: "all datatables status and all status should come from one file components/ui/statusbadge.tsx. need to check lines/[lineid]/ folder files datatables too and status"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consistent status badges inside every line detail sub-tab (Priority: P1)

As a Client, Partner, or Client-Partner user viewing an order/quote/proposal/invoice/purchase-order/supplier-bill **line's** detail page, I see the status of every related record listed in its sub-tabs (Fulfillments, Purchases, Supplier Bills, RMAs, RTVs, Credit Memos, Debit Memos, related Quotes, Sales Orders, Invoices, Shipping Manifests) rendered as a colored status badge — matching the same colors and shapes used for that same status everywhere else in the app — instead of plain unstyled text.

**Why this priority**: Plain-text status values are harder to scan at a glance and break the visual consistency the app has otherwise standardized on (prior features `077`–`080` already closed this gap for top-level detail pages and headers). Leaving line-level sub-tabs out means the exact same status string looks styled on one tab and unstyled on another, undermining the audit `080` already did.

**Independent Test**: Open a proposal line's detail page (its Quotes / Sales Orders / Invoices / Shipping Manifests sub-tabs), a quote line's detail page (its Credit Memo / Debit Memo / Invoice / Purchase Order / RMA / RTV / Sales Order / Shipping Manifest / Supplier Bill sub-tabs), and an invoice line's Credit Memo sub-tab — every status column on every one of these renders a colored badge, not plain text.

**Acceptance Scenarios**:

1. **Given** a proposal line detail page's Quotes sub-tab lists related quotes with varying statuses, **When** the tab renders, **Then** each status appears as a colored badge sourced from the shared status badge component, not plain text.
2. **Given** a quote line detail page's Credit Memo Lines sub-tab, **When** displayed, **Then** the status column renders a colored badge whose color matches the color that same status value already shows elsewhere in the app (e.g., on the parent quote's own detail page).
3. **Given** an invoice line detail page's Credit Memo sub-tab, **When** displayed, **Then** the status column renders a colored badge instead of raw text.
4. **Given** a status value that a sub-tab already rendered as a colored badge before this change, **When** the same record is viewed after this change, **Then** it renders with the identical color (no regression).

---

### User Story 2 - Closed inventory of every `lines/[lineid]` folder (Priority: P2)

As the person maintaining this app, I want a definitive, written classification of every file under every module's `lines/[lineid]` folder (orders, proposals, quotes, invoices, purchase-orders, supplier-bills, shipments) — compliant, needs-fix, or not-applicable — so no gap of this kind can silently persist the way the plain-text sub-tabs did before this audit.

**Why this priority**: This request specifically calls out `lines/[lineid]` as an area to double-check, distinct from the broader page-level sweep prior features already completed. Without a closed inventory, "checked" is just a claim, not a verified fact.

**Independent Test**: A written inventory lists every file under each module's `lines/[lineid]` folder with its classification; this can be verified by reading the inventory alone, independent of whether any fix has landed yet.

**Acceptance Scenarios**:

1. **Given** the full set of `lines/[lineid]` folders across every module, **When** the audit completes, **Then** every file in each folder has exactly one classification (compliant / needs-fix / not-applicable) with a stated reason.
2. **Given** a file classified as not-applicable, **When** its reason is reviewed, **Then** the reason is verifiable (e.g., "no status column is rendered in this file").

---

### User Story 3 - No regression to already-compliant line-level badges (Priority: P3)

As a user of the pages `080-status-badge-audit` already migrated inside `lines/[lineid]` folders (e.g., a purchase order line's Debit Memo / RTV / Supplier Bill sub-tabs, a proposal line's Returns sub-tab), I continue to see the exact same badge shapes and colors after this feature ships.

**Why this priority**: Lower risk than the primary fix, but must be explicitly verified rather than assumed, since this feature touches sibling files in the same folders.

**Independent Test**: Compare each already-compliant file's rendered badges before and after this feature ships; no visual difference.

**Acceptance Scenarios**:

1. **Given** a file already importing the shared status badge component before this feature, **When** this feature ships, **Then** that file's code and rendered output are unchanged.

---

### Edge Cases

- What happens when a status value found in a `lines/[lineid]` sub-tab isn't yet recognized by the shared status badge component's color groups? It must be triaged and placed into the correct existing color group (matching the same status's color elsewhere in the app), not left to fall through to an unreviewed default.
- What happens on a sub-tab where the status column is empty or missing for a given row? The badge component's existing empty-state handling applies — no crash, no unstyled fallback.
- What about secondary, non-primary status-like columns (e.g., a shipment's tracking status, an invoice line's invoice sub-status) that are separate from the record's main status field? These remain out of scope for this feature — see Assumptions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render the primary status value of every related-record row inside every `lines/[lineid]` datatable/sub-tab (Fulfillments, Purchases, Supplier Bills, RMAs, RTVs, Credit Memos, Debit Memos, related Quotes, Sales Orders, Invoices, Shipping Manifests) as a colored badge sourced from `components/ui/StatusBadge.tsx`, not as unstyled plain text.
- **FR-002**: System MUST NOT contain a second, duplicate status-to-color mapping in any `lines/[lineid]` file — every fixed file imports the shared badge component exclusively.
- **FR-003**: System MUST preserve the exact badge color already shown for every status value that already rendered via the shared component before this feature (zero-regression for already-compliant files, per User Story 3).
- **FR-004**: When a status value encountered in a `lines/[lineid]` datatable has no existing color group in the shared component, System MUST place it into the correct existing color group (matching that status's color elsewhere in the app) rather than leaving it on an unreviewed default color.
- **FR-005**: System MUST produce a complete, closed inventory covering every file under every module's `lines/[lineid]` folder (orders, proposals, quotes, invoices, purchase-orders, supplier-bills, shipments), each classified as compliant, needs-fix, or not-applicable with a stated reason.
- **FR-006**: System MUST match the badge shape/size convention (compact / pill / bordered) already used elsewhere within that same module's line detail page, so a fixed sub-tab's badges look consistent with its siblings.
- **FR-007**: Secondary, non-primary status-like columns (tracking sub-status, invoice sub-status, etc.) that do not duplicate the shared component's own color logic are explicitly out of scope and MUST NOT be modified by this feature.

### Key Entities

- **Line Detail Sub-Tab (Datatable)**: A table rendered within a module's `lines/[lineid]` page that lists related records (e.g., Quotes, Purchases, RMAs, Credit Memos) where each row carries its own status field.
- **Status Badge**: The single shared presentational component (`components/ui/StatusBadge.tsx`) that maps a status string to a consistent color and shape.
- **Status Value**: The raw status string sourced from Salesforce data (e.g., "Draft", "Delivered", "Submitted") that a badge renders.
- **Compliance Classification**: The audit outcome for a given file — compliant (already uses the shared badge), needs-fix (renders status as plain text or local duplicate logic), or not-applicable (no status column present).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of `lines/[lineid]` datatables that display a primary record status render it via the shared status badge component — zero remaining plain-text or duplicate-local-color status renderings, confirmed by a full-repo audit.
- **SC-002**: Zero visual color regressions — every status that already rendered as a badge before this feature keeps its exact color afterward.
- **SC-003**: Users can visually distinguish a related record's status at a glance on every line-detail sub-tab, consistent with the rest of the app (no sub-tab is the "odd one out" showing plain text).
- **SC-004**: The written audit inventory accounts for 100% of files across every module's `lines/[lineid]` folder — none left unclassified.

## Assumptions

- Only the primary/generic record-status column (the one carrying the same vocabulary already handled by the shared component — Draft, Submitted, Approved, Shipped, Delivered, etc.) is in scope. Secondary tracking/invoice sub-status columns that render separately from the primary status remain plain text, consistent with existing precedent already established elsewhere in the app.
- `components/ui/StatusBadge.tsx` is the single existing shared component referenced by the user's request; this feature continues and closes the consolidation that prior features (`077`–`080`) already started, rather than proposing a new component.
- Files under `lines/[lineid]` folders that display no status column at all (e.g., taxes, files, serial-number sub-tabs) are out of scope.
- This feature changes presentation only — the underlying status values fetched from Salesforce are unchanged.
- Scope is limited to `lines/[lineid]` folders across all modules, as explicitly called out in the request; page-level (non-line) status rendering was already covered by the prior `080-status-badge-audit` effort and is not re-audited here.

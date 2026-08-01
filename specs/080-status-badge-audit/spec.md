# Feature Specification: Status Badge Compliance Audit

**Feature Branch**: `080-status-badge-audit`

**Created**: 2026-08-01

**Status**: Draft

**Input**: User description: "check all tabs tables status is status.tsx or using page statusbadge function"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Full compliance inventory (Priority: P1)

As someone maintaining the WOVN portal, I want a definitive, page-by-page inventory of every tab and table that displays a record-status indicator, showing whether it renders that status through the shared `components/ui/StatusBadge.tsx` component or through its own separate, locally-defined color logic, so that every remaining inconsistency is known rather than assumed fixed.

**Why this priority**: The `079-shared-status-badge` feature consolidated 34 files, but was scoped to files already known at planning time. Spot-checking during unrelated sync work has already turned up files outside that list — `PODebitMemoLinesTab.tsx`, `POSupplierBillLinesTable.tsx`, and `PORtvLinesTab.tsx` (all under `app/purchase-orders/[id]/lines/[lineid]/components/`) each still define their own local `const StatusBadge` with the exact same generic status vocabulary the shared component already covers, and `app/supplier-bills/page.tsx` defines its own local `RemittanceBadge` duplicating the one the shared file already exports. Without a full inventory, there's no way to know how many more exist.

**Independent Test**: Can be delivered as a written inventory (which files are compliant, which duplicate logic, which are intentional exceptions) without changing any code, and is immediately useful on its own for scoping follow-up fixes.

**Acceptance Scenarios**:

1. **Given** the full set of files under `app/` that render a colored status/badge tied to a record's lifecycle status, **When** the audit is run, **Then** every one of them is classified as either "imports the shared `StatusBadge`/`RemittanceBadge`", "defines its own duplicate logic for the same status vocabulary", or "renders a genuinely distinct status vocabulary (e.g. payment/remittance/collection status)".
2. **Given** a file that duplicates the shared component's generic status vocabulary, **When** it is added to the inventory, **Then** its exact status list and color mappings are recorded so any conflicts with the shared component can be identified.

---

### User Story 2 - Migrate confirmed duplicates (Priority: P2)

As a developer, I want every tab/table confirmed to be duplicating the shared component's generic record-status logic to import `components/ui/StatusBadge.tsx` instead, so a given status string always renders the same color no matter which page shows it.

**Why this priority**: This is the actual fix — inventory alone doesn't close the gap. It depends on User Story 1 to know exactly which files qualify.

**Independent Test**: Each confirmed-duplicate file can be migrated and typechecked independently; visually verify the page still shows the same badge shape/position with the same (or explicitly-resolved) colors.

**Acceptance Scenarios**:

1. **Given** a file with a local status-to-color function matching the shared component's vocabulary, **When** it is migrated, **Then** it imports and renders the shared `StatusBadge` (with whatever `variant` matches its current shape) instead of its own function, and every status string that wasn't in conflict renders the exact same color as before.
2. **Given** `app/supplier-bills/page.tsx`'s local `RemittanceBadge`, **When** it is migrated, **Then** the page imports `RemittanceBadge` from `components/ui/StatusBadge.tsx` instead of redefining it, with identical rendered output.
3. **Given** the migration touches only badge-rendering logic, **When** reviewed, **Then** no data-fetching, status-computation, or unrelated JSX changed in the same file.

---

### User Story 3 - Resolve newly discovered color conflicts (Priority: P3)

As a developer, I want any status string that maps to a genuinely different color across two or more implementations (for example, `ProposalDetails.tsx` maps `"Lead"` to a lighter green shade than the shared component's existing `"lead"` mapping) resolved the same way `077` and `079` resolved their conflicts, so the fix doesn't silently change colors without a documented reason.

**Why this priority**: Lower priority than getting everything onto one component, but still required before closing out the audit — an unresolved, undocumented color change is exactly the kind of regression `079`'s zero-regression requirement was meant to prevent.

**Independent Test**: For each conflict found, the resolution (which color wins and why) can be reviewed and confirmed independently of the rest of the migration.

**Acceptance Scenarios**:

1. **Given** a status string with conflicting color mappings across implementations, **When** resolved, **Then** the winning color and the list of pages whose displayed color changes as a result are both explicitly documented.
2. **Given** a status string with no conflict across any implementation, **When** migrated, **Then** its color is unchanged.

---

### Edge Cases

- What happens when a colored indicator represents a different kind of state entirely — e.g., compliance-certificate validity, product/inventory availability toggles — rather than a record's lifecycle status? These are out of scope; the audit only covers status indicators tied to order/proposal/quote/invoice/shipment/purchase-order/supplier-bill lifecycle state.
- What happens when a badge represents a genuinely separate status vocabulary that's already been deliberately kept apart from the generic one (payment/remittance/collection status, matching the existing `RemittanceBadge` precedent, and possibly `app/invoices/page.tsx`'s local `CollectionStatusBadge` and `app/invoices/[id]/components/InvoicePayments.tsx`'s payment-status coloring)? These must be explicitly recorded as intentional exceptions, not silently skipped or force-merged into the generic vocabulary.
- What happens when a status color is rendered inline (a raw `<span className={...}>` driven by a local `getStatusColor`/`getStyles` function) rather than through a named "Badge" component or function? The audit must still catch these — matching by rendered behavior, not by a literal name match on "StatusBadge".
- What happens to the four sibling deployment folders (`ClientPartnerPortal-main`, `-prod`, `-dev`, `woven_projects-claude`) already tracked for status-badge parity? Any fix made here must be checked against them the same way `079`'s proposal-line fix was, to avoid reintroducing drift.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The audit MUST enumerate every tab/table page or component under `app/` that renders a colored status indicator tied to a Salesforce record's (or its line's) lifecycle status, regardless of whether that indicator is implemented as a named component/function or as inline JSX.
- **FR-002**: For each indicator found, the audit MUST record whether it uses the shared `StatusBadge`/`RemittanceBadge` from `components/ui/StatusBadge.tsx`, or defines/duplicates its own local status-to-color logic.
- **FR-003**: Any indicator found duplicating the shared component's generic record-status vocabulary via local logic MUST be migrated to import and render the shared `StatusBadge` instead, preserving that file's existing badge shape (via the existing `variant` prop) and preserving the exact current color for every status string that is not in conflict with the shared mapping.
- **FR-004**: Indicators found to represent a genuinely distinct, already-established status vocabulary (payment/remittance/collection status, per the existing `RemittanceBadge` precedent) MAY remain separate from the generic `StatusBadge`, but MUST be explicitly listed in the audit as a deliberate exception rather than omitted.
- **FR-005**: Any status string found mapped to a materially different color across two or more implementations MUST be resolved using the same majority-wins precedent already established in `077-line-status-parity` and `079-shared-status-badge`, with the resolution and the list of pages whose color changes as a result both explicitly documented.
- **FR-006**: Migrating a confirmed-duplicate file MUST NOT change that file's data-fetching, status-computation, or any non-badge JSX/logic — the change is limited to how the status is rendered.
- **FR-007**: Once fixes land in `woven_projects-main`, they MUST be checked for parity against the four tracked sibling deployment folders (`ClientPartnerPortal-main`, `ClientPartnerPortal-prod`, `ClientPartnerPortal-dev`, `woven_projects-claude`), following the same diff-before-copy, typecheck, and ask-before-commit/push process already used for prior status-badge fixes.

### Key Entities

- **Tab/Table Component**: A page or sub-component under `app/` that renders a record's (or line's) status as a colored badge, pill, or span; may import the shared component or define its own logic.
- **Status Badge Implementation**: The specific function or inline logic — shared or local — responsible for mapping a status string to a color class.
- **Status Vocabulary**: The set of distinct status strings a given implementation recognizes; may be the generic record-lifecycle vocabulary already centralized in the shared component, or a genuinely separate domain vocabulary (e.g., payment/remittance status).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of tabs/tables under `app/` that display a record-status indicator are accounted for in the audit inventory, each classified as compliant, needs-migration, or intentional exception.
- **SC-002**: Every file classified as needs-migration is migrated to the shared component with zero visual regression for every status string that was not part of a documented conflict.
- **SC-003**: Every status-color conflict discovered during the audit is resolved and documented, with the affected pages explicitly listed.
- **SC-004**: After migration, a given status string renders an identical color across every tab/table that displays it, and across all four tracked sibling deployment environments.

## Assumptions

- "Tab/table" in scope means any page or component under `app/` that renders a colored status indicator tied to an order, proposal, quote, invoice, shipment, purchase order, or supplier bill (or their lines) lifecycle status — not unrelated colored indicators like compliance-certificate validity or inventory-availability toggles, which represent a different kind of state entirely and are out of scope.
- Badges representing payment/remittance/collection status are treated as an intentionally separate vocabulary per the existing `RemittanceBadge` precedent, unless research during planning determines a specific instance is actually a straggler duplicating the generic record-status concept rather than a genuinely distinct one.
- No new shared component is introduced. Any confirmed duplicate is migrated onto the existing `components/ui/StatusBadge.tsx`, consistent with `079-shared-status-badge`'s approach of extending rather than creating a second "shared" component.
- Fixes are implemented first in `woven_projects-main`; propagation to the four sibling deployment folders follows the same process already established and recorded in project memory for prior status-badge work — diff before copying, typecheck after, and only commit/push when explicitly asked.

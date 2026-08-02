# Feature Specification: Invoice Payments Tab Status Badge Color Fix

**Feature Branch**: `082-invoice-payments-status-fix` (no dedicated feature branch — no `before_specify` git hook configured for this repo, consistent with `080`/`081`)

**Created**: 2026-08-02

**Status**: Draft

**Input**: User description: "all datatables status and all status should come from one file components/ui/statusbadge.tsx. but in app/invoices/[id]/page.tsx file in payments tab in approved credit memo sub tab draft status showing different status color and also in app/suppiler-bill/[id]/page.tsx check the same payments tab in applied credit memo sub tab"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Correct status color on the Invoice Payments tab's Applied Credit Payments sub-tab (Priority: P1)

As a Client, Partner, or Client-Partner user viewing an invoice's detail page Payments tab, when I look at the Applied Credit Payments sub-tab, a row with status "Draft" shows the same blue color that "Draft" shows everywhere else in the app, instead of the incorrect gray it shows today.

**Why this priority**: This is the exact bug the user reported — a visibly wrong, inconsistent color for a status value that already has a correct, established color elsewhere in the app. It directly undermines the "all statuses come from one file" goal this and prior features (`077`–`081`) have been working toward.

**Independent Test**: Open an invoice detail page's Payments tab, switch to the Applied Credit Payments sub-tab, and find (or note the expected result for) a row with status "Draft" — it renders blue, matching the same status's color on the invoice's own header badge or any other already-compliant page.

**Acceptance Scenarios**:

1. **Given** the Invoice Payments tab's Applied Credit Payments sub-tab has a row with status "Draft", **When** the tab renders, **Then** the status badge is blue, matching "Draft" everywhere else in the app.
2. **Given** a row with status "Paid" or "Posted" (already correctly green today), **When** the tab renders after this fix, **Then** it remains green — no regression for statuses that were already correct.

---

### User Story 2 - Close the same underlying defect in the sibling Receive Payments sub-tab (Priority: P2)

As a maintainer, I want the Receive Payments sub-tab (which shares the exact same status field and the exact same local color logic as Applied Credit Payments, within the same file) fixed at the same time, so the identical latent bug — which simply hasn't been triggered by a "Draft"-status Receive Payment yet — doesn't resurface later.

**Why this priority**: Lower visibility than User Story 1 (no user has reported it yet), but it is the same code, the same field, and the same defect — fixing one sub-tab and leaving its sibling on the buggy local function would be an incomplete fix.

**Independent Test**: Open the Receive Payments sub-tab and confirm every status renders via the shared badge component with no local color-mapping code left in the file.

**Acceptance Scenarios**:

1. **Given** the Receive Payments sub-tab, **When** it renders any status value already covered by the shared component's color groups (e.g., "Posted" → green, "Failed" → red), **Then** the color is unchanged from today.
2. **Given** the file after this fix, **When** the codebase is searched for a local status-to-color mapping function in this file, **Then** none remains — both sub-tabs use the shared component exclusively.

---

### User Story 3 - Confirm the Supplier Bills Payments tab is unaffected (Priority: P3)

As the user who asked me to check it, I want explicit confirmation of whether the Supplier Bills detail page's Payments tab (Bill Payments and Applied Debit Memos sub-tabs — the supplier-bill analog of Applied Credit Payments) has the same bug, so the check isn't left as an open question.

**Why this priority**: Explicitly requested by the user as part of this feature, but investigation shows it is a verification, not a fix — the lowest-risk item here.

**Independent Test**: Open the Supplier Bills detail page's Payments tab and confirm every status column in both sub-tabs already renders via the shared badge component.

**Acceptance Scenarios**:

1. **Given** the Supplier Bills Payments tab's two sub-tabs, **When** inspected, **Then** each is confirmed to already use the shared status badge component with no local color-mapping code — or, if a gap is found, it is fixed to match.

---

### Edge Cases

- What happens to a status value in either Invoice Payments sub-tab that isn't yet recognized by the shared component's color groups (e.g., a payment-transaction state like "Scheduled" or "Processing" that has no exact match in the shared vocabulary today)? It must be triaged into the correct existing color group (matching the same status's color elsewhere in the app if a match exists) during implementation — not assumed resolved by this spec, and not left on an unreviewed default.
- What happens to a status value that today coincidentally gets the "right" color from the local function only because two different color rules happen to agree (e.g., "processing" locally maps to blue, while the shared component's "in progress" maps to yellow)? Any such disagreement must be resolved in favor of the shared component's existing color, per the same precedent-wins rule `079`–`081` already established.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render every status value in the Invoice detail page's Payments tab — both the Receive Payments and Applied Credit Payments sub-tabs — via the shared status badge component (`components/ui/StatusBadge.tsx`), not via any local color-mapping function.
- **FR-002**: "Draft" status in the Applied Credit Payments sub-tab MUST render with the exact same color "Draft" already shows everywhere else in the app.
- **FR-003**: Every status value that already rendered with the correct color under the old local logic (e.g., "Paid" → green) MUST keep that exact color after this fix (zero regression).
- **FR-004**: The local status-to-color function in the Invoice Payments tab's file MUST be removed entirely once both sub-tabs are migrated — no duplicate implementation may remain.
- **FR-005**: The Supplier Bills detail page's Payments tab (both sub-tabs) MUST be verified against the same standard; if it is already compliant, no code changes are made there beyond confirmation; if a gap is found, it MUST be fixed to match.
- **FR-006**: Any status value encountered during implementation that has no existing color-group match in the shared component MUST be placed into the correct existing group (matching that value's color elsewhere in the app) rather than left on an unreviewed default, consistent with the precedent established in prior status-badge features.

### Key Entities

- **Receive Payment**: A payment record shown in the Invoice Payments tab's first sub-tab; carries its own status field.
- **Applied Credit Payment / Applied Credit Memo**: A credit-memo-application record shown in the Invoice Payments tab's second sub-tab; carries its own status field — this is where the reported "Draft" color bug lives.
- **Bill Payment / Applied Debit Memo**: The Supplier Bills equivalents of the two entities above, shown in the Supplier Bills Payments tab.
- **Status Badge**: The single shared presentational component (`components/ui/StatusBadge.tsx`) that all of the above should render their status through.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of status values in the Invoice Payments tab (both sub-tabs) render via the shared status badge component — zero remaining local color-mapping code, confirmed by code inspection.
- **SC-002**: The "Draft" status in the Applied Credit Payments sub-tab visually matches the color "Draft" shows on every other already-compliant page in the app.
- **SC-003**: Zero visual color regressions — every status that already rendered with a correct color before this fix keeps that exact color afterward.
- **SC-004**: The Supplier Bills Payments tab is explicitly confirmed compliant (or fixed if a gap is found) — not left as an open question.

## Assumptions

- Both the Receive Payments and Applied Credit Payments sub-tabs read the same generic Salesforce `Status__c` field (confirmed by inspecting both entities' type definitions) — there is no genuine distinct "payment status" vocabulary here, unlike the confirmed-separate `RemittanceBadge`/`CollectionStatusBadge` cases documented in `080`. This corrects `080`'s classification of this specific file, which had treated it as an intentional out-of-scope exception based on the *values* its local function happened to color correctly, not on the underlying field.
- The Supplier Bills Payments tab was found (via direct code inspection) to already import and use the shared status badge component for both its sub-tabs — this feature treats that as the expected end state to confirm, not a gap to close, unless implementation finds otherwise.
- This is a presentation-only fix — no change to what status values are fetched from Salesforce or how they are computed.
- Scope is limited to the two Payments tabs named above; no other tab or page is re-audited by this feature (that broader audit was already covered by `080`/`081`).

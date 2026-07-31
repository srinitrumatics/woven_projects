# Feature Specification: Shared Status Badge Component

**Feature Branch**: `079-shared-status-badge`

**Created**: 2026-07-31

**Status**: Draft

**Input**: User description: "gather all status in one function as statusbadge status in all pages."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - One consistent status badge across the app (Priority: P1)

A user browsing any list page, detail page, or related-records tab across Orders, Proposals, Quotes, Purchase Orders, Supplier Bills, Invoices, Shipments, and Admin Locations sees the exact same visual treatment for a status of a given meaning, instead of the current situation where nearly every page independently defines its own status-to-color logic — with some pages coloring the very same status word differently from others.

**Why this priority**: This is the entire point of the request — a single, consistent status indicator everywhere, which is also what makes every other story below possible.

**Independent Test**: Pick any five pages that currently show a status badge (e.g., Orders list, Quote Sales Orders sub-tab, Purchase Orders list, Supplier Bills list, Shipments list) and confirm each one now renders its badges using the one shared status indicator, with identical shape/style, and with colors that follow the single, agreed-upon status-to-color mapping.

**Acceptance Scenarios**:

1. **Given** any page in the app that displays a record's status, **When** the page renders, **Then** the status is shown using the same single shared status indicator (same shape, sizing, and color logic) used everywhere else.
2. **Given** two different pages that both show a record with the status "Draft" (or any other status shared by multiple areas of the app), **When** both pages render, **Then** both show that status in the identical color.
3. **Given** a status value that no page currently recognizes, **When** it is displayed, **Then** it falls back to a clear, neutral (gray) style rather than breaking or appearing unstyled.

---

### User Story 2 - Fixing a status update in one place fixes it everywhere (Priority: P2)

A developer who needs to add a new status value, correct a wrong color, or adjust the badge's visual style only has to make that change in one place, and it takes effect on every page that shows a status.

**Why this priority**: This is the underlying maintenance benefit that motivates consolidating "all status in one function" — without it, the same problem (a missed page, an inconsistent fix) will keep recurring, which is exactly how the app arrived at today's fragmented state.

**Independent Test**: Make a single change to the shared status logic (e.g., add a new status value) and confirm it appears correctly, without further changes, on every page that uses it.

**Acceptance Scenarios**:

1. **Given** the shared status indicator is updated to add support for a new status value, **When** any page that displays that status is viewed, **Then** the new status renders correctly without requiring a change to that page's own code.
2. **Given** the existing, page-specific status-badge implementations are removed and replaced by the shared one, **When** the app is reviewed, **Then** no page still contains its own separate copy of this logic.

---

### User Story 3 - No visual regressions during the switch to a shared component (Priority: P3)

A user who is used to seeing a particular status shown a particular way on a particular page does not experience an unexpected, unexplained visual change purely as a side effect of this internal consolidation.

**Why this priority**: Consolidating dozens of independently-written implementations risks changing how some existing status is colored on some page, purely as a side effect of unifying the logic — this story exists to make sure that risk is deliberately managed rather than accidental.

**Independent Test**: Compare every status value's rendered color, before and after the change, across all affected pages; any page where a status's color changes as a result of this work must be an intentional, reviewed decision (see Assumptions), not an accidental one.

**Acceptance Scenarios**:

1. **Given** a status value that was colored the same way on every page before this change, **When** the shared indicator is introduced, **Then** that status continues to render in that same color everywhere.
2. **Given** a status value that was colored inconsistently across different pages before this change (the same word shown in different colors depending on which page you were on), **When** the shared indicator is introduced, **Then** that status now renders in one single, deliberately-chosen color across all of those pages, and that choice is documented.

### Edge Cases

- What happens to a status value that is specific to one business area (e.g., invoice payment states like "Paid," "Partial," or "Overdue," which don't apply to a generic order/quote/proposal line) once everything is gathered into one function? It must still be recognized and correctly colored — the shared function's status list is a superset covering every status value seen anywhere in the app today, not a lowest-common-denominator subset.
- What happens if a page currently applies a slightly different badge shape/border/font-weight than others (a handful of pages use a bordered box instead of a fully rounded pill, or bold vs. medium text)? These minor structural variations are preserved as-is; only the status→color decision logic is unified (see Assumptions).
- What happens on pages where the same underlying data can show a status that isn't in the recognized list at all (e.g., a new status value added in the source system later)? It must fall back to the same neutral/gray default used elsewhere, never breaking the page.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: There MUST be exactly one shared function/component responsible for deciding a status badge's color and rendering its markup, used by every page and component in the app that currently displays a status badge.
- **FR-002**: Every page and component that currently defines its own local status-badge logic MUST be updated to use the shared one instead, with no independent copies remaining.
- **FR-003**: The shared status indicator's recognized status list MUST be a superset of every distinct status value currently handled anywhere in the app (across Orders, Proposals, Quotes, Purchase Orders, Supplier Bills, Invoices, Shipments, and Admin Locations, including all of their list pages, detail pages, line-detail pages, and related-record sub-tabs).
- **FR-004**: For any status value that was colored consistently everywhere it appeared before this change, the shared indicator MUST preserve that same color.
- **FR-005**: For any status value that was colored inconsistently across different pages before this change, the shared indicator MUST resolve it to one single color, chosen as whichever color that status currently has in the largest number of existing usages ("majority wins"), per the resolution table below.

**Conflict resolution table** (majority wins; counts are exact usages found across the 33 current usage sites):

| Status | Resolved color | Vote count | Pages whose color will change |
|--------|-----------------|------------|-------------------------------|
| Draft | blue | 24 blue vs. 2 gray vs. 2 yellow | `proposals/page.tsx`, `proposals/[id]/components/PurchasesTab.tsx` (gray→blue); `shipments/page.tsx`, `shipments/[id]/components/ShipmentLinesTab.tsx` (yellow→blue) |
| Cancelled | red | 19 red vs. 2 orange | `invoices/page.tsx`, `invoices/[id]/lines/[lineid]/page.tsx` (orange→red) |
| Approved | green | 25 green vs. 2 emerald | `invoices/page.tsx`, `invoices/[id]/lines/[lineid]/page.tsx` (emerald→green; a very minor shade shift) |
| Closed | red | 10 red vs. 5 gray vs. 1 blue | `quotes/[id]/components/QuoteCreditMemoSubTab.tsx`, `QuoteInvoicesSubTab.tsx`, `QuoteRMASubTab.tsx`, `QuoteSalesOrdersSubTab.tsx`, `QuoteShippingManifestsSubTab.tsx` (gray→red); `proposals/[id]/components/OrdersTab.tsx` (blue→red) |
| Shipped | green | 10 green vs. 5 blue | `quotes/[id]/components/QuoteCreditMemoSubTab.tsx`, `QuoteInvoicesSubTab.tsx`, `QuoteRMASubTab.tsx`, `QuoteSalesOrdersSubTab.tsx`, `QuoteShippingManifestsSubTab.tsx` (blue→green) |
| Awarded | green | 5 green vs. 3 rose | `proposals/page.tsx`, `proposals/[id]/components/FulfillmentsTab.tsx`, `proposals/[id]/components/ReturnsTab.tsx` (rose→green) |
| Submitted | blue | 2 blue vs. 1 yellow | `orders/page.tsx` (yellow→blue) |
| Acknowledged | green | 1 vs. 1 — genuine tie, no majority. Resolved to green by consistency with "Approved" (its closest semantic sibling, 25-2 green), since both represent a positive-confirmation state rather than an in-progress one. | `proposals/[id]/components/PurchasesTab.tsx` (blue→green) |
- **FR-006**: Any status value not recognized by the shared indicator (including values not currently seen anywhere in the app) MUST render with a clear, neutral (gray) fallback style rather than an error or unstyled output.
- **FR-007**: The shared indicator MUST support the minor structural/visual differences already present across pages today (e.g., fully-rounded pill vs. bordered box, differing font weight/size) without requiring every page to look pixel-identical, so long as the underlying status→color decision is the single shared source of truth.

### Key Entities *(include if feature involves data)*

- **Status Badge**: The single, shared visual indicator (text + color) used to represent any record's or line's current status, replacing the many separate, page-specific implementations that exist today.
- **Status Value**: Any of the distinct status strings currently shown across the app (e.g., Draft, Pending, Approved, Cancelled, Shipped, Paid, Overdue, and dozens of others specific to particular business objects), each mapped to exactly one color under the shared indicator.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of pages and components that display a status badge use the single shared status indicator — zero independent, page-local status-color implementations remain in the codebase.
- **SC-002**: 100% of status values currently shown anywhere in the app continue to display correctly (readable text, a defined color, no blank/broken badges) after the change.
- **SC-003**: For every status value that was already colored consistently across all its current usages, 0% of those usages show a different color after the change.
- **SC-004**: Every status value whose color changes as a result of resolving an inconsistency is captured in a documented, reviewed list — 0% of such changes are undocumented or accidental.

## Assumptions

- **Scope**: "All pages" is interpreted as its full, literal scope — every list page, detail page, line-detail page, and related-record sub-tab across Orders, Proposals, Quotes, Purchase Orders, Supplier Bills, Invoices, Shipments, and Admin Locations that currently renders a status badge (33 usage sites, spanning 19 distinct existing implementations, found by direct codebase review), not only the six line-detail pages touched by the two prior, narrower status-placement fixes.
- **Structural style differences preserved**: A handful of pages already differ slightly in badge shape (rounded-full pill vs. a bordered box) and text weight/size from the majority pattern. This feature unifies the status→color *decision* logic into one place; it does not force every page's badge to become pixel-identical in shape unless doing so is trivial and low-risk.
- **Invoice's distinct status vocabulary is preserved, not diluted**: Invoice Line pages use a payment-lifecycle-specific vocabulary (Paid, Partial, Sent, Viewed, Overdue, Settled, etc.) that is meaningfully different from the generic Draft/Pending/Approved/Cancelled vocabulary used elsewhere. The shared function is a superset that recognizes all of these values correctly — invoice-specific statuses are not collapsed into the generic scheme, and vice versa.
- **No changes to what status a record has, or how/when it changes** — this feature only unifies how an existing status value is *displayed*, not how it is set, computed, or transitioned.

# Phase 0 Research: Orders Landing Page — Required Corrections

## Context

The feature spec (FR-001 through FR-012) prescribes an exact column list, header behavior, hyperlink rules, and default sort/pagination for the Orders landing page. Before planning implementation work, the current state of `app/orders/page.tsx` was audited to determine what, if anything, is missing or incorrect.

## Finding: All requirements are already satisfied

No `[NEEDS CLARIFICATION]` markers exist in the spec, and no open technology or pattern questions remain — this feature's only "unknown" was the current-state gap, which the audit below resolves to zero gap.

### Decision: Treat this feature as a verification/lock-in pass, not a corrective build

**Rationale**: Direct inspection of `app/orders/page.tsx` (and confirmation via git history) shows the page already matches spec 032 in full. It was corrected once already under prior spec 021 (commit `0e9e85b`, "feat: correct table columns, labels, and hyperlinks across proposal, order, and line-detail pages", 2026-07-01). Re-implementing already-correct code would be wasted work and risks introducing regressions; the appropriate action is to verify against the spec's acceptance scenarios and leave the code unchanged unless verification finds drift.

**Alternatives considered**: Re-writing the column/mapping logic from scratch to "guarantee" compliance was rejected — it would touch working code with no functional benefit and violates Constitution Principle V (Simplicity & Phase-Driven Scope: no speculative rework).

### Audit detail (per FR)

| FR | Requirement | Current state in `app/orders/page.tsx` |
|----|-------------|------------------------------------------|
| FR-001/002 | Full-text, single-line, no-wrap headers; cells may ellipsis | Header cells render with `truncate={false}` (whitespace-nowrap); body cells use `truncate` class |
| FR-003 | First column (Customer Order #) sticky | Header uses `sticky left-0 z-20`; cell uses `sticky left-0 z-10` |
| FR-004 | Pagination, 10 rows/page | `<Pagination>` component wired with `ITEMS_PER_PAGE = 10` |
| FR-005 | Default sort: Record ID (Customer Order #) DESC | `useSortableData(filteredAndSearchedOrders, { key: 'name', direction: 'desc' })` — `name` is the order's own record name |
| FR-006 | Null/empty → "-" | `displayCell()`/equivalent null-dash convention applied portal-wide (see spec 015) |
| FR-007 | Exact 17-column order/labels | Verified against the column render block (lines ~869-890): Customer Order #, Status, Proposal #, Proposal Name, Customer PO, Bill to Account, Bill to Location, Bill to Contact, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Request Date, Create Date, Action — matches exactly |
| FR-008 | Proposal # (link) distinct from Proposal Name (plain text) | `proposal_id` drives the `/proposals/{id}` link (gated by account type); `proposal_name` is shown as the link's visible text in the Proposal # cell and repeated as plain text in the Proposal Name cell |
| FR-009 | Six distinct Bill To/Ship To fields | `uiOrders` maps `billToAccountName ← Bill_to_Account_Name`, `billToLocationName ← Authorized_Bill_To_Location_Name`, `billToContactName ← Bill_to_Contact_Name`, and the three Ship To equivalents — six independent source fields, no duplication |
| FR-010 | Drop Ship Yes/No indicator | `dropShip ← Drop_Ship__c` rendered as a Yes/No badge |
| FR-011 | Create Date distinct from Request Date | `requestedDate ← Request_Date__c`, `createdDate ← formatDate(Create_Date__c, 'numeric-dash')` — two independent fields |
| FR-012 | Action column retained | Existing edit/clone/delete controls unchanged |

### Data flow (for reference)

`app/api/salesforce/orders/route.ts` proxies to the Salesforce Apex REST endpoint `/services/apexrest/gtherp/orders` (no SOQL built client-side). The raw Apex response is mapped to a UI-friendly shape inside the `uiOrders` `useMemo` in `app/orders/page.tsx` (lines 127-149), which the table renders directly.

## Outstanding risk

None identified for launch. The only residual note (documented in the spec's Assumptions) is that "Proposal #" uses the proposal's name as its link label because no separate proposal-number field exists in the underlying Salesforce data — this is an intentional, already-accepted design carried over from spec 021, not a defect.

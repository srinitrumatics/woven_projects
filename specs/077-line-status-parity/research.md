# Phase 0 Research: Line Status Indicator Parity

## 1. Root cause per page

**Decision**: Treat each page as an independent, differently-shaped fix rather than one uniform change.

**Rationale**: Direct inspection of all four line-detail pages shows three distinct current states:

| Page | Status data fetched? | Status badge rendered? | Gap |
|---|---|---|---|
| Supplier Bill Line (reference) | Yes (`item.Status__c`) | Yes (`<StatusBadge status={line.status} />` next to "Line X of Y") | None — this is the pattern to match |
| Order Line | No — `OrderLineItem` interface has no status field at all; only the parent order's own `orderStatus` is passed into `LineHeader` (used only to conditionally show the Edit button) | No | Needs both: fetch/map a line-level status, and add the badge markup |
| Proposal Line | Yes, but broken: `ProposalProductItem.Status_c` (typo — missing one underscore) is read into `status: item.Status_c \|\| ""`, which is always `undefined` at runtime since the actual field is `Status__c` (used correctly everywhere else in the same file for other related objects) | Yes — `<StatusBadge status={product.status} />` already sits next to "Line X of Y" | Needs only the one-line field-name fix; markup is already correct |
| Quote Line | Yes — `status: item.Status__c \|\| "Draft"` is correctly mapped | No — no `StatusBadge` function or usage exists anywhere in this file | Needs only the badge markup added |

**Alternatives considered**: Rewriting all three pages to import a single new shared `StatusBadge` component was considered, but rejected — see §3.

## 2. Will the Order Line data source actually return a status field?

**Decision**: Proceed on the assumption that the upstream Salesforce Apex REST endpoint backing Order Lines (`/services/apexrest/gtherp/orderlines`, proxied by `lib/salesforce-service.ts#getOrderLinesFromSalesforce`) already returns a `Status__c` value per line, and add it to the `OrderLineItem` interface / mapping. Verify this by inspecting the live JSON payload (e.g., temporarily logging `resultdata.data[0]` or checking Network tab) during implementation, before writing any UI code that depends on it.

**Rationale**: `Status__c` is the field name used consistently for the equivalent "line status" concept across every other object this codebase already touches in exactly this kind of page: Quote Line (`item.Status__c`), Proposal Line (intended, if not for the typo), Supplier Bill Line (`item.Status__c`), and multiple related sub-objects inside the Proposal Line page itself (invoices, shipments, purchase orders, credit memos — all `X.Status__c`). This is strong convention-based evidence that the Order Line object exposes the same field. However, this repo has no visibility into the Apex REST controller's field-selection logic (it lives outside this codebase), so this cannot be verified by reading source alone.

**Alternatives considered**:
- *Block this feature on a backend/Apex change*: rejected as premature — the convention evidence is strong enough to attempt the frontend-only fix first.
- *Fetch order-line status via a separate existing endpoint (e.g., the parent order's own status)*: rejected — this would show the parent Order's status, not the specific line's own status, which does not satisfy FR-004 (a line can have a different status than its parent order, exactly as Proposal/Quote/Supplier-Bill lines already do).

**Risk / fallback**: If implementation confirms the field is genuinely absent from the current API response, that is a backend/Apex-side gap outside this repository's scope. In that case, User Story 1 (Orders) should be descoped to a follow-up item requesting the field be added upstream, while User Stories 2 and 3 (Proposals, Quotes — both confirmed to already have the data) proceed unaffected.

## 3. Reuse the existing per-file `StatusBadge` pattern, don't create a shared component

**Decision**: Add a local `StatusBadge` function to the Order Line and Quote Line pages, using the exact same status→color mapping already present (identically) in both the Supplier Bill Line and Proposal Line pages.

**Rationale**: `StatusBadge` is already independently defined in well over a dozen files across this codebase (`app/orders/page.tsx`, `app/proposals/page.tsx`, `app/invoices/[id]/lines/[lineid]/page.tsx`, `app/purchase-orders/[id]/lines/[lineid]/page.tsx`, etc.) — it is an established repo convention to duplicate this small presentational function per file rather than share one component. Matching that convention keeps this change minimal, consistent with the "Simplicity" constitution principle, and avoids a cross-cutting refactor that isn't in scope for this feature.

**Alternatives considered**: Extracting a single shared `<StatusBadge>` component into `components/` was considered — this would reduce duplication, but touches many unrelated files/pages beyond the three in scope, is a larger and riskier change than the spec calls for, and isn't the pattern this codebase currently follows anywhere else. Rejected for this feature; could be proposed separately as its own follow-up cleanup.

## 4. Status vocabulary and colors

**Decision**: Reuse the exact status set and color mapping already implemented (identically, byte-for-byte) in the Supplier Bill Line and Proposal Line `StatusBadge` functions:

- Green: `Approved`, `Awarded`, `Paid`
- Yellow: `Pending`
- Blue: `Draft`
- Red: `Cancelled`, `Closed`
- Gray (default/fallback): any other or missing value

**Rationale**: This is the exact, already-shipped mapping the spec's FR-003 and Assumptions require Order/Proposal/Quote lines to match. It also already satisfies the edge case of unrecognized/missing status values falling back gracefully (gray badge, showing whatever string is present, or nothing if empty — see §5).

**Alternatives considered**: None — matching the existing implementation exactly is the explicit goal (FR-003), not a design decision to make independently.

## 5. Empty/missing status fallback text

**Decision**: For Quote Line and Order Line, follow the same fallback already used for Quote Line's existing (correct) mapping: `status: item.Status__c || "Draft"`. Apply the same `|| "Draft"` fallback to the new Order Line status mapping.

**Rationale**: Satisfies FR-007 (never render blank) using a pattern already proven in this exact codebase (Quote Line's own mapping, and every sibling object in the Proposal Line file). "Draft" is the correct default because the same convention is already used for the equivalent status field on every related object in this system, and Draft is the earliest/least-progressed status in the color mapping (§4) — for the Proposal Line typo fix (User Story 2), the existing `|| ""` fallback should also be changed to `|| "Draft"` to close this same edge case there, matching FR-007 across all three pages consistently.

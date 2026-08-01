# Phase 0 Research: Status Badge Compliance Audit

## 1. Audit methodology — two grep sweeps, every hit individually inspected

**Decision**: Search for local status-color duplicates using two independent patterns, then manually open and classify every single file either pattern returned (not just the ones matching a literal `"StatusBadge"` name):

1. Named local implementations: `grep -rlE "getStyles|getStatusColor|getStatusStyles|statusColor|colorMap|STATUS_COLORS" app components` and `grep -rnE "^\s*(const|function)\s+\w*Badge\b" app`.
2. Inline ternary implementations: `grep -rlE "status === '[A-Z]|\.status === \"[A-Z]"` — this is a structurally different pattern (a chained ternary building a `className` string directly in JSX, no named function at all) that the first sweep cannot see.

**Rationale**: `079-shared-status-badge`'s own research.md documented a near-identical lesson (§8 "Survey methodology gap, found and corrected") — its original regex-based survey missed `ProductsTab.tsx` because it used an object-literal `colorMap` instead of a `switch`. That gap recurred here at a larger scale: the original sweep for the literal string `"StatusBadge"` missed `app/orders/[id]/components/{FulfillmentTab,ReturnsTab}.tsx` because they define a lowercase `const statusBadge` (case-sensitive grep, different casing convention), and missed every inline-ternary file entirely because none of them define a named function at all.

**Alternatives considered**: Trusting the `079` plan's "34 files" list as complete and only checking those files across the four sibling folders (i.e., a sync-parity check, not a compliance audit) — rejected, because that's exactly the check already performed for the `077`/`078`/`079` re-verifications in prior sessions, and the user's request here was explicitly broader ("check all tabs tables"), not "check the already-known list is in sync."

## 2. Classification of every file found

Every file returned by either sweep was opened and classified into one of four buckets. Full per-file detail (variant, exact conflicts) is in `data-model.md`.

**Needs migration (14 files)** — duplicates the shared component's generic record-status vocabulary:

| File | Pattern found | Shape (variant) |
|---|---|---|
| `app/purchase-orders/[id]/lines/[lineid]/components/PODebitMemoLinesTab.tsx` | local `const StatusBadge` | bordered |
| `app/purchase-orders/[id]/lines/[lineid]/components/POSupplierBillLinesTable.tsx` | local `const StatusBadge` | bordered |
| `app/purchase-orders/[id]/lines/[lineid]/components/PORtvLinesTab.tsx` | local `const StatusBadge` | bordered |
| `app/orders/[id]/components/FulfillmentTab.tsx` | local `const statusBadge` (lowercase — missed by `079`'s own grep) | compact |
| `app/orders/[id]/components/ReturnsTab.tsx` | local `const statusBadge` (lowercase) | compact |
| `app/proposals/[id]/components/ProposalHeader.tsx` | inline ternary | pill |
| `app/purchase-orders/[id]/components/POHeader.tsx` | inline ternary | bordered |
| `app/quotes/[id]/components/QuoteHeader.tsx` | inline ternary | pill |
| `app/proposals/[id]/lines/[lineid]/components/LineReturnsTab.tsx` (5 duplicated blocks: RMA, RTV, Credit Memo, Debit Memo, generic item) | inline ternary | compact |
| `app/proposals/[id]/components/ProjectsTab.tsx` | inline ternary | bordered |
| `app/invoices/[id]/components/InvoiceCredits.tsx` | inline ternary | compact |
| `app/invoices/[id]/components/InvoiceLineItems.tsx` | inline ternary | compact |
| `app/shipments/[id]/components/ShipmentHeader.tsx` | local `function getStatusColor` | pill |
| `app/supplier-bills/page.tsx` | local `function RemittanceBadge` (duplicates the shared file's own export, not the generic `StatusBadge`) | n/a — import shared `RemittanceBadge` |

**Dead code — delete, don't migrate (1 file)**:

- `app/proposals/[id]/components/ProposalDetails.tsx` defines `getStatusColor` at line 26 but never calls it anywhere in the file (confirmed via `grep -n "getStatusColor(" ` returning zero matches beyond the definition itself, and confirmed no `StatusBadge` import or `proposal.status`/`proposal.Status__c` render anywhere in the file). This is unreachable code with zero visual effect either way — matches the precedent `079` set for `lib/auth-service.ts`/`lib/view-permissions.ts`/`Badges.tsx` (delete confirmed-dead code rather than "migrate" it).

**Confirmed exceptions — distinct vocabulary, intentionally out of scope (3)**:

| File | Vocabulary | Why distinct |
|---|---|---|
| `components/ui/StatusBadge.tsx`'s own `RemittanceBadge` export | Paid / Partially Paid / Unpaid / Not Payable / Past Due / Pending | Already the established, separately-scoped payment-remittance concept per `079` §2's own alternatives-considered note. Unchanged. |
| `app/invoices/page.tsx`'s local `CollectionStatusBadge` | Paid / Pending / Past Due | Same vocabulary shape as `RemittanceBadge` (payment-collection status, not the invoice record's own lifecycle status — which this same file already renders correctly via the shared `StatusBadge` it imports at the top). Not merged into `RemittanceBadge` either, to avoid scope creep beyond "duplicate of the generic vocabulary" — flagged as a candidate for a *future*, separate consolidation, not this one. |
| `app/invoices/[id]/components/InvoicePayments.tsx`'s `getStatusColor` | Substring-matched: `paid`/`posted`/`completed`/`success` → green, `fail`/`error`/`rejected` → red, `process`/`sched` → blue | Per-transaction payment/processing status (receive payments, applied debits), not a record's own status. Same reasoning as above. |

**Low-risk, not fully traced (3 files, recommend a `tasks.md` spot-check rather than assuming)**:

- `app/invoices/page.tsx`, `app/orders/page.tsx`, `app/purchase-orders/[id]/lines/[lineid]/page.tsx` all matched the ternary-pattern sweep, but all three already import and use the shared `StatusBadge` elsewhere in the same file (confirmed in the original `079`-era 44-file consumer list, re-verified during the `077`/`078`/`079` sync re-checks earlier in this project's history). The matching ternary line in each is very likely a different UI element that happens to also branch on a variable named `status` (e.g. a row highlight, a filter chip) rather than a second status badge. Not traced line-by-line here to keep this research bounded — flagged explicitly rather than silently assumed clean.

## 3. Conflict resolution — apply `079`'s already-established precedent, don't re-vote

**Decision**: Every status string where a newly-found local mapping disagrees with the shared component's current color is resolved by keeping the shared component's existing color, exactly as `079`'s own research.md §2 already did for other dissenting files discovered at that time (e.g. `Draft` was already resolved to blue against `proposals/page.tsx`, `shipments/page.tsx`, and others that had it as gray or yellow; `Shipped` was already resolved to green against 5 Quote sub-tabs that had it as blue).

**Correction during Phase 2 implementation**: `079`'s own `data-model.md` (line 43) documented `Submitted` as resolved to blue against `orders/page.tsx`. Re-reading the actual current `components/ui/StatusBadge.tsx` before adding this feature's 3 new cases showed `"submitted"` is live in the **yellow** group today, not blue — `079`'s documented resolution and its shipped implementation diverged at some point after that plan was written, and the live code is what matters, not the historical doc. `ReturnsTab.tsx` (orders)'s local mapping already puts `Submitted` in yellow too — so there is no actual conflict here after all; both already agree. Removed from the table below and from `data-model.md`'s conflicts-resolved list; `ReturnsTab.tsx` needs only its `draft` conflict resolved, not `submitted`.

| Status | Shared component's live color | New dissenting file(s) found | Old color in dissenting file | Resolution |
|---|---|---|---|---|
| `shipped` | green | `FulfillmentTab.tsx` | blue | **green** (unchanged from shared; `FulfillmentTab.tsx` changes) |
| `in progress` | yellow | `FulfillmentTab.tsx` | blue | **yellow** (unchanged from shared; `FulfillmentTab.tsx` changes) |
| `allocated` | blue | `FulfillmentTab.tsx` | green | **blue** (unchanged from shared; `FulfillmentTab.tsx` changes) |
| `open` | blue | `FulfillmentTab.tsx` | yellow | **blue** (unchanged from shared; `FulfillmentTab.tsx` changes) |
| `draft` | blue | `FulfillmentTab.tsx`, `ReturnsTab.tsx` (orders) | yellow | **blue** (unchanged from shared; both files change) |
| `draft` | blue | `LineReturnsTab.tsx` (5 blocks), `ProposalHeader.tsx` | gray | **blue** (unchanged from shared; both files change) |
| `acknowledged` | green | `POHeader.tsx` | blue | **green** (unchanged from shared; file changes) |

**Rationale**: `079` already established the operating principle as "existing/live shared-component mapping is authoritative, not a fresh vote," specifically so that adding more consumers over time doesn't perpetually re-litigate settled colors. Applying a different rule now (e.g. a fresh majority count including these new files) would be inconsistent with that precedent and would risk flip-flopping colors that were already user-approved once.

**Alternatives considered**: Recounting a fresh majority across all now-known consumers (old 44 + new 14) was considered — rejected as inconsistent with `079`'s own stated precedent-wins methodology, and because it could theoretically flip an already-shipped, already-approved color for the 44 existing consumers based on newly-discovered but never-reviewed files, which is a bigger, riskier change than this feature's scope calls for.

## 4. Net-new statuses required

Three statuses appear in migrated files but don't yet exist in `components/ui/StatusBadge.tsx`, and none conflicts with an existing mapping (clean additions, not resolutions):

| Status | Source file | Proposed group | Rationale |
|---|---|---|---|
| `"pending shipment"` | `ShipmentHeader.tsx` | yellow (with `pending`) | Same semantic meaning as `pending` — a shipment not yet moving. |
| `"new"` | `ProjectsTab.tsx` | blue (with `draft`, `open`) | A project not yet started reads the same as "not yet in progress," matching the existing blue group's semantics. |
| `"on hold"` | `ProjectsTab.tsx` | orange (with `conditional`, `expired`) | Matches the existing orange group's "paused/needs attention" semantics better than any other group. |

**Alternatives considered**: Treating `ProjectsTab.tsx`'s "Project" entity as a 4th distinct vocabulary (like `RemittanceBadge`) and leaving it alone was considered — rejected because its actual status set (`New`/`In Progress`/`Completed`/`On Hold`) is semantically the same "record lifecycle" concept the generic `StatusBadge` already models (`In Progress` and `Completed` already match the shared component's existing `in progress`/`completed` mappings exactly), just for a different entity. Adding 2 cases to the existing component is simpler than introducing a fourth badge component for one file, per Constitution Principle V.

## 5. Under-coverage — a related but distinct problem the migration fixes for free

**Finding**: Several duplicate implementations only explicitly handle a small subset of statuses and route everything else to one default color: `LineReturnsTab.tsx` (only `Draft`/`Approved` explicit, everything else → gray), `InvoiceCredits.tsx` (only `Posted` explicit, everything else → blue), `InvoiceLineItems.tsx` (only `Paid`/`Settled`/`Approved` explicit, everything else → blue), `ProposalHeader.tsx` and `QuoteHeader.tsx` (4 explicit statuses each, everything else → blue). Since the shared component already has a full 47+ status vocabulary, any status these files currently mis-color via their default case gets its correct, specific color automatically once migrated — this isn't a separate fix, it's a side effect of the same migration, but worth calling out explicitly since it means more visual changes will be visible in QA than "the N documented conflicts" alone would suggest, for statuses nobody had previously bothered to enumerate one-by-one in these particular files.

**Rationale for not treating this as its own set of "conflicts requiring resolution"**: A conflict requires two different colors both currently live somewhere for the same status. A previously-uncovered status falling through to a generic default isn't a competing color decision — there was never a deliberate choice made for it in these files. Applying the shared component's answer isn't overriding a decision, it's completing one that was left unmade.

## 6. Variant (shape) mapping

**Decision**: Follow `079`'s exact precedent — inspect each file's actual rendered `className`, not just its color logic, and map to the closest of the three existing variants (`bordered`, `pill`, `compact`), tolerating minor padding/text-size deltas the same way `079` did for its own 24 `pill` and 9 `bordered` consumers (see `079-shared-status-badge/research.md` §4, which explicitly notes "padding varies trivially... an existing inconsistency not worth resolving further").

**Rationale**: Two of the new files (`POHeader.tsx`, `ProjectsTab.tsx`) use `rounded-full text-xs font-bold` without a visible `border` class — closest to `bordered` in every dimension except the border ring itself. Rather than adding a 4th variant for a one-pixel-of-difference, both are classified as `bordered`, consistent with `079`'s stated tolerance for "existing inconsistency not worth resolving further." `LineReturnsTab.tsx` uses `rounded` (not `rounded-full`) with `text-sm` (not `text-xs`) — closest to `compact` (shares `rounded`, not `rounded-full`) with the same kind of minor delta.

**Alternatives considered**: Adding a 4th variant (`bordered-no-ring`) for `POHeader.tsx`/`ProjectsTab.tsx` was considered and rejected as unnecessary API surface for a one-class-name difference, matching `079`'s own rejected-alternative reasoning for not splitting `compact` further.

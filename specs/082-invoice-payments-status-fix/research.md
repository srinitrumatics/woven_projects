# Phase 0 Research: Invoice Payments Tab Status Badge Color Fix

No `[NEEDS CLARIFICATION]` markers remain in the spec, so this phase documents the codebase investigation that grounded the plan.

## 1. Root cause of the reported "Draft" color bug

**Decision**: Fix by removing the local `getStatusColor` function in `app/invoices/[id]/components/InvoicePayments.tsx` and rendering both sub-tabs' status columns through the shared `StatusBadge` component instead.

**Investigation**: `InvoicePayments.tsx` (lines 72–84) defines:

```ts
const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('paid') || s.includes('posted') || s.includes('completed') || s.includes('success')) return "green...";
    if (s.includes('fail') || s.includes('error') || s.includes('rejected')) return "red...";
    if (s.includes('process') || s.includes('sched')) return "blue...";
    return "gray..."; // default
};
```

This is called at line 115 (`getStatusColor(payment.status)`, Receive Payments sub-tab) and line 171 (`getStatusColor(memo.status)`, Applied Credit Payments sub-tab). Neither call site has a branch matching `"draft"` — it falls through to the gray default. `components/ui/StatusBadge.tsx`'s switch statement explicitly lists `"draft"` in its blue case group. Gray vs. blue is the exact discrepancy the user reported.

**Rationale**: Both `ReceivePayment` and `AppliedCreditMemo` (`app/invoices/types.ts` lines 80–99, 128–146) declare `status: string; // Status__c` — the same generic Salesforce field every other already-migrated status column in this app reads. There is no technical reason for this file to have its own vocabulary; it is a duplicate implementation that happens to color a handful of values plausibly, not a deliberate distinct-vocabulary design.

**Alternatives considered**: Patching only the one missing `"draft"` case into the local function — rejected, since it would leave the duplicate implementation in place (violating the "one file" goal this whole line of features has been pursuing) and would not close User Story 2's identical latent bug in the sibling Receive Payments sub-tab.

## 2. Correcting `080`'s classification of this file

**Decision**: This feature explicitly supersedes `080`'s "confirmed distinct payment/collection vocabulary, out of scope" classification for `InvoicePayments.tsx` specifically (`080`'s `plan.md` Constraints section and `data-model.md`'s "Confirmed exceptions" table).

**Rationale**: `080`'s classification was based on which status *values* the local function colored plausibly (paid/posted/failed/processing-shaped strings look payment-specific), not on the underlying field. Direct inspection now shows the field is the same generic `Status__c` used everywhere else — the same situation `079`/`080` already resolved for every other file in this app. The two genuinely distinct vocabularies `080` correctly identified and left alone — `RemittanceBadge`'s own export, `app/invoices/page.tsx`'s `CollectionStatusBadge` — are unaffected by this correction; they are structurally different (dedicated components/functions with their own field semantics, e.g. remittance/collection status rather than a generic record `Status__c`).

**Alternatives considered**: Leaving `080`'s classification as-is and treating this purely as a net-new bug report unrelated to prior work — rejected, since it would miss the chance to record *why* the earlier classification was wrong, which matters for any future audit that re-checks this file.

## 3. `variant` convention

**Decision**: `variant="compact"` for both of `InvoicePayments.tsx`'s render sites.

**Rationale**: Its direct siblings in the same `app/invoices/[id]/components/` folder — `InvoiceCredits.tsx` and `InvoiceLineItems.tsx`, both migrated by `080` — use `variant="compact"`. This is the closest, most directly relevant precedent, per the same rule `081` used (closest in-page/in-folder sibling wins).

**Alternatives considered**: Matching `app/invoices/[id]/page.tsx`'s own header badge variant — rejected; that's a different component (a page header, not a sibling tab file), and the in-folder sibling precedent is more specific and consistent with how `080`/`081` made this same choice elsewhere.

## 4. Supplier Bills side (User Story 3)

**Decision**: No code change. `app/supplier-bills/[id]/components/SupplierBillPaymentsTab.tsx` already imports `StatusBadge` (line 10) and uses it at both its render sites — line 128 (`<StatusBadge status={payment.status} />`, Bill Payments sub-tab) and line 185 (`<StatusBadge status={debit.status} />`, Applied Debit Memos sub-tab) — with no local color logic anywhere in the file.

**Rationale**: Direct inspection confirms full compliance already. This file uses the default `bordered` variant (no `variant` prop passed) — a different variant from the invoice-side fix, which is expected and correct, since `081`'s precedent is "match the closest in-page/in-folder sibling," not "use one variant everywhere."

**Alternatives considered**: None — this is a verification, not a design decision.

## 5. Non-recognized status values (edge case)

**Decision**: Not resolved by this spec/plan; flagged as a QA check for `tasks.md`, matching the same open-question handling `080`/`081` used for their own status-vocabulary gaps.

**Rationale**: The local function's `'process'`/`'sched'` substring rule returns blue for any status containing those substrings. The shared component's `"in progress"` case is in the **yellow** group (a real color change if a literal `"In Progress"`/`"Processing"` status ever occurs here), and it has no case at all for `"scheduled"` (would fall to the gray default, a behavior change from today's blue). Without live data, it cannot be confirmed whether either literal value actually occurs for these two entity types. If found during QA, `"scheduled"` should be triaged into the correct existing group (likely alongside `"pending"`/`"in progress"`'s yellow, matching its semantic meaning) rather than left on an unreviewed default — matching the precedent-wins rule established in `079`–`081`.

**Alternatives considered**: Proactively adding a `"scheduled"` case to the shared component now, without confirming it's a real value — rejected as unnecessary upfront work; cheaper to gate on visual QA against live/mock data during implementation, exactly as `080`/`081` did for their own open vocabulary questions.

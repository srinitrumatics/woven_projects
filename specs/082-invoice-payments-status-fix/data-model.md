# Data Model: Invoice Payments Tab Status Badge Color Fix

No database, API, or data-fetching changes. This feature only changes how an already-fetched status string is rendered.

## Key Entities (from `spec.md`)

- **Receive Payment**: `app/invoices/types.ts` lines 80–99. `status: string; // Status__c`. Rendered at `InvoicePayments.tsx` line 115 (`renderReceivePayments`).
- **Applied Credit Payment / Applied Credit Memo**: `app/invoices/types.ts` lines 128–146. `status: string; // Status__c`. Rendered at `InvoicePayments.tsx` line 171 (`renderAppliedCredits`) — this is where the reported "Draft" bug lives.
- **Bill Payment / Applied Debit Memo**: Supplier Bills equivalents, rendered at `SupplierBillPaymentsTab.tsx` lines 128 and 185 respectively — already compliant, zero change.
- **Status Badge**: `components/ui/StatusBadge.tsx`'s exported `StatusBadge`. Not modified by this feature unless Phase 3/tasks QA finds a real occurrence of an unrecognized value (see `research.md` §5).

## Per-file fix notes

| File | Render sites | Variant | Notes |
|---|---|---|---|
| `app/invoices/[id]/components/InvoicePayments.tsx` | 2 (`payment.status` line 115, `memo.status` line 171) | compact | Matches direct in-folder siblings `InvoiceCredits.tsx`/`InvoiceLineItems.tsx` (both already migrated by `080`). Local `getStatusColor` function (lines 72–84) deleted entirely — zero callers remain once both sites migrate. |
| `app/supplier-bills/[id]/components/SupplierBillPaymentsTab.tsx` | 0 (verification only) | bordered (default, already in place) | Already fully compliant — confirmed by direct inspection, no local color logic anywhere in the file. |

## Color-mapping comparison (old local function vs. shared component)

| Status substring the old function matched | Old local color | Shared component's actual color for the closest real value | Regression risk |
|---|---|---|---|
| `paid`, `posted`, `completed`, `success` | green | `paid`/`posted`/`completed` → green (`success` has no shared case, would be gray if it's ever a literal value — not observed in these entities' vocabulary) | None for the 3 confirmed values |
| `fail`, `error`, `rejected` | red | `failed`/`rejected` → red (`error` has no shared case — not observed as a literal value) | None for the 2 confirmed values |
| `process`, `sched` | blue | `in progress` → **yellow** (real color change if this literal value occurs); `scheduled` has no shared case → gray (behavior change if this literal value occurs) | Flagged for QA — see `research.md` §5, not resolved here |
| *(no match)* | gray (default) | `draft` → **blue** — this is the reported bug | Fixed by this feature |

**QA finding (T008, 2026-08-02)**: no literal `"in progress"`/`"processing"`/`"scheduled"` value was found anywhere in code for `ReceivePayment.status` or `AppliedCreditMemo.status` (both plain `string`; mock data has empty arrays for both fields). A separate `PaymentStatus` type (`app/invoices/types.ts` line 2: `"Pending" | "Processing" | "Completed" | "Failed" | "Refunded"`) exists but has zero real usages beyond an unused mock-data import — it is not the type of either field this feature touches. Whether either literal value ever actually occurs can only be confirmed against live Salesforce data, which this session doesn't have access to — left as an open item for the user's own visual QA pass per `quickstart.md` Scenario 5, not resolved here.

## Confirmed compliant (unchanged in this feature)

| File | Vocabulary | Status |
|---|---|---|
| `components/ui/StatusBadge.tsx`'s `RemittanceBadge` export | Paid / Partially Paid / Unpaid / Not Payable / Past Due / Pending | Unaffected — genuinely distinct vocabulary, per `080` |
| `app/invoices/page.tsx`'s `CollectionStatusBadge` | Paid / Pending / Past Due | Unaffected — genuinely distinct vocabulary, per `080` |
| `app/supplier-bills/[id]/components/SupplierBillPaymentsTab.tsx` | Generic `Status__c`, same vocabulary as everywhere else | Already migrated — confirmed via this feature's User Story 3 |

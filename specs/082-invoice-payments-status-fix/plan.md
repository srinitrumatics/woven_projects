# Implementation Plan: Invoice Payments Tab Status Badge Color Fix

**Branch**: `wovn_mathu` (no dedicated feature branch — no `before_specify` git hook configured for this repo, consistent with `080`/`081`) | **Date**: 2026-08-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/082-invoice-payments-status-fix/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

The reported bug is confirmed and root-caused: `app/invoices/[id]/components/InvoicePayments.tsx` has its own local `getStatusColor` substring-matcher (lines 72–84), used identically by both its sub-tabs (Receive Payments and Applied Credit Payments). It has no rule for `"draft"`, so a Draft-status row silently falls to its gray default — while `components/ui/StatusBadge.tsx` colors `"draft"` blue. Both entities (`ReceivePayment`, `AppliedCreditMemo`) read the exact same generic `Status__c` field (confirmed in `app/invoices/types.ts`), so there is no genuine distinct vocabulary here — this corrects `080`'s classification of this file as an intentional out-of-scope exception. The fix mirrors `080`'s established pattern: remove the local function, import the shared `StatusBadge`, migrate both sub-tabs, matching the `variant="compact"` already used by this file's direct siblings in the same folder (`InvoiceCredits.tsx`, `InvoiceLineItems.tsx`). The Supplier Bills side the user asked to check (`app/supplier-bills/[id]/components/SupplierBillPaymentsTab.tsx`) is confirmed already fully migrated (both sub-tabs use `StatusBadge` with no local logic) — no code change there, only verification.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: Next.js, React, Tailwind CSS (existing utility classes reused as-is via `StatusBadge`); no new packages

**Storage**: N/A — purely a presentational fix; no data, fetch, or status-computation logic changes

**Testing**: Manual/visual QA per `quickstart.md`, consistent with `077`–`081` (no automated UI test suite exists)

**Target Platform**: Web (desktop + responsive), light and dark mode

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — no new network calls; replaces an inline function call with a component render

**Constraints**:
- Every status value the local function already colored correctly (`paid`/`posted`/`completed` → green, `failed`/`rejected` → red) MUST keep that exact color — the shared component already has matching cases for all of these, so this holds automatically once migrated.
- The local function's `'process'`/`'sched'` substring rule returns **blue** for anything containing those substrings (e.g. a literal status `"In Progress"` or `"Processing"`, `"Scheduled"`). The shared component's `"in progress"` case is in the **yellow** group, and it has no case at all for `"scheduled"` (falls to gray default). Per FR-006/precedent-wins, the shared component's color wins for any value it already recognizes (`in progress` → yellow, a real color change if this value ever occurs); any value it doesn't yet recognize (e.g. `scheduled`) must be triaged during implementation QA and added to the correct existing group if a real occurrence is found — not assumed resolved here.
- `variant="compact"` for both sub-tabs, matching the immediate in-folder siblings `InvoiceCredits.tsx` and `InvoiceLineItems.tsx` (both already migrated by `080`).
- No new shared component is introduced; only this one file's local function is removed.
- Supplier Bills side requires no code change — confirmed already compliant; only a verification task.
- Once fixed, changes MUST be checked against the four tracked sibling deployment folders following the diff-before-copy/typecheck/ask-before-commit process already established in project memory for `077`–`081`.

**Scale/Scope**: 1 file fixed (`InvoicePayments.tsx`, 2 status render sites, 1 local function deleted) + 1 file verified with zero changes (`SupplierBillPaymentsTab.tsx`) + propagation check across 4 sibling folders.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS. No data-fetching, query, or status-value-computation changes — both touched sub-tabs continue rendering whatever `Status__c` value they already receive; only the *rendering* of that string changes.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability, route, or data-mutation path; the touched file remains behind its existing auth/route protection, unchanged.
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes.
- **IV. Multi-Tenant Isolation**: PASS. No change to data scoping — presentational-only fix.
- **V. Simplicity & Phase-Driven Scope**: PASS. Direct continuation of the consolidation `077`–`081` already established; reuses the existing shared component with no new abstraction. Explicitly limited to the two Payments tabs named in the spec — does not re-open the broader `080`/`081` audits.

No violations. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/082-invoice-payments-status-fix/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — this feature edits a presentational component only; there is no request/response contract to document.

### Source Code (repository root)

Existing Next.js App Router web application (`app/`, `app/api/`, `components/`, `lib/`, `db/`) per `CLAUDE.md`.

```text
app/
├── invoices/[id]/components/
│   └── InvoicePayments.tsx                                   # remove local `getStatusColor`, import shared
│                                                                # StatusBadge, variant="compact" at both render
│                                                                # sites (Receive Payments, Applied Credit Payments)
└── supplier-bills/[id]/components/
    └── SupplierBillPaymentsTab.tsx                            # VERIFY ONLY — already imports and uses shared
                                                                  # StatusBadge for both sub-tabs; no change expected
```

**Structure Decision**: Single Next.js project. No new files or components. `InvoicePayments.tsx` loses its local `getStatusColor` function and gains an import of the existing `StatusBadge` from `components/ui/StatusBadge.tsx`, applied at its 2 render sites. `SupplierBillPaymentsTab.tsx` is touched by zero code changes — it is re-confirmed compliant as part of this feature's verification task, not migrated.

## Complexity Tracking

Not applicable — no violations.

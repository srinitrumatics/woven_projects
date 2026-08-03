# Implementation Plan: P1 Critical Fixes (UI/UX Consistency Audit)

**Branch**: `wovn_mathu` (no dedicated feature branch — no `before_specify`/`before_plan` git hook configured for this repo, consistent with `079`–`082`) | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/083-p1-critical-fixes/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Five independent, small-blast-radius fixes drawn from `UI_UX_DESIGN_CONSISTENCY_AUDIT.md`'s §17 "fix immediately" tier, root-caused by direct code inspection:

1. **`components/SignUpForm.tsx`** leaks live form values (including the password) via `title={String(formData.X ?? '')}` on all 5 text inputs — a copy-pasted pattern with no functional purpose. Remove it from all 5.
2. **`app/supplier-bills/[id]/page.tsx`** correctly fetches `productLineCount` from Salesforce at line 99, then unconditionally overwrites it with a literal `100` (plus an arbitrary `serviceLineCount` halving) once lines load (lines 136–146). Delete the override block.
3. **`app/orders/page.tsx`** computes each stat card's count via a real per-category predicate (e.g. "Total" = Submitted+Approved+Closed) but filters the table via a single exact-match `order.status === activeTab` — which can never match aggregate card labels like `"Total"`/`"Success"`, and silently under-matches `"Pending"`. Introduce one shared predicate used by both the count computation and the filter.
4. **`app/shipments/page.tsx`** line 325: the "Partial Shipment" card's active-state class checks `activeTab === "Pending"` (a stray copy-paste) instead of `"Partial Shipment"`, while every other signal on the same card (icon color, click handler) is already correct. One-line fix.
5. **PO Line Detail / Supplier Bill Line Detail case-sensitive StatusBadge** (the audit's 6th P1 finding) — investigated and found **already fixed** by prior specs `079`–`081`; all named files already import and use the shared, case-insensitive `components/ui/StatusBadge.tsx`. Retained as a verification-only story, no code change.

One finding from the original request — **Invoice Detail's missing "Pay Now" CTA** — was dropped from scope entirely after investigation showed `handleMakePayment` is a no-op stub with no real payment flow behind it anywhere in the codebase, and the user explicitly confirmed this app does not handle payments. See `research.md` §2 for the full investigation; `spec.md`'s Input/Assumptions record this as an explicit scope exclusion, not an oversight.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: Next.js, React, Tailwind CSS (existing utility classes only); no new packages

**Storage**: N/A — all 5 fixes are presentational/state-derivation only; no schema, query, or data-fetching changes

**Testing**: Manual/visual QA per `quickstart.md`, consistent with `077`–`082` (no automated UI test suite exists in this repo — `npm run lint` and `npx tsc --noEmit` are the available automated checks)

**Target Platform**: Web (desktop + responsive), light and dark mode

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — no new network calls or expensive computation; the Orders List predicate change replaces several inline `.filter()` calls with one shared function, same order of complexity

**Constraints**:
- No change to underlying business data (order status values, bill line data) — only how it's displayed/filtered (FR-012).
- Orders List: the new shared predicate must preserve each card's existing aggregate semantics exactly (Total/Pending/Success as currently computed) and must not break the dynamic status-pill row's exact-match behavior for real literal status values.
- No payment-processing capability of any kind is added (FR-013) — confirmed out of scope by the user.
- PO/Supplier Bill Line Detail: zero code changes expected; if verification finds any stray case-sensitive local badge logic the audit's file:line references no longer point to, treat that as a new finding to flag back to the user, not silently fix inside this spec's scope.

**Scale/Scope**: 4 files changed (`SignUpForm.tsx`, `app/supplier-bills/[id]/page.tsx`, `app/orders/page.tsx`, `app/shipments/page.tsx`) + up to 5 files verified with zero changes expected (PO/Supplier Bill Line Detail StatusBadge consumers) + no sibling-folder propagation in this feature's scope (separate, user-gated step per established convention).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS. No new queries or writes. The Supplier Bill fix specifically *restores* trust in an already-correctly-fetched Salesforce field by removing a client-side override that was replacing it with a fabricated value — this fix is a direct application of this principle, not a violation of it.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability, route, or permission surface; all 5 touched pages remain behind their existing auth/route protection, unchanged.
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes.
- **IV. Multi-Tenant Isolation**: PASS. No change to data scoping — all fixes are presentational or client-side derivation of already-scoped data.
- **V. Simplicity & Phase-Driven Scope**: PASS. Each fix is the minimal change that closes its specific defect; the Orders List predicate consolidates existing duplicated logic into one function rather than introducing a new abstraction layer. The dropped Pay Now finding is the clearest expression of this principle in this spec — not building speculative payment infrastructure for a phase where it isn't needed.

No violations. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/083-p1-critical-fixes/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — this feature touches presentational components and client-side derived state only; there is no request/response or API contract to document.

### Source Code (repository root)

Existing Next.js App Router web application (`app/`, `app/api/`, `components/`, `lib/`, `db/`) per `CLAUDE.md`.

```text
components/
└── SignUpForm.tsx                                              # remove title={formData.X} from 5 inputs

app/
├── supplier-bills/[id]/
│   └── page.tsx                                                # delete hardcoded productLineCount:100 override block
├── orders/
│   └── page.tsx                                                # add shared category-matching predicate; use for
│                                                                 # stats computation AND stat-card click filtering
├── shipments/
│   └── page.tsx                                                # fix one wrong string comparison (line 325)
├── purchase-orders/[id]/lines/[lineid]/
│   ├── page.tsx                                                 # VERIFY ONLY
│   └── components/
│       ├── PODebitMemoLinesTab.tsx                              # VERIFY ONLY
│       ├── PORtvLinesTab.tsx                                    # VERIFY ONLY
│       └── POSupplierBillLinesTable.tsx                         # VERIFY ONLY
└── supplier-bills/[id]/lines/[lineid]/
    ├── page.tsx                                                  # VERIFY ONLY
    └── components/
        └── SBLDebitMemoLinesTab.tsx                              # VERIFY ONLY
```

**Structure Decision**: Single Next.js project, no new files or components. 4 files receive a targeted code change each; up to 6 files are re-confirmed compliant with zero changes as part of this feature's verification story (User Story 5), matching the precedent set by `082`'s Supplier Bills verification-only task.

## Complexity Tracking

Not applicable — no violations.

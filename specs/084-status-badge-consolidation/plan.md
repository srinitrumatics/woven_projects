# Implementation Plan: Status-Badge Consolidation (Remaining Gaps)

**Branch**: `wovn_mathu` (no dedicated feature branch — no `before_specify`/`before_plan` git hook configured, consistent with `079`–`083`) | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/084-status-badge-consolidation/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

A fresh current-state re-audit (via an Explore subagent, not the stale `UI_UX_DESIGN_CONSISTENCY_AUDIT.md`) confirmed specs `079`-`082` already closed the *generic* `Status__c` duplication across Orders/Invoices/Proposals/Quotes/Purchase-Orders/Supplier-Bills/Shipments list/header/tab files — 70 files now import the shared `StatusBadge`/`RemittanceBadge`, and zero locally-named duplicate `StatusBadge` components remain anywhere. This feature closes 5 groups of **genuinely new, currently-broken** gaps the prior specs never touched:

1. **Order Detail's own header** (`OrderHeader.tsx`) — never migrated, still a hand-rolled ternary.
2. **Home/Program360 dashboards** — "Needs attention" panel colors by record-type category, not real status (3 of 5 categories are unconditional; 2 of 5 have only a binary ternary).
3. **Two Product-module cards** (`ProductInfoCard.tsx`, `AddToOrderModal.tsx`) — unconditional green/amber regardless of actual status.
4. **Certification Status** — two independent local color maps disagree; one silently collapses "Expired" into the same bucket as unrecognized values.
5. **Collection Status** — four locations disagree; critically, the two locations already using the shared `StatusBadge` (the "correct" precedent) would still render "Past Due" as gray, since the shared component has no case for that exact phrase (only "overdue").
6. **Remittance Status** and **Tracking Status** — plain uncolored text in a handful of files where the identical field is already correctly colored via the shared components in sibling files in the same module.

Two small, safe additions to the shared `StatusBadge` component's vocabulary (`"valid"` → green, `"past due"` → red) are required to make groups 4 and 5 resolve correctly — confirmed via codebase-wide grep that neither addition affects any other existing call site.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: Next.js, React, Tailwind CSS (existing shared component's existing classes only); no new packages

**Storage**: N/A — presentational only; no schema, query, or data-fetching changes

**Testing**: Manual/visual QA per `quickstart.md`, consistent with `077`-`083` (no automated UI test suite exists in this repo)

**Target Platform**: Web (desktop + responsive), light and dark mode

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — no new network calls; each fix replaces inline JSX/local functions with an existing shared component render

**Constraints**:
- No change to underlying business data (status values themselves) — display only (FR-009).
- The two shared-component additions (`"valid"`, `"past due"`) MUST NOT change the rendered color for any status value already recognized by `StatusBadge` today — confirmed via codebase-wide grep before adding either case.
- Each fix's `variant` prop choice follows the "closest sibling wins" rule established in spec `081`: match the same file's own existing `StatusBadge` usage where one exists; otherwise match the most directly comparable precedent elsewhere in the same module (see `research.md` for the specific justification per file).
- The two explicitly-out-of-scope vocabularies (`Relationship_Status__c`, Admin-Portal sync-run status) MUST NOT be touched (FR-010).

**Scale/Scope**: 2 lines added to `components/ui/StatusBadge.tsx`'s existing switch statement + 16 call-site files changed across Orders, Home/Program360, Products, Invoices, Quotes, Proposals, and Purchase Orders modules. No new files, no sibling-folder propagation in this feature's scope (separate, user-gated step per established convention).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS. No new queries; every touched field is already fetched and flowing through existing service layers. Only its rendering changes.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability, route, or permission surface.
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes.
- **IV. Multi-Tenant Isolation**: PASS. No change to data scoping.
- **V. Simplicity & Phase-Driven Scope**: PASS. This feature extends the existing shared component's vocabulary by exactly 2 cases (both confirmed necessary and confirmed safe) rather than introducing new abstractions; it explicitly declines to force the 2 genuinely-distinct vocabularies (Relationship Status, sync-run status) onto the shared component, avoiding over-generalization.

No violations. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/084-status-badge-consolidation/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — presentational components and client-side rendering only; no request/response or API contract involved.

### Source Code (repository root)

Existing Next.js App Router web application (`app/`, `components/`) per `CLAUDE.md`.

```text
components/ui/
└── StatusBadge.tsx                                                   # add 2 cases: "valid" (green), "past due" (red)

app/
├── orders/[id]/components/OrderHeader.tsx                            # US1: generic status
├── home/page.tsx                                                     # US1: generic status (Needs attention panel)
├── program360/page.tsx                                               # US1: byte-identical fix
├── products/[id]/components/ProductInfoCard.tsx                      # US1: generic status
├── products/[id]/components/AddToOrderModal.tsx                      # US1: generic status
├── products/[id]/components/EditProductTabs.tsx                      # US3: certification status
├── products/[id]/components/ComplianceCertsTab.tsx                   # US3: certification status
├── invoices/page.tsx                                                 # US2: collection status (delete local badge fn)
├── invoices/[id]/components/InvoiceSummary.tsx                       # US2: collection status
├── quotes/[id]/components/QuoteInvoicesSubTab.tsx                    # US2: collection status
├── proposals/[id]/components/PurchasesTab.tsx                        # US4 (remittance) + US5 (tracking) — 2 fixes, 1 file
├── quotes/[id]/components/QuoteSupplierBillsSubTab.tsx                # US4: remittance status
├── purchase-orders/page.tsx                                          # US5: tracking status
├── purchase-orders/[id]/components/POLinesTable.tsx                  # US5: tracking status
├── quotes/[id]/components/QuotePurchasesSubTab.tsx                   # US5: tracking status
├── proposals/[id]/lines/[lineid]/components/LinePurchasesTab.tsx     # US5: tracking status
└── proposals/[id]/components/FulfillmentsTab.tsx                     # US5: tracking status
```

**Structure Decision**: Single Next.js project. 1 shared component gains 2 new switch cases; 16 call-site files each get a targeted local fix (either replacing hand-rolled color logic with the shared component, or wrapping a previously-plain field with it). No new files, no new abstractions.

## Complexity Tracking

Not applicable — no violations.

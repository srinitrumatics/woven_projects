# Implementation Plan: Status Badge Compliance Audit

**Branch**: `wovn_mathu` (no dedicated feature branch — no `before_specify` git hook configured for this repo) | **Date**: 2026-08-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/080-status-badge-audit/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Two grep-based sweeps (documented in full in `research.md`) plus individual inspection of every hit found the gap is much larger than `079-shared-status-badge`'s original 34-file survey closed: **14 files** still render the generic record-status vocabulary through their own local, duplicate color logic instead of `components/ui/StatusBadge.tsx` — not just line-level related-record tables (the pattern `077`/`078`/`079` already fixed elsewhere), but three top-level detail-page **header** badges (`ProposalHeader.tsx`, `POHeader.tsx`, `QuoteHeader.tsx`) that were never in scope for any prior status-badge feature at all. One more file, `app/proposals/[id]/components/ProposalDetails.tsx`, defines a duplicate `getStatusColor` that is **dead code** with zero callers — a deletion, not a migration. Three files render a genuinely distinct payment/collection-status vocabulary and are confirmed, not just assumed, out of scope. Several of the 14 duplicate mappings disagree with the shared component's already-adjudicated colors; this plan applies the existing precedent (established in `079`) rather than re-litigating it, and two mappings introduce statuses (`"pending shipment"`, `"new"`, `"on hold"`) the shared component doesn't yet recognize.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: Next.js, React, Tailwind CSS (existing utility classes reused as-is); no new packages

**Storage**: N/A — purely a presentational fix; no data, fetch, or status-computation logic changes anywhere

**Testing**: Manual/visual QA per `quickstart.md`, consistent with `077`/`078`/`079` (no automated UI test suite exists). The audit itself is grep-based codebase inspection (documented in `research.md`), not a new automated lint rule — adding one would exceed this feature's scope per Constitution Principle V.

**Target Platform**: Web (desktop + responsive), light and dark mode

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — no new network calls; pure refactor of already-rendered presentational logic

**Constraints**:
- Every status string not part of a documented conflict MUST keep its exact current color (zero-regression, matching `079` FR-004).
- Conflicts found between a local mapping and the shared component's live color are resolved using the shared component's **already-live** color, per the same precedent-wins rule `079`'s own research.md used for identical conflicts (see `research.md` §2 for the full per-status list and disclosure).
- Three net-new statuses (`"pending shipment"`, `"new"`, `"on hold"`) must be added to the shared component — none conflicts with an existing mapping.
- `ProposalDetails.tsx`'s `getStatusColor` has zero callers in that file — a dead-code deletion, not a migration; no visual change results.
- `app/invoices/page.tsx`'s `CollectionStatusBadge`, `app/invoices/[id]/components/InvoicePayments.tsx`'s `getStatusColor`, and the shared file's own `RemittanceBadge` render a distinct payment/collection-status vocabulary and are explicitly out of scope, matching existing `RemittanceBadge` precedent.
- Several duplicate implementations only explicitly handle 1–4 statuses and dump everything else into one default color (`LineReturnsTab.tsx`, `InvoiceCredits.tsx`, `InvoiceLineItems.tsx`, `ProposalHeader.tsx`, `QuoteHeader.tsx`) — some of those defaults land on the wrong color for statuses the shared component already handles correctly (e.g. an Invoice line item with a status other than `Paid`/`Settled`/`Approved` renders blue today, when the shared component would give it its real, correct color). Migrating fixes this as a side effect, not a separate requirement — it's the same fix.
- No new shared component is introduced; the fix extends the existing `components/ui/StatusBadge.tsx` only.
- Three additional files (`app/invoices/page.tsx`, `app/orders/page.tsx`, `app/purchase-orders/[id]/lines/[lineid]/page.tsx`) matched the ternary-pattern sweep but already import the shared component elsewhere in the same file — the matching ternary is very likely unrelated (e.g. a different UI element also keyed on a `status` variable). Not fully traced; flagged in `research.md` as low-risk spot-checks for `tasks.md` rather than assumed clean.
- Once fixed here, changes MUST be checked against the four tracked sibling deployment folders (`ClientPartnerPortal-main`, `-prod`, `-dev`, `woven_projects-claude`) following the diff-before-copy/typecheck/ask-before-commit process already established in project memory for `077`/`078`/`079`.

**Scale/Scope**: 1 shared file extended (`components/ui/StatusBadge.tsx`, +3 status cases) + 14 files migrated to import it + 1 file's dead code deleted + 3 files flagged for a quick spot-check (outcome unknown until checked) + propagation check across 4 sibling folders.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS. No data-fetching, query, or status-value-computation changes anywhere — every touched file continues to pass whatever status string it already fetches; only the *rendering* of that string changes.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability, route, or data-mutation path; all touched files remain behind their existing auth/route protection, unchanged. (This repo's actual RBAC subsystem was removed entirely per commit `d480866`; this principle is evaluated as written in the constitution but has no bearing on a presentational-only change either way.)
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes.
- **IV. Multi-Tenant Isolation**: PASS. No change to data scoping — presentational-only refactor.
- **V. Simplicity & Phase-Driven Scope**: PASS. Direct continuation of the simplification `079` started, closing gaps its fixed-at-planning-time file list missed. Explicitly does not introduce a new automated lint/CI check to prevent future drift (would exceed this feature's requested scope), does not force the 3 distinct payment/collection vocabularies into the generic component, and does not carve out a 4th badge component for `ProjectsTab.tsx` when 2 new cases on the existing component covers it.

No violations. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/080-status-badge-audit/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — this feature edits presentational components only; there is no request/response contract to document.

### Source Code (repository root)

Existing Next.js App Router web application (`app/`, `app/api/`, `components/`, `lib/`, `db/`) per `CLAUDE.md`.

```text
components/
└── ui/
    └── StatusBadge.tsx                                     # EXTENDED: add "pending shipment" (yellow),
                                                              # "new" (blue), "on hold" (orange). No other changes.

app/
├── orders/[id]/components/
│   ├── FulfillmentTab.tsx                                  # remove local `statusBadge`, import shared
│   │                                                        # StatusBadge, variant="compact"; recolor 5
│   │                                                        # conflicting statuses per established precedent
│   └── ReturnsTab.tsx                                       # same pattern, variant="compact"; recolor 2
│                                                             # conflicting statuses per established precedent
├── proposals/[id]/components/
│   ├── ProposalDetails.tsx                                  # delete dead `getStatusColor` (zero callers)
│   ├── ProposalHeader.tsx                                   # remove local ternary, import shared StatusBadge,
│   │                                                        # variant="pill"; recolor "draft" conflict
│   └── ProjectsTab.tsx                                      # remove local ternary, import shared StatusBadge,
│                                                             # variant="bordered"
├── proposals/[id]/lines/[lineid]/components/
│   └── LineReturnsTab.tsx                                   # remove local ternary (5 duplicated blocks: RMA,
│                                                             # RTV, Credit Memo, Debit Memo, generic item),
│                                                             # import shared StatusBadge, variant="compact"
├── purchase-orders/[id]/components/
│   └── POHeader.tsx                                         # remove local ternary, import shared StatusBadge,
│                                                             # variant="bordered"; recolor "acknowledged" conflict
├── purchase-orders/[id]/lines/[lineid]/components/
│   ├── PODebitMemoLinesTab.tsx                              # remove local StatusBadge, import shared,
│   │                                                        # variant="bordered"
│   ├── POSupplierBillLinesTable.tsx                        # same
│   └── PORtvLinesTab.tsx                                    # same
├── invoices/[id]/components/
│   ├── InvoiceCredits.tsx                                   # remove local ternary, import shared StatusBadge,
│   │                                                        # variant="compact"
│   └── InvoiceLineItems.tsx                                 # same
├── quotes/[id]/components/
│   └── QuoteHeader.tsx                                       # remove local ternary, import shared StatusBadge,
│                                                             # variant="pill"
├── shipments/[id]/components/
│   └── ShipmentHeader.tsx                                    # remove local getStatusColor, import shared
│                                                             # StatusBadge, variant="pill"
└── supplier-bills/
    └── page.tsx                                              # remove local `function RemittanceBadge`,
                                                                # import shared RemittanceBadge instead
```

**Structure Decision**: Single Next.js project. No new files or components. `components/ui/StatusBadge.tsx` gains exactly three new status cases; all 14 consumer files each independently remove their local duplicate and import the shared one, matching `079`'s established variant-preserving approach. `ProposalDetails.tsx` gets a pure deletion, not a migration. Three low-risk ternary matches (`invoices/page.tsx`, `orders/page.tsx`, `purchase-orders/[id]/lines/[lineid]/page.tsx`) are explicitly deferred to `tasks.md` as spot-checks rather than assumed clean.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Not applicable — no violations.

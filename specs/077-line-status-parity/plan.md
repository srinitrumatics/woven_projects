# Implementation Plan: Line Status Indicator Parity (Orders, Proposals, Quotes)

**Branch**: `077-line-status-parity` | **Date**: 2026-07-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/077-line-status-parity/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Order Line, Proposal Line, and Quote Line detail pages must each show a status badge next to the "Line X of Y" indicator, matching the existing pattern already established on the Supplier Bill Line detail page. Codebase inspection found three distinct, independent root causes: Order Lines never fetch/type a line-level status field at all; Proposal Lines render a status badge but read the wrong field name (`Status_c` instead of `Status__c`), so it's always blank; Quote Lines correctly fetch `Status__c` but never render a badge for it. The fix is a self-contained frontend change per page — reuse the exact `StatusBadge` component pattern (byte-identical between Supplier Bills and Proposals today) rather than introduce a new shared abstraction.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: Next.js, React, Tailwind CSS (existing badge styling classes), no new packages

**Storage**: N/A — line status is read-only, sourced live from Salesforce via existing proxy API routes (`app/api/salesforce/orders`, and the equivalent existing routes already used by the Proposals/Quotes line pages); no database changes

**Testing**: Manual/visual QA per `quickstart.md` (this repo has no existing automated test suite for page-level UI; consistent with how prior `*-corrections` features in this repo (e.g., `020-proposal-line-corrections`, `042-supplier-bill-line-debit-memo-corrections`) were validated)

**Target Platform**: Web (desktop + responsive), light and dark mode

**Project Type**: Web application (Next.js App Router, single project — see `Project Structure` below)

**Performance Goals**: N/A — no new network calls; status is derived from data already being fetched (Proposals, Quotes) or added to an existing fetch response mapping (Orders)

**Constraints**: Must not alter the existing "Line X of Y" indicator, page loading/skeleton behavior, or line-navigation behavior; must not introduce a new shared component that other line pages don't yet use (matches this repo's existing convention of a locally-duplicated `StatusBadge` function per file, seen identically in both the Supplier Bill Line and Proposal Line pages today)

**Scale/Scope**: 3 files change (`app/orders/[id]/lines/[lineId]/page.tsx` + `LineHeader.tsx`, `app/proposals/[id]/lines/[lineid]/page.tsx`, `app/quotes/[id]/lines/[lineid]/page.tsx`); no backend/API route changes are expected (see `research.md` for the one open risk around Order Line status field availability)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS. Status values are read live from Salesforce through the existing `lib/salesforce-service.ts` proxy functions already used by each page (`getOrderLinesFromSalesforce` for Orders; the existing equivalents already wired into Proposals/Quotes). No new SOQL/raw queries are added in page code, and nothing is written to PostgreSQL.
- **II. RBAC-First Feature Design**: PASS (not applicable). This feature only changes what's displayed inside pages that are already behind existing permission gates (`ProtectedRoute` / `ProtectedPageWrapper` wrapping the parent line-detail pages); it adds no new capability, route, or data-mutation path that would need a new permission check.
- **III. Next.js 15 App Router Patterns**: PASS. No changes to route structure, `params` handling, or the two auth systems. Existing `use(params)` unwrapping in all three pages is untouched.
- **IV. Multi-Tenant Isolation**: PASS. Status data flows through the same per-request, org-scoped Salesforce session/account context each page already uses; no new cross-org data access is introduced.
- **V. Simplicity & Phase-Driven Scope**: PASS. Scope is strictly "display the existing/intended status value correctly," matching the Phase 1 (Client Priority) UI-consistency work already done in `020-proposal-line-corrections`, `031-purchase-order-line-corrections`, and `042-supplier-bill-line-debit-memo-corrections`. No speculative shared-component abstraction is introduced (see Constraints above).

No violations. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/077-line-status-parity/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory is generated for this feature — it changes only what existing, unmodified API responses are read and rendered inside three pages; no API route request/response shape is added or changed (see `research.md` for the Order Line status-field verification this depends on).

### Source Code (repository root)

This is the existing Next.js App Router web application (`app/`, `app/api/`, `components/`, `lib/`, `db/`) described in `CLAUDE.md`. This feature touches only existing files inside `app/`:

```text
app/
├── orders/[id]/lines/[lineId]/
│   ├── page.tsx                      # add Status__c to OrderLineItem + line-status mapping, pass to LineHeader
│   └── components/LineHeader.tsx     # accept a line status prop, render StatusBadge next to "Line X of Y"
├── proposals/[id]/lines/[lineid]/
│   └── page.tsx                      # fix field-name typo (Status_c → Status__c) in ProposalProductItem mapping
├── quotes/[id]/lines/[lineid]/
│   └── page.tsx                      # add local StatusBadge function + render it next to "Line X of Y"
└── supplier-bills/[id]/lines/[lineid]/
    └── page.tsx                      # reference only — no changes; this is the pattern being matched
```

**Structure Decision**: Single Next.js project, no new directories or routes. Each of the three affected line-detail pages is edited independently and can ship independently (matches the P1/P2/P3 independent user stories in `spec.md`); `LineHeader.tsx` is the only shared sub-component touched, and only because Orders already externalizes its header into that file (Proposals and Quotes render their header inline in `page.tsx`, so no equivalent extraction is needed there).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Not applicable — no violations.

# Implementation Plan: Orders Landing Page — Required Corrections

**Branch**: `032-orders-landing-corrections` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/032-orders-landing-corrections/spec.md`

## Summary

Verify and lock in the Orders landing page's column layout, header behavior, hyperlinks, pagination, and default sort against the spec's authoritative requirements. Code inspection prior to planning confirmed `app/orders/page.tsx` already implements every requirement (delivered under prior spec 021, commit `0e9e85b`, 2026-07-01): the exact 17-column order/labels, Customer Order # and Proposal # as hyperlinks, six distinct Bill To/Ship To Account/Location/Contact fields, no-wrap single-line headers with ellipsis-allowed cells, a sticky first column, `Pagination` at 10 rows/page, and default sort by record name (`name`) descending. This feature therefore has no functional gap to close; its scope is a targeted verification pass plus (if the verification below surfaces any drift) minimal corrective edits confined to `app/orders/page.tsx`. No new routes, schema, or API changes are anticipated.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: Tailwind CSS, `Link` (Next.js), `SortableHeader`, `useSortableData`, `Pagination`, `formatDate()`/`displayCell()` — all existing in the codebase, same primitives used by every prior table-correction feature (016-031)

**Storage**: N/A — read-only Salesforce data via `/api/salesforce/orders` (proxies to the Apex REST endpoint `/services/apexrest/gtherp/orders`); no SOQL is built client-side, and field names are mapped from the raw Apex response to a UI-friendly shape inside `app/orders/page.tsx`'s `uiOrders` memo (lines 127-149)

**Testing**: Visual/functional — run `npm run dev`, open the Orders landing page, verify column order/labels/hyperlinks/sticky-column/header-wrap/pagination/sort per `quickstart.md`

**Target Platform**: Browser (Next.js SSR + client components)

**Performance Goals**: No degradation — this feature adds no new computation; existing memoized mapping and sort/pagination hooks are unchanged

**Constraints**: No new API routes; no new SF Apex changes; no DB schema changes; any corrective edit (should verification surface drift) is scoped to `app/orders/page.tsx` only

**Scale/Scope**: 1 file in scope (`app/orders/page.tsx`), 17 column definitions verified against spec FR-007; 0 files expected to change (verification-first plan)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | Reads continue to flow through the existing `/api/salesforce/orders` endpoint; no new DB writes; no SOQL changes |
| II — RBAC-First | ✅ PASS | No permission structure changed; the existing partner-visibility restriction hiding the Proposal hyperlink for restricted/manufacturer account types is preserved unchanged |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes; `app/orders/page.tsx` is a client component with no dynamic route params to unwrap |
| IV — Multi-Tenant Isolation | ✅ PASS | No org-scoped query logic changed; org/account context continues to flow through the existing session-derived `accountId`/`contactId` |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | Verification-first scope; reuses existing `SortableHeader`/`useSortableData`/`Pagination` primitives already proven on this exact page — no new abstractions |

No violations. No Complexity Tracking entry required.

**Post-design re-check** (after Phase 0/1 research): Phase 0 research confirmed all FRs are already satisfied by the current implementation (see `research.md`). No corrective code changes are required; all five principles remain PASS with no design changes to re-evaluate.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)

(no contracts/ — this feature exposes no new API routes or external interfaces)
```

### Source Code (files in scope)

```text
app/orders/page.tsx    # Orders landing page — column definitions, uiOrders mapping,
                        # useSortableData init, sticky/no-wrap header classes, Pagination usage
```

**Structure Decision**: Single Next.js App Router project (existing structure, no new files) — same minimal-scope pattern as features 016-031. Verification-first: `research.md` documents the current-state audit confirming every FR is already satisfied; no other files are expected to change.

## Complexity Tracking

No constitution violations — table not required.

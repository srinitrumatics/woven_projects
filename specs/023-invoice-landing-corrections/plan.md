# Implementation Plan: Invoice Landing Page — Required Corrections

**Branch**: `023-invoice-landing-corrections` | **Date**: 2026-07-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/023-invoice-landing-corrections/spec.md`

## Summary

Correct column order, labels, and hyperlinks on the Invoice landing page (`app/invoices/page.tsx`) to match the prescribed 24-column list. Unlike features 021/022 (Orders/Proposals landing pages), this page already has correct header no-wrap behavior, a sticky first column, working pagination, and a descending default sort — those four requirements are confirmation/regression guards, not new work. The real gaps are: (1) Invoice # is a click-handler styled to look like a link rather than a genuine hyperlink, (2) four new columns need to be added (Customer Quote #, Proposal #, Bill to Location, Total Price, Shipping, Taxes, Due Date, Settled Date — several already fetched but never rendered), and (3) Collection Status needs color-coding to match the pattern already used for Open Balance and the existing Status badge. All changes are pure frontend updates to one file; no new routes, no schema changes.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: Tailwind CSS, `Link` (Next.js), `SortableHeader`, `useSortableData`, `Pagination`, `useResizableColumns`, `displayCell()`/`formatCurrency()`/`formatDate()` — all existing in the codebase, same primitives used by every prior table-correction feature (016–022)

**Storage**: N/A — read-only Salesforce data via `/api/salesforce/invoices?action=list`, which returns raw `Invoice__c` records; the frontend maps whichever fields it needs

**Testing**: Visual/functional — run `npm run dev`, navigate to `/invoices`, verify column order, labels, hyperlinks, color-coding, and data values per `quickstart.md`

**Target Platform**: Browser (Next.js SSR + client components)

**Performance Goals**: No degradation — column reordering, relabeling, and additional field mappings add negligible overhead

**Constraints**: No new API routes; no new SF Apex changes; no DB schema changes; all changes scoped to `app/invoices/page.tsx`. Two field mappings (Customer Quote #, Settled Date) and one partial mapping (Proposal #) are inferred from sibling-object conventions and flagged for live-org verification during implementation (see `research.md`); if unavailable, columns degrade gracefully to "-" rather than breaking the page.

**Scale/Scope**: 1 file, 1 table, 24 columns

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | Reads continue to flow through the existing `/api/salesforce/invoices` endpoint; no new DB writes; field-mapping additions only |
| II — RBAC-First | ✅ PASS | No permission structure changed; existing `isManufacturer` gating on Purchase Order/Proposal Name/Customer Order hyperlinks is preserved unchanged |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes; modifying an existing client component only; Invoice # link uses the same `Link` component already used elsewhere on this page |
| IV — Multi-Tenant Isolation | ✅ PASS | No org-scoped query logic changed |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | Targeted corrections to one existing component; no new abstractions; Collection Status badge reuses the existing `StatusBadge` color-pattern convention rather than introducing a new one |

No violations. No Complexity Tracking entry required.

**Post-design re-check** (after Phase 0/1 research): The new field mappings (`customerQuoteId`, `customerQuoteName`, `proposalNumber`, `billToLocation`, `totalPrice`, `shipping`, `taxes`, `settledDate`) are read-only additions to an inline mapping local to this one page — no shared type requires a breaking change (the `Invoice` interface can extend with optional fields, matching the pattern already used for `dueDate`/`collectionStatus`). Two fields (Customer Quote #, Settled Date) and part of a third (Proposal #) carry implementation-time verification risk against the live org, documented in `research.md` and `quickstart.md`, but this does not change the architectural approach or violate any principle — worst case, a column shows "-" until a backend field gap is separately addressed. All five principles remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/023-invoice-landing-corrections/
├── plan.md              # This file
├── research.md          # Phase 0 output — current-state audit + field-source confirmation/inference log
├── data-model.md         # Phase 1 output — field-mapping catalogue and column-order delta
└── quickstart.md        # Phase 1 output — validation scenarios

(no contracts/ — this feature exposes no new API routes or external interfaces)
```

### Source Code (files modified)

```text
app/invoices/
└── page.tsx    # Column widths config, invoice-mapping (useEffect), table header row, table body row, empty-state colSpan, Collection Status badge renderer
```

**Structure Decision**: Single Next.js App Router project (existing structure, no new files) — same minimal scope pattern as features 021 (Orders) and 022 (Proposals) landing pages.

## Complexity Tracking

No constitution violations — table not required.

# Implementation Plan: Explicit Product/Service Record-Type Classification in Summary Cards

**Branch**: `113-record-type-classification` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/113-record-type-classification/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

All six detail-page Summary cards (Order, Quote, Invoice, Supplier Bill, Purchase Order, Proposal) split lines into Products/Services rows. Five already compute the right totals today, but each does it differently — some by subtracting a Services count from a total, which happens to work only because every real line's classification falls into one of eight known values. Proposal is outright broken: its Products filter only matches the single literal value `"Product"`, so any line classified `Phantom`/`Bundle`/`Kit`/`Discounts`/`Digital`/`Make` matches neither its Products nor Services filter and vanishes from both rows (live-verified on proposal `a1EQL0000056p6b2AA`: 2 `Digital` lines showed `(0) Products` / `(0) Services`). The fix, per `research.md`, is a single shared helper (`lib/utils/product-record-type.ts`) exporting `isServiceRecordType()` — a negative match against the one value `"Services"` — that all six pages call identically. Using a negative match (not a positive allowlist of the seven product values) means any line whose classification isn't `"Services"`, known or not, counts toward Products, which is what fixes Proposal and also satisfies FR-003's "every line counted exactly once" guarantee for any future classification value. Five pages' visible output is unchanged (FR-006); only their internal comparison changes from an inline string check to the shared helper.

## Technical Context

**Language/Version**: TypeScript 5, React 19 (Next.js 15 App Router)

**Primary Dependencies**: None new. One new internal module (`lib/utils/product-record-type.ts`) consumed by six existing components: `app/orders/[id]/OrderClientPage.tsx`, `app/quotes/[id]/components/QuoteSummary.tsx`, `app/invoices/[id]/page.tsx`, `app/supplier-bills/[id]/page.tsx`, `app/purchase-orders/[id]/components/POSummary.tsx`, `app/proposals/[id]/components/ProposalSummary.tsx`.

**Storage**: N/A — no PostgreSQL schema change, no Salesforce-side change. The classification value each page reads (`Product_Record_Type__c`, exposed under varying property names — see `data-model.md`) already exists and is already fetched by all six pages today; this feature only changes how the value already in hand is compared.

**Testing**: No automated UI/data-mapping test suite exists in this repo (consistent with `111`/`112`'s plans). Verification is `npx tsc --noEmit` plus live browser verification against the Salesforce-backed dev server, per `quickstart.md` — reusing the same documents `112` verified with, plus proposal `a1EQL0000056p6b2AA` for the Proposal fix specifically.

**Target Platform**: Web (Next.js client components, evergreen browsers, light/dark mode) — unchanged.

**Project Type**: Web application (single Next.js app, no separate frontend/backend split).

**Performance Goals**: N/A — this replaces one inline string comparison with a one-line function call over an already-fetched, already-small line array; no new network calls, no measurable performance change.

**Constraints**: Order, Quote, Invoice, Supplier Bill, and Purchase Order Summary cards MUST show identical Products/Services figures before and after this change on the same document (spec FR-006/SC-003) — verified against the same documents `112` used. For every document type, Products count + Services count MUST equal the total line count, and Products subtotal + Services subtotal MUST equal the overall lines subtotal (spec FR-005), guaranteed structurally by `isServiceRecordType`'s negative-match design rather than per-page arithmetic.

**Scale/Scope**: 1 new file (`lib/utils/product-record-type.ts`) plus 6 existing files edited, each at 1-4 pre-identified comparison sites (full inventory in `data-model.md`): Order (1 site), Quote (2 sites), Invoice (4 sites), Supplier Bill (1 site), Purchase Order (1 site), Proposal (2 sites, one of which is the actual Proposal bug fix). No new routes, no schema changes, no new page files.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth** — Satisfied. No new SOQL/query construction; every classification value this feature reads is already fetched by each page's existing mapping code today (per `research.md` Decision 5). This feature only changes the comparison applied to a value already in hand — no new Salesforce read, write, or endpoint.
- **II. RBAC-First Feature Design** — N/A. No permission surface changes; the Summary cards remain gated by each detail page's existing page-level auth, unchanged by this fix.
- **III. Next.js 15 App Router Patterns** — Satisfied. No route params, no new routes/API routes; all changes are within existing page/component files plus one new plain TypeScript utility module (not a route).
- **IV. Multi-Tenant Isolation** — N/A. No change to org/account-scoping logic; the product/service classification is a product-level field orthogonal to tenant isolation.
- **V. Simplicity & Phase-Driven Scope** — Satisfied. Per `research.md` Decision 3, a single shared helper is not a premature abstraction here — unlike `112` (where each page's surrounding data shape genuinely differed enough that independent inline logic was the smaller diff), this feature's entire point (spec FR-001/002/006) is that all six pages apply the *identical* rule, so one exported function is the direct, simplest implementation of that requirement, not speculative infrastructure for a hypothetical future need.

No violations. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/113-record-type-classification/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command) — 6 decisions, live-verified classification values
├── data-model.md         # Phase 1 output (/speckit-plan command) — shared helper + per-page change inventory
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — this fix has no external API, CLI, or service contract; it only
changes how existing, already-fetched Salesforce data is classified and filtered on six pages.

### Source Code (repository root)

```text
lib/utils/
└── product-record-type.ts                        # NEW: SERVICE_RECORD_TYPE, KNOWN_PRODUCT_RECORD_TYPES, isServiceRecordType()

app/orders/[id]/OrderClientPage.tsx                # serviceItems filter (~line 1147) wrapped in isServiceRecordType()

app/quotes/[id]/components/QuoteSummary.tsx        # serviceLines/productLines filters (~lines 24-25)

app/invoices/[id]/page.tsx                         # productsSubtotal/servicesSubtotal + productCount/serviceCount (~lines 212-213, 373-374)

app/supplier-bills/[id]/page.tsx                   # serviceLines filter (~line 138)

app/purchase-orders/[id]/components/POSummary.tsx  # serviceLines filter (~line 20) — already-correct page, made explicit/shared

app/proposals/[id]/components/ProposalSummary.tsx  # productItems filter (~line 25) — the actual bug fix; serviceItems (~line 26) for consistency
```

**Structure Decision**: Single Next.js application (App Router), per `CLAUDE.md` and the
constitution's fixed technology stack. This is a cross-cutting but purely presentational/data-mapping
correction across six existing `app/*/[id]/` detail pages plus one new shared utility module in
`lib/utils/` (consistent with `lib/*-service.ts`'s existing convention of centralizing domain logic
outside page components). No new directories, routes, services, or schema are introduced. The full
per-page change inventory, including exact line numbers and current vs. fixed values, is in `data-model.md`.

## Complexity Tracking

*No constitution violations — this section is not applicable.*

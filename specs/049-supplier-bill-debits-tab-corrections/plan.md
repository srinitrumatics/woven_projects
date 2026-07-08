# Implementation Plan: Correct Supplier Bill Debit Memos Table Columns

**Branch**: `049-supplier-bill-debits-tab-corrections` | **Date**: 2026-07-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/049-supplier-bill-debits-tab-corrections/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

`app/supplier-bills/[id]/components/SupplierBillDebitsTab.tsx` renders the Debit Memos tab with
10 columns and no relationship linkage. Three relationship fields (Purchase Order, Customer
Quote, Customer Order) already flow into the component's `DebitMemo` data but are never
rendered; two more (Proposal, Taxes) don't exist in the data pipeline yet. The fix reuses a
pattern already implemented three times in this codebase (`SBLDebitMemoLinesTab.tsx`,
`SupplierBillLinesTable.tsx`, `PODebitMemoTable.tsx`): rename the identifier column, add the
relationship columns with an `isManufacturer`-gated hyperlink (`useUserSession` +
`Account_Record_Type__c` check), add a Taxes column, reorder everything to the approved 16-column
list, and extend the `DebitMemo` type + `page.tsx` mapping for the two net-new fields
(Proposal #/Name, Taxes) so they render via the existing empty-value placeholder until the
backend supplies real data.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19 (Next.js 15 App Router)

**Primary Dependencies**: existing `components/ui/SortableHeader`, `hooks/useSortableData`,
`hooks/useResizableColumns`, `components/ui/Pagination`, `lib/utils/formatting`
(`displayCell`/`formatCurrency`/`formatDate`), `next/link`, and
`components/UserSessionContext`'s `useUserSession` — all already imported and proven in the
sibling components this plan copies from; no new dependencies.

**Storage**: N/A — presentation-only change to a Next.js frontend component. Business data
continues to come exclusively from Salesforce via the existing `/api/supplier-bills` proxy
(Constitution Principle I); this plan adds two optional fields to the client-side `DebitMemo`
TypeScript type and its mapping, not to any database schema.

**Testing**: No automated UI test suite exists for these table components; validation is manual
per `quickstart.md`, matching how features 042, 047, and 048 were verified in this repo.

**Target Platform**: Web browser (desktop-focused data tables), both light and dark mode.

**Project Type**: Existing single Next.js web application — frontend-only change, two files.

**Performance Goals**: N/A — client-side rendering of already-loaded/paginated data; no new
network calls.

**Constraints**: Must not change existing sorting, column resizing, or pagination behavior; must
not touch the seven already-correct columns' content or formatting; new relationship columns
must never render a broken link (`href` containing `undefined`) — degrade to the existing
empty-value placeholder instead, per spec FR-009; Proposal # and Customer Quote #/Customer Order
# hyperlinks must use the exact same `isManufacturer` gating condition already used by sibling
components in this directory, not a new/different rule.

**Scale/Scope**: Two files — `app/supplier-bills/[id]/components/SupplierBillDebitsTab.tsx`
(column rendering) and `app/supplier-bills/[id]/page.tsx` + `app/supplier-bills/types.ts`
(two new optional fields on the existing `Debit_Memo__c` mapping/type).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **UI Component Conventions** (Technology Stack Constraints): PASS — continues using
  `SortableHeader` + `useSortableData` + `useResizableColumns` + `Pagination`, unchanged from
  today; no new table convention introduced.
- **Principle I (Salesforce as Single Source of Truth)**: PASS — no writes to the app's own
  database; the two new fields (`proposalName`/`proposalNumber`/`proposalId`, `totalTaxes`) are
  read-only pass-throughs of the same Apex REST proxy already used for every other field on this
  type, guarded to render an empty placeholder if the backend hasn't added them yet — no raw
  query is added to a page/API route.
- **Principle V (Simplicity & Phase-Driven Scope)**: PASS — the fix reuses an existing, already
  three-times-shipped in-codebase pattern (`isManufacturer` gating) verbatim; no new shared
  component or abstraction is introduced (see research.md's "Alternatives considered" for why a
  shared `DebitMemoTable` was rejected).
- **Principle III (Next.js App Router Patterns)**: N/A — no routing/params/auth changes.
- **Principle II (RBAC-First Feature Design)**: N/A — this is an account-type display rule
  (Supplier vs. Hybrid), not a permission gate; no `PermissionGate`/`permission-service` change
  is implicated.
- **Principle IV (Multi-Tenant Isolation)**: N/A — no query scoping changes; data continues to
  flow from the same per-org-scoped Supplier Bill endpoint.

No violations. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/049-supplier-bill-debits-tab-corrections/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command) — skipped, no external interface
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/supplier-bills/[id]/components/SupplierBillDebitsTab.tsx  # Column rename/add/reorder,
                                                                # isManufacturer gating,
                                                                # Taxes column — primary file

app/supplier-bills/[id]/page.tsx                               # Debit_Memo__c mapping block
                                                                # (~line 220): add
                                                                # proposalName/proposalNumber/
                                                                # proposalId/totalTaxes fields

app/supplier-bills/types.ts                                    # DebitMemo interface (~line 114):
                                                                # add the same four optional
                                                                # fields
```

**Structure Decision**: Existing single Next.js application (App Router) — no new files,
directories, or shared components. The entire fix is confined to the three files above, applying
a gating/column pattern that already exists elsewhere in the same directory tree
(`SBLDebitMemoLinesTab.tsx`, `SupplierBillLinesTable.tsx`) and on the Purchase Order side
(`PODebitMemoTable.tsx`).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

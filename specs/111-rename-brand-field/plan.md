# Implementation Plan: Product Brand Field Rename (`Product_Brand_Name__c` → `Brand_Name__c`)

**Branch**: `111-rename-brand-field` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/111-rename-brand-field/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

The Salesforce org renamed its product-brand custom field from `Product_Brand_Name__c` to `Brand_Name__c` (namespaced sync variant: `gtherp__Product_Brand_Name__c` → `gtherp__Brand_Name__c`). A full-repo inventory (`data-model.md`) found 60 reference lines (63 occurrences) across 30 files in two independent pipelines: 27 Apex REST-backed line-item pages (Orders, Invoices, Proposals, Quotes, Purchase Orders, Shipments, Supplier Bills, Inventory) that read the field as a plain object property, and 3 files in the SOQL/Algolia product-sync pipeline (`lib/product-load-service.ts`, `lib/products-service.ts`, `lib/product-sync-service.ts`). The technical approach is a scoped literal-string rename at every identified site, with two follow-on corrections identified during research: (1) collapsing fallback expressions/interfaces that already listed both the old and new name so the rename doesn't produce a literal duplicate reference, and (2) renaming the internal sort-key/column-width identifiers in `SBLDebitMemoLinesTab.tsx` that must stay in sync with the property name for column sorting to keep working. No schema, API contract, or UI behavior changes — verified by static grep + type-check + manual browser spot-check per the project's existing (test-suite-free) verification convention.

## Technical Context

**Language/Version**: TypeScript 5, React 19 (Next.js 15 App Router)

**Primary Dependencies**: None new. Touches existing `lib/*-service.ts` Salesforce data-mapping layers and existing page/tab components under `app/`.

**Storage**: N/A — no PostgreSQL schema change; this only changes which Salesforce field-name string is read/queried. No `db:generate`/`db:migrate` needed.

**Testing**: No automated UI/data-mapping test suite exists in this repo (`npm run test:rbac` and product-sync-adjacent scripts cover unrelated domains). Verification is `grep` (zero remaining old-name references, zero duplicate fallback references), `npx tsc --noEmit`, and manual browser spot-checks per `quickstart.md` — consistent with this project's existing convention (see `110-fix-add-to-order-null-crash/plan.md`).

**Target Platform**: Web (Next.js client/server components, evergreen browsers, light/dark mode) — unchanged.

**Project Type**: Web application (single Next.js app, no separate frontend/backend split).

**Performance Goals**: N/A — no measurable performance change; this is a field-name text correction, not a logic or query-shape change (query still selects the same field, only its name changes).

**Constraints**: Brand Name display MUST NOT regress on any of the 30 identified files (spec FR-003); the product-sync pipeline MUST keep completing without field-not-found errors (spec FR-004); no unrelated Salesforce field name may be touched (spec FR-006).

**Scale/Scope**: 30 files, 60 reference lines (63 occurrences), split into 27 files (Apex REST line-item pages) + 3 files (SOQL/Algolia sync). 11 of those sites additionally require collapsing a now-duplicate fallback reference (`research.md` Decision 2). One file (`SBLDebitMemoLinesTab.tsx`) additionally requires renaming two internal sort-key/column-width identifiers (`research.md` Decision 3). No new files, no new routes, no schema changes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth** — Satisfied. The one SOQL `SELECT` site affected (`lib/product-load-service.ts:53`) is already encapsulated inside a domain-specific `lib/*-service.ts` file, per the constitution's requirement; this rename does not move query construction into pages/components, and pages continue to only read already-fetched data. No new writes to PostgreSQL for business data are introduced.
- **II. RBAC-First Feature Design** — N/A. No permission surface changes; `PermissionGate` usage and server-side permission checks on every touched page are untouched — only the brand-field key name changes inside existing data-mapping code.
- **III. Next.js 15 App Router Patterns** — Satisfied. No route params, no new routes/API routes; all changes are within existing page/component files and existing `lib/*-service.ts` files. Neither auth system is touched.
- **IV. Multi-Tenant Isolation** — N/A. No change to org-scoping logic; the field being renamed is a product-level Salesforce field or­thogonal to tenant isolation, and no query's org/account scoping predicate is altered.
- **V. Simplicity & Phase-Driven Scope** — Satisfied. This is the smallest change that corrects every reference to the renamed field — a direct literal rename plus the two directly-necessitated corrections (dedup, sort-key consistency) — no speculative abstraction (e.g. no new "field name constants" module) is introduced beyond what the constitution's existing patterns already use (inline fallback chains, as seen throughout the codebase today).

No violations. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/111-rename-brand-field/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command) — full 30-file occurrence inventory
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — this rename has no external API, CLI, or service contract; it only
changes which Salesforce field-name string existing internal code reads/queries.

### Source Code (repository root)

```text
lib/
├── product-load-service.ts     # SOQL SELECT (namespaced field) + read site — Pipeline B
├── products-service.ts         # Read site with fallback dedup — Pipeline B
└── product-sync-service.ts     # Read site with fallback dedup — Pipeline B

app/
├── inventory/page.tsx
├── invoices/[id]/
│   ├── page.tsx
│   └── lines/[lineid]/
│       ├── page.tsx
│       └── components/InvoiceLineCreditMemoTab.tsx
├── proposals/[id]/
│   ├── page.tsx
│   └── lines/[lineid]/page.tsx          # type-decl dedup + fallback dedup (line 446)
├── purchase-orders/[id]/
│   ├── components/{POLinesTable,POSerialNumbersTable}.tsx
│   └── lines/[lineid]/
│       ├── page.tsx
│       └── components/{PODebitMemoLinesTab,PORtvLinesTab,POSerialNumberLogLinesTab,POSupplierBillLinesTable}.tsx   # each has a type-decl dedup
├── quotes/[id]/
│   ├── page.tsx
│   └── lines/[lineid]/
│       ├── page.tsx                      # type-decl dedup + fallback dedup (line 191)
│       └── components/{QuoteLineFulfillmentsTab,QuoteLinePurchasesTab,QuoteLineReturnsTab}.tsx
├── shipments/[id]/
│   ├── components/{InventoryTab,SerialNumbersTab,ShipmentLinesTab}.tsx
│   └── lines/[lineid]/components/{InventoryTab,SerialNumbersTab,ProductInformationCard}.tsx   # ProductInformationCard has a fallback dedup (×2)
└── supplier-bills/[id]/
    ├── page.tsx
    └── lines/[lineid]/
        ├── page.tsx                      # fallback dedup
        └── components/SBLDebitMemoLinesTab.tsx   # type-decl + internal sort-key/columnWidths rename (Decision 3)
```

**Structure Decision**: Single Next.js application (App Router), per `CLAUDE.md` and the
constitution's fixed technology stack. This is a cross-cutting but purely textual correction
inside existing `lib/*-service.ts` data-mapping files and existing `app/` line-item/catalog
pages — no new directories, routes, services, or schema are introduced. The full file-by-file
breakdown, including which sites also need fallback-chain dedup or sort-key renames, is in
`data-model.md`.

## Complexity Tracking

*No constitution violations — this section is not applicable.*

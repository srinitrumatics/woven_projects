# Implementation Plan: Fix Broken Data Table Hyperlinks

**Branch**: `045-fix-broken-datatable-links` | **Date**: 2026-07-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/045-fix-broken-datatable-links/spec.md`

## Summary

Fix three confirmed broken hyperlinks (Customer Quote Line links on the Purchase Order Line detail page's Supplier Bill Lines, RTV Lines, and Debit Memo Lines tabs, all rendering `/quotes/undefined/lines/{id}` because the guard checks `Customer_Quote_Line__c` while the href uses the always-absent `Customer_Quote__c`), one defensive-coding gap (the Supplier Bill Lines tab's own "Supplier Bill Line" column links unconditionally on `Supplier_Bill__c` while its sibling "Supplier Bill #" column correctly guards the same field), and three genuinely dead links (the Inventory landing page's "Average Days Aged" tile — which, unlike the portal's other three summary tiles, has no corresponding filter state in `TabFilter` at all, so its `href="#"` links should be removed rather than wired to a fake action). All five fixes were located via a full audit of ~260 dynamic hyperlinks across 231 files in this session; no other broken links were found.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: `Link` (Next.js) — no new dependencies; this reuses the exact dual-ID guard pattern already correct on ~15 sibling components in this codebase (e.g., `POLinesTable.tsx:140`, `SBLDebitMemoLinesTab.tsx:123`, `InvoiceLineItems.tsx:122`)

**Storage**: N/A — no data-fetching changes. The root cause of the Customer Quote Line defect is a backend data-availability gap (`Customer_Quote__c` is never returned by the `Purchase_Order_Line__c`-scoped `action=bills`/`action=returns` endpoints, confirmed via live query in a prior session); this plan fixes the frontend to degrade gracefully rather than assuming a backend change.

**Testing**: Visual/functional — run `npm run dev`, open the three affected tabs as a Hybrid-type account, inspect every rendered Customer Quote Line link's `href` for the literal string `undefined`; click the Inventory "Average Days Aged" tile's three elements and confirm they no longer render as links, per `quickstart.md`

**Target Platform**: Browser (Next.js SSR + client components)

**Performance Goals**: No impact — the fixes narrow an existing conditional (add an `&&` clause) or remove three `<Link>` wrappers; no new renders, no new state

**Constraints**: No new API routes, no data/type changes beyond what's already declared (`Customer_Quote__c` and `Supplier_Bill__c` are already optional fields on their respective local interfaces — this is a guard-logic fix, not a type change). Scoped to exactly 4 files: 3 identical one-line guard edits (US1) + 1 identical one-line guard edit (US2) in a 4th location within one of the same 3 files, plus 1 file with 3 `<Link>` removals (US3).

**Scale/Scope**: 4 files touched, 5 total edit sites (3 for US1, 1 for US2, 3 removed `<Link>` wrappers in 1 file for US3)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | No data-fetching or field-mapping changes; the fix only narrows existing conditionals using fields already declared and already fetched |
| II — RBAC-First | ✅ PASS | No permission logic touched; `isManufacturer` gating is unchanged, only the inner truthy-check gains an additional `&&` clause |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes; four existing client components edited for guard-logic/JSX-removal only |
| IV — Multi-Tenant Isolation | ✅ PASS | No query logic touched |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | Reuses the exact dual-ID guard pattern (`fieldA && fieldB ? <Link>... : ...`) already proven correct on ~15 other components in this codebase — no new abstraction |

No violations. No Complexity Tracking entry required.

**Post-design re-check** (after Phase 0/1 research): Confirmed via research.md that all three US1 edit sites are single-line, mechanically identical (`line.Customer_Quote_Line__c ?` → `line.Customer_Quote_Line__c && line.Customer_Quote__c ?`), the US2 edit is the same pattern for a different field pair, and the US3 fix removes JSX with zero remaining references elsewhere (each `<Link href="#">` wraps only its own `<p>`/`<span>` with no shared state). All five principles remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/045-fix-broken-datatable-links/
├── plan.md              # This file
├── research.md          # Phase 0 output — audit-derived findings and exact fix per site
├── data-model.md        # Phase 1 output — before/after guard logic per file
└── quickstart.md        # Phase 1 output — validation scenarios for all 3 user stories

(no contracts/ — this feature exposes no new API routes or external interfaces)
```

### Source Code (files modified)

```text
app/purchase-orders/[id]/lines/[lineid]/components/
├── POSupplierBillLinesTable.tsx    # US1 (L153 guard fix) + US2 (L138 guard fix)
├── PORtvLinesTab.tsx               # US1 (L143 guard fix)
└── PODebitMemoLinesTab.tsx         # US1 (L147 guard fix)

app/inventory/page.tsx              # US3 (remove 3 dead <Link href="#"> wrappers, L427/431/434)
```

**Structure Decision**: Single Next.js App Router project (existing structure, no new files) — four independent single-file edits, each a narrow guard-condition change or dead-JSX removal, with no shared dependency between the US1/US2 group (Purchase Order Line tabs) and US3 (Inventory landing page).

## Complexity Tracking

No constitution violations — table not required.

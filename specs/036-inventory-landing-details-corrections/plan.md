# Implementation Plan: Inventory Landing Page & Inventory Details Page — Required Corrections

**Branch**: `036-inventory-landing-details-corrections` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/036-inventory-landing-details-corrections/spec.md`

## Summary

Verify and lock in the My Inventory landing page and Inventory Details page against this request's exact column order/labels/formatting requirements, and fix two confirmed real defects on the My Inventory landing page only. Direct code inspection prior to planning found that a prior corrections pass (spec 026, commit `19148f9`) already correctly implemented nearly everything this request asks for on both pages — including the column order/labels, full-text single-line headers, sticky first columns, pagination, default sort directions, Product Name's hyperlink, Brand Name's field mapping (already `Brand_Name__c` with a `gtherp__Brand_Name__c` fallback, matching this request's explicit API name), Total OH Value's field mapping (`Total_Price__c`, matching this request's explicit API name) and non-bold formatting, the combined "PO # | RMA #" column, the correctly-spaced "Shipping Manifest" header, and the Inventory Details page's correct Qty Available color logic (`< 1` threshold). Two genuine defects were found and confirmed by direct inspection, both on `app/inventory/page.tsx`: the Qty Available color logic at line 673 uses strict `=== 0` instead of a `<= 0` threshold (a negative value, a data anomaly, would incorrectly render green instead of red); and the empty-state row's `colSpan={16}` at line 633 doesn't match the table's actual 15 columns (1 checkbox + 13 data columns + 1 Action column). This plan scopes corrective work to those two lines only; everything else is verification.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: Tailwind CSS, `Link` (Next.js), `SortableHeader`, `Pagination`, `useSortableData`, `useResizableColumns`, `formatCurrency()`/`formatNumber()`/`displayCell()` — all existing in the codebase, same primitives used by every prior table-correction feature (016-035)

**Storage**: N/A — read-only Salesforce data; `app/inventory/page.tsx` fetches from an existing inventory API endpoint, `app/inventory/[id]/page.tsx` fetches inventory positions for a specific product; no mapping changes are required for this feature since no new columns are added

**Testing**: Visual/functional — run `npm run dev`, open both pages, and verify column order/labels/formatting per `quickstart.md`, with particular attention to a record with Qty Available at 0 and (if seedable) a negative value

**Target Platform**: Browser (Next.js SSR + client components)

**Performance Goals**: No degradation — a one-character threshold change and a `colSpan` numeral fix add zero overhead

**Constraints**: No new API routes; no new SF Apex changes; no DB schema changes; no new columns or field mappings — this is the narrowest-scope feature in this corrections series, touching two single-line fixes in one file

**Scale/Scope**: 1 file touched (`app/inventory/page.tsx`), 2 line-level fixes; `app/inventory/[id]/page.tsx` requires verification only, no code changes anticipated

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | No query or mapping logic changed; both fixes are pure UI-logic corrections (a comparison operator and a numeral) |
| II — RBAC-First | ✅ PASS | No permission structure changed |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes; existing client components only |
| IV — Multi-Tenant Isolation | ✅ PASS | No org-scoped query logic changed |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | The narrowest possible scope — two single-line fixes confirmed by direct code inspection, no speculative rework of already-correct code |

No violations. No Complexity Tracking entry required.

**Post-design re-check** (after Phase 0/1 research): Both fixes are isolated to `app/inventory/page.tsx` and touch no shared state, no other component, and no data-fetching logic. All five principles remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (files in scope)

```text
app/inventory/page.tsx        # Qty Available color threshold fix (line 673), colSpan fix (line 633)
app/inventory/[id]/page.tsx   # Verification only — no code changes anticipated
```

**Structure Decision**: Single Next.js App Router project (existing structure, no new files) — the narrowest-scope feature in this corrections series (016-035), touching two single-line defects in one file plus a verification pass on a sibling page.

## Complexity Tracking

No constitution violations — table not required.

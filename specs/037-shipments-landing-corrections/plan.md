# Implementation Plan: Shipments Landing Page — Required Corrections

**Branch**: `037-shipments-landing-corrections` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/037-shipments-landing-corrections/spec.md`

## Summary

Verify and lock in the Shipments landing page against this request's exact 28-column order/labels/hyperlink/field-mapping requirements. Direct code inspection prior to planning (background audit agent, cross-checked against prior spec 028 and this request's column list) found zero discrepancies: `app/shipments/page.tsx` already correctly implements the full column order and labels, Shipping Manifest #/Customer Quote #/Proposal #/Customer Order # hyperlinks with `isManufacturer` account-type gating, the Proposal #/Proposal Name split, Ship to Contact and Drop Ship columns, all six Box dimension columns with the exact dual-namespace API field fallbacks requested (`Box__c ?? gtherp__Box__c`, `Case_Length__c ?? gtherp__Case_Length__c`, `Case_Width__c ?? gtherp__Case_Width__c`, `Case_Height__c ?? gtherp__Case_Height__c`, `Case_Net_Weight__c ?? gtherp__Case_Net_Weight__c`, `Case_Gross_Weight__c ?? gtherp__Case_Gross_Weight__c`), Planned Ship Date (`Ship_Date__c ?? gtherp__Ship_Date__c`) and Ship Confirmed Date (`Delivered_Date__c ?? gtherp__Delivered_Date__c`) with correct labels, distinct Estimated/Actual Delivery Date columns, Tracking Number/Status, full-text single-line headers (`truncate={false}` on every `SortableHeader`), a sticky first column, pagination, default Record ID DESC sort, and a `colSpan={28}` empty-state row that correctly matches the actual column count. No code defects were found on this page — unlike feature 036 (Inventory), which had two genuine one-line bugs. This plan therefore scopes zero corrective code changes; all work is verification and spec lock-in, matching the pattern already used for feature 032 (Orders Landing).

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: Tailwind CSS, `Link` (Next.js), `SortableHeader`, `Pagination`, `useSortableData`, `useResizableColumns`, `displayCell()`/`formatCurrency()`/`formatDate()`/`formatNumber()` — all existing in the codebase, same primitives used by every prior table-correction feature (016-036)

**Storage**: N/A — read-only Salesforce data; `app/shipments/page.tsx` fetches from an existing shipments API endpoint backed by `lib/shipment-service.ts`; no mapping changes are required since no new columns are added and all requested API field names are already correctly mapped

**Testing**: Visual/functional — run `npm run dev`, open the Shipments landing page, and verify column order/labels/hyperlinks/field values per `quickstart.md`

**Target Platform**: Browser (Next.js SSR + client components)

**Performance Goals**: No degradation — zero code changes anticipated

**Constraints**: No new API routes; no new SF Apex changes; no DB schema changes; no new columns or field mappings — this is a pure verification/lock-in feature with zero anticipated code changes, the first in this corrections series (after 032) to find zero defects

**Scale/Scope**: 1 file in scope for verification (`app/shipments/page.tsx`); zero files anticipated to require edits

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | No query or mapping logic changed; all field mappings already correctly encapsulated in `lib/shipment-service.ts` |
| II — RBAC-First | ✅ PASS | No permission structure changed; existing `isManufacturer`-gated hyperlink visibility preserved unchanged |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes; existing client component only |
| IV — Multi-Tenant Isolation | ✅ PASS | No org-scoped query logic changed |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | Zero speculative rework of already-correct code; verification-only scope confirmed by direct code inspection |

No violations. No Complexity Tracking entry required.

**Post-design re-check** (after Phase 0/1 research): No code changes are anticipated in this feature; all five principles remain PASS with no design surface introduced.

## Project Structure

### Documentation (this feature)

```text
specs/037-shipments-landing-corrections/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command) — skipped, no external interface change
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (files in scope)

```text
app/shipments/page.tsx   # Verification only — no code changes anticipated
```

**Structure Decision**: Single Next.js App Router project (existing structure, no new files) — a pure verification/lock-in feature confirming `app/shipments/page.tsx` already matches this request's requirements exactly, with zero anticipated code changes.

## Complexity Tracking

No constitution violations — table not required.

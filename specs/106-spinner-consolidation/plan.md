# Implementation Plan: Spinner Consolidation

**Branch**: `wovn_mathu` (no dedicated feature branch — no `before_specify`/`before_plan` git hook configured, consistent with `079`-`105`) | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/106-spinner-consolidation/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

The largest remaining audit finding, scoped down after a full-codebase investigation of all 66 `animate-spin` occurrences confirmed they fall into 4 distinct shapes — this feature covers only the 2 that genuinely match `components/ui/LoadingSpinner.tsx`'s existing design (confirmed imported nowhere in the app today). Bucket A (16 files) is the "whole page is loading" spinner, an exact match for `LoadingSpinner`'s existing `size="md"`. Bucket B (10 files, 11 occurrences) is the smaller "this tab panel is loading" spinner; since `LoadingSpinner`'s `size="sm"` has zero existing call sites, this feature safely redefines it from an unused 24px to the real-world 32px Bucket B needs, rather than inventing a new size name. 2 confirmed off-brand colors (`border-blue-600` instead of the brand token) are corrected automatically as a side effect of the migration. Inline button/icon spinners (~25+ occurrences across a genuinely different shape) are explicitly out of scope — a separate initiative requiring a different, smaller shared primitive.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client/server components

**Primary Dependencies**: None new — `LoadingSpinner` already exists at `components/ui/LoadingSpinner.tsx`; this feature imports and calls it (plus adjusts its own `size="sm"` definition), it does not create a new component

**Storage**: N/A — no schema, query, or data-fetching changes anywhere in this feature

**Testing**: Manual/visual verification per `quickstart.md`, consistent with `077`-`105` (no automated UI test suite exists); plus `npx tsc --noEmit`

**Target Platform**: Web (desktop + responsive), light and dark mode (`LoadingSpinner` already supports both)

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — no new dependency, no new network calls; swapping hand-rolled markup for an existing component call has no meaningful performance implication

**Constraints**:
- FR-003: any text label that previously accompanied a spinner must be preserved (via `LoadingSpinner`'s `text` prop).
- FR-005: `LoadingSpinner`'s `size="sm"` redefinition is safe only because it has zero existing call sites — verified before this spec was authored.
- FR-006: inline button/icon spinners (~25+ occurrences) must not be modified.
- FR-007: no business logic, data-fetching, or Salesforce read/write changes anywhere — every change is presentation-layer.

**Scale/Scope**: 25 files touched (24 consumer files across 27 spinner-migration edits, plus `LoadingSpinner.tsx` itself gaining a 1-line size redefinition) — no new files, no deletions, no new dependency. This is the largest single spec in this audit-remediation series by file count.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS (not applicable). No data-layer changes anywhere in this feature.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability, route, or permission surface.
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes. No new props beyond `LoadingSpinner`'s own already-existing `size`/`text` props.
- **IV. Multi-Tenant Isolation**: PASS (not applicable). No data scoping involved.
- **V. Simplicity & Phase-Driven Scope**: PASS. This feature adopts an already-existing shared component exactly as it was designed — no new abstraction. Inline button/icon spinners are explicitly deferred rather than force-fitted onto a component whose shape doesn't suit them (YAGNI in the other direction: don't stretch an existing primitive past its design).

No violations. Complexity Tracking table is empty — nothing to justify.

## Project Structure

### Documentation (this feature)

```text
specs/106-spinner-consolidation/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — every change is an internal JSX/className edit calling an already-existing shared component, with no external API/interface surface.

### Source Code (repository root)

Existing Next.js App Router web application (`app/`, `components/`) per `CLAUDE.md`.

```text
components/ui/LoadingSpinner.tsx                                                          # fix: sizeClasses.sm "w-6 h-6" -> "w-8 h-8"

# US1 — full-page loading spinners (16 files) -> <LoadingSpinner size="md" />
app/invoices/[id]/page.tsx
app/inventory/[id]/page.tsx
app/invoices/[id]/lines/[lineid]/page.tsx
app/orders/create/page.tsx
app/orders/[id]/lines/[lineId]/page.tsx
app/products/[id]/page.tsx
app/proposals/[id]/page.tsx
app/profile/page.tsx
app/proposals/[id]/lines/[lineid]/page.tsx
app/purchase-orders/[id]/lines/[lineid]/page.tsx
app/quotes/[id]/page.tsx
app/quotes/[id]/lines/[lineid]/page.tsx
app/shipments/[id]/page.tsx
app/shipments/[id]/lines/[lineid]/page.tsx
app/supplier-bills/[id]/page.tsx
app/supplier-bills/[id]/lines/[lineid]/page.tsx

# US2 — tab-panel loading spinners (10 files, 11 occurrences) -> <LoadingSpinner size="sm" />
app/products/[id]/components/ComplianceCertsTab.tsx
app/products/[id]/components/DatasheetsTab.tsx
app/products/[id]/components/EditProductTabs.tsx                                          # 2 occurrences, also off-brand blue-600 -> corrected
app/purchase-orders/[id]/lines/[lineid]/page.tsx                                          # 2nd occurrence in this file (tab-panel), distinct from its US1 occurrence
app/quotes/[id]/lines/[lineid]/components/QuoteLineFulfillmentsTab.tsx
app/quotes/[id]/lines/[lineid]/components/QuoteLinePurchasesTab.tsx
app/quotes/[id]/lines/[lineid]/components/QuoteLineReturnsTab.tsx
app/supplier-bills/[id]/lines/[lineid]/page.tsx                                            # 2nd occurrence in this file (tab-panel), distinct from its US1 occurrence
components/ui/DataTable.tsx                                                                # TableLoadingState, also fixes horizontal->vertical layout
app/home/page.tsx                                                                          # also off-brand blue-600 -> corrected
```

**Structure Decision**: Single Next.js project. 25 files touched (24 consumer files + `LoadingSpinner.tsx`), no new files, no deletions, no new dependency. `LoadingSpinner.tsx`'s size redefinition (US2's prerequisite) must land before any Bucket B call site is migrated, to avoid a temporary size mismatch. US1 (16 independent files) and US2 (10 independent files, 2 of which overlap with US1's file list in non-overlapping line ranges) can otherwise proceed independently.

## Complexity Tracking

*No violations — table intentionally empty.*

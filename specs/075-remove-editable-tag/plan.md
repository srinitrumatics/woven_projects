# Implementation Plan: Remove "Editable" Tag and Align Field Styling on Purchase Order Line Page

**Branch**: `075-remove-editable-tag` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/075-remove-editable-tag/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Remove the small "Editable" text badge shown next to the Promise Date and Tracking Number labels on the Purchase Order Line detail page (`app/purchase-orders/[id]/lines/[lineid]/page.tsx`), and bring the field label/input presentation on that page into closer visual alignment with the pattern already used on the Order Line detail page (`app/orders/[id]/lines/[lineId]/page.tsx` and its `ProductInfo.tsx` component). This is a presentation-only change: no data fetching, save/persistence, validation, or status-based editability logic is modified — the existing `isLineEditable` conditional rendering and `handleSaveLine` flow (delivered in feature 074) remain byte-for-byte behaviorally identical.

## Technical Context

**Language/Version**: TypeScript, React 19 (Next.js 15 App Router), existing codebase — no version changes

**Primary Dependencies**: Next.js 15, Tailwind CSS (utility classes only, no new dependencies)

**Storage**: N/A — no data model, API, or database changes; this feature touches JSX markup and CSS classes only

**Testing**: Manual visual verification in the browser (light + dark mode) comparing the Purchase Order Line page against the Order Line page reference; `npm run lint` for static checks; no new automated test suite is warranted for a class-name/markup-only change

**Target Platform**: Web browser (existing WOVN Client & Partner Portal, main portal auth surface)

**Project Type**: Single Next.js web application (existing project structure, no new project/package)

**Performance Goals**: N/A — no runtime behavior or data-flow change; rendering cost is unaffected by removing a `<span>` and adjusting class names

**Constraints**: MUST NOT alter the `isLineEditable` status gate, the save/error-handling flow, or any data fetched/submitted by the page; changes are limited to JSX markup and Tailwind class names within the existing file

**Scale/Scope**: Single file edit — `app/purchase-orders/[id]/lines/[lineid]/page.tsx` (the Promise Date and Tracking Number field blocks specifically); `app/orders/[id]/lines/[lineId]/page.tsx` and `app/orders/[id]/lines/[lineId]/components/ProductInfo.tsx` are read-only style references and are not modified

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth** — N/A. No data reads/writes change; `lib/purchase-order-service.ts` and the `/api/purchase-orders` route are untouched.
- **II. RBAC-First Feature Design** — N/A. No new functionality is exposed; existing permission gates (if any wrap this route) are untouched.
- **III. Next.js 15 App Router Patterns** — PASS. The file already unwraps `params` via `use(params)`; this feature does not touch that code path at all.
- **IV. Multi-Tenant Isolation** — N/A. No query or org-scoping logic is touched.
- **V. Simplicity & Phase-Driven Scope** — PASS. This is a minimal, presentation-only cleanup strictly within Phase 1 scope; no speculative abstraction is introduced (no new shared component is extracted unless directly needed for the two-field change).

No violations. Nothing to record in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/075-remove-editable-tag/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/
├── purchase-orders/
│   └── [id]/
│       └── lines/
│           └── [lineid]/
│               └── page.tsx          # MODIFIED: remove "Editable" badge, align field styling (Promise Date, Tracking Number blocks)
│
└── orders/
    └── [id]/
        └── lines/
            └── [lineId]/
                ├── page.tsx                        # REFERENCE ONLY — not modified
                └── components/
                    ├── LineHeader.tsx               # REFERENCE ONLY — not modified
                    └── ProductInfo.tsx               # REFERENCE ONLY — not modified
```

**Structure Decision**: Existing single Next.js App Router project (no new project/package). The entire change is scoped to editing the two field blocks (Promise Date, Tracking Number) inside `app/purchase-orders/[id]/lines/[lineid]/page.tsx` in place — no new component files are extracted, since the change is small enough (badge removal + class-name alignment) to keep in the existing inline JSX and does not warrant a new abstraction per Constitution Principle V.

## Complexity Tracking

*No Constitution Check violations — this section is not applicable.*

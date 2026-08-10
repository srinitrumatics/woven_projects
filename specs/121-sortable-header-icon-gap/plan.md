# Implementation Plan: Clear Gap Between Header Text and Sort Icon in All Datatables

**Branch**: `wovn_mathu` | **Date**: 2026-08-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/121-sortable-header-icon-gap/spec.md`

## Summary

Every sortable column header in the webapp renders through a single shared component, `components/ui/SortableHeader.tsx`, whose label and sort-direction icon currently sit inside a flex row with `gap-1` (4px) between them (`SortableHeader.tsx:66-84`). That spacing is tight enough to read as crowded, especially on narrower or resized columns. The fix widens that one Tailwind `gap-*` value on the shared component's flex container — a single-line, single-file change that automatically applies to every list page's datatable, since none of them implement their own header markup (confirmed: no other component in the codebase renders a sort-direction arrow).

## Technical Context

**Language/Version**: TypeScript, Next.js 15 (React client component)

**Primary Dependencies**: None new — Tailwind CSS utility class change only

**Storage**: N/A

**Testing**: Manual/visual verification per `quickstart.md` (no existing automated test suite covers header spacing, consistent with Constitution Principle V)

**Target Platform**: Web (all supported browsers/screen sizes), light and dark mode, all column alignments/widths already supported by `SortableHeader`

**Project Type**: Web application (Next.js App Router) — single shared component styling change

**Performance Goals**: N/A — no rendering logic change, purely a spacing value

**Constraints**: Must not cause label text to wrap to a second line, must not clip or push the sort icon outside the header cell, must not regress truncation behavior beyond what narrower available width naturally causes, must hold at the smallest column width the app already supports (50px minimum, per `hooks/useResizableColumns.ts:13`) — spec FR-003/FR-005

**Scale/Scope**: 1 file (`components/ui/SortableHeader.tsx`) — one Tailwind class value change. Every list page (Orders, Products/Catalog, Invoices, Quotes, Purchase Orders, Shipments, Proposals, Supplier Bills, Inventory, and any other page using `SortableHeader`) inherits the fix automatically; no per-page edits needed.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth** — N/A. Purely a CSS spacing change on an existing UI component; no data reads/writes involved.
- **II. RBAC-First Feature Design** — N/A. No new functionality exposed; existing permission gating around each list page is untouched.
- **III. Next.js 15 App Router Patterns** — No route or param handling touched. `SortableHeader` remains the same client component with the same props/behavior — only one Tailwind class value changes.
- **IV. Multi-Tenant Isolation** — N/A. No data queries or org-scoping logic involved.
- **V. Simplicity & Phase-Driven Scope** — **Satisfied by design**: the fix is the smallest possible change (one class value on one shared component) precisely because the constitution's own "UI Component Conventions" already mandate every datatable landing page use this shared `SortableHeader` component — no new abstraction, no per-page duplication, no file-touch beyond the one component that already owns this concern.

**Result**: PASS — no violations, no complexity to track.

## Project Structure

### Documentation (this feature)

```text
specs/121-sortable-header-icon-gap/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output — N/A, documented
├── quickstart.md        # Phase 1 output
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md             # Phase 2 output (/speckit-tasks command — NOT created by /speckit-plan)
```

No `contracts/` directory: this feature changes no API route, no external interface, and no component prop/contract — only an existing Tailwind `gap-*` class value on one already-rendered `<div>`.

### Source Code (repository root)

```text
components/ui/
└── SortableHeader.tsx    # MODIFY: widen the flex row's `gap-1` (SortableHeader.tsx:67) to a
                           #         larger value so the label and sort icon read as clearly
                           #         separated, without wrapping the label or clipping the icon
```

**Structure Decision**: No new files, no new components, no per-page edits. Every list page's sortable header already funnels through this one component (constitution-mandated), so a single className edit here is both the minimal and the complete fix for "across webapp" consistency.

## Complexity Tracking

*No Constitution Check violations — table intentionally omitted.*

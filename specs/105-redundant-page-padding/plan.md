# Implementation Plan: Redundant Page Padding

**Branch**: `wovn_mathu` (no dedicated feature branch — no `before_specify`/`before_plan` git hook configured, consistent with `079`-`104`) | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/105-redundant-page-padding/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Two independent, verified redundant-padding defects, confirmed via fresh direct-codebase investigation before this spec's authoring. Both pages stack their own extra background/padding wrapper on top of the shared `Sidebar` shell's own inset (`bg-gray-100 dark:bg-gray-900 p-4 md:p-6`, already applied to every page). Search wraps its entire content in a `bg-gray-50 dark:bg-gray-900` + `container mx-auto px-4` pair — a genuine light-mode color mismatch (not just double-padding) since `gray-50` ≠ the shell's `gray-100`; fix removes both wrapper `<div>`s entirely. Inventory Detail's root element is `<div className="p-6">`, redundant with the shell's own inset, unlike its sibling List page which correctly uses a minimal wrapper; fix removes the redundant `p-6`. Search's other still-open finding — rebuilding its "configuration missing" state onto `ErrorMessage` — is again investigated and declined, for the same shape-mismatch reason as spec `103`'s Unauthorized decision.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: None new — every fix is a JSX/className removal on existing elements; no new component, import, or prop is introduced anywhere in this feature

**Storage**: N/A — no schema, query, or data-fetching changes anywhere in this feature

**Testing**: Manual/visual verification per `quickstart.md`, consistent with `077`-`104` (no automated UI test suite exists); plus `npx tsc --noEmit`

**Target Platform**: Web (desktop + responsive), light and dark mode

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — no new dependency, no new network calls; removing 2 wrapper elements and 1 className have no runtime performance implication

**Constraints**:
- FR-003: Search's actual search/filter/results functionality must not change.
- FR-005: Inventory Detail's actual content (breadcrumb, header, tables) must not change.
- FR-006/FR-007: Search's config-missing state must not be rebuilt onto `ErrorMessage`; Inventory List's own root wrapper must not be touched.
- FR-008: no business logic, data-fetching, or Salesforce read/write changes anywhere — every change is presentation-layer.

**Scale/Scope**: 2 files touched (Search: 4 lines removed — 2 opening wrapper `<div>`s + 2 matching closing tags; Inventory Detail: 1 className removed) — no new files, no deletions, no new dependency.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS (not applicable). No data-layer changes anywhere in this feature.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability, route, or permission surface.
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes. No new props, no new components.
- **IV. Multi-Tenant Isolation**: PASS (not applicable). No data scoping involved.
- **V. Simplicity & Phase-Driven Scope**: PASS. Both fixes remove redundant markup, relying on the already-existing shared shell — no new abstraction. Extending `ErrorMessage` to fit Search's config-missing state is again explicitly rejected as premature (YAGNI), consistent with spec `103`'s precedent.

No violations. Complexity Tracking table is empty — nothing to justify.

## Project Structure

### Documentation (this feature)

```text
specs/105-redundant-page-padding/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — every change is an internal JSX/className removal with no external API/interface surface.

### Source Code (repository root)

Existing Next.js App Router web application (`app/`) per `CLAUDE.md`.

```text
app/search/SearchClientPage.tsx        # fix: remove the 2 wrapper <div>s (lines 211-212 open, 332-333 close) — bg-gray-50 dark:bg-gray-900 + container mx-auto px-4
app/inventory/[id]/page.tsx             # fix: root <div> (line 150) className="p-6" -> no className
```

**Structure Decision**: Single Next.js project. 2 files edited, no new files, no deletions, no new dependency. US1 (Search) and US2 (Inventory Detail) touch 2 fully independent files.

## Complexity Tracking

*No violations — table intentionally empty.*

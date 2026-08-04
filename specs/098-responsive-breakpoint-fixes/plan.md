# Implementation Plan: Responsive Breakpoint Fixes

**Branch**: `wovn_mathu` (no dedicated feature branch — no `before_specify`/`before_plan` git hook configured, consistent with `079`-`097`) | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/098-responsive-breakpoint-fixes/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Two independent, verified responsiveness defects, confirmed via fresh direct-codebase investigation before this spec's authoring; a 3rd audit-named item (Products List's dual pagination paradigm) was investigated and found to be a legitimate UX-paradigm choice, not a bug, and is explicitly out of scope. This spec covers: (1) Shipment Line Detail's Product Information panel uses an arbitrary `min-[1000px]:` Tailwind variant for its internal fields grid, while its own root element and every other panel on its parent page consistently use the app's actual custom `w1025` breakpoint token — a ~25px mismatch that makes this one nested grid switch column count at a different window width than everything around it; fix swaps the arbitrary variant for the standard token. (2) Products catalog's Card view renders both an `IntersectionObserver`-driven auto-load sentinel and a manual "Load More Products" button simultaneously — both appear under the byte-identical condition and call the identical handler, confirmed genuinely redundant rather than two purpose-built affordances; fix removes the redundant manual button, keeping the auto-load sentinel (which already has its own loading indicator) as the sole "load more" control.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: None new — no change to the existing `react-instantsearch`/Algolia integration beyond removing one already-redundant JSX block; no new component, import, or prop is introduced anywhere in this feature

**Storage**: N/A — no schema, query, or data-fetching changes anywhere in this feature

**Testing**: Manual/visual verification per `quickstart.md`, consistent with `077`-`097` (no automated UI test suite exists); plus `npx tsc --noEmit`

**Target Platform**: Web (desktop + responsive, since this feature is specifically about a breakpoint-behavior correction), light and dark mode

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — no new dependency, no new network calls; removing a redundant button and correcting a className token have no runtime performance implication

**Constraints**:
- FR-002: no panel on Shipment Line Detail other than the Product Information panel's internal grid may change.
- FR-004/FR-005/FR-006: Products Card view's automatic loading behavior, loading indicator, and "end of results" message must keep working exactly as before; List view's pagination must not be touched; the two view modes' pagination paradigms must not be unified by this feature.
- FR-007: no business logic, data-fetching, or Salesforce/Algolia read behavior changes anywhere — every change is a presentation-layer correction (one className token swap, one redundant-JSX-block removal).

**Scale/Scope**: 2 files touched (1 one-line breakpoint-token fix, 1 JSX block removal) — no new files, no deletions of files, no new dependency.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS (not applicable). No data-layer changes anywhere in this feature.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability, route, or permission surface.
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes. No new props, no new components.
- **IV. Multi-Tenant Isolation**: PASS (not applicable). No data scoping involved.
- **V. Simplicity & Phase-Driven Scope**: PASS. Both fixes are targeted corrections on confirmed defects — one className token swap, one redundant-control removal — with no new abstraction. Products List's two pagination paradigms are explicitly left as two distinct, individually-coherent patterns rather than being forced into one (YAGNI), consistent with spec `096`'s precedent.

No violations. Complexity Tracking table is empty — nothing to justify.

## Project Structure

### Documentation (this feature)

```text
specs/098-responsive-breakpoint-fixes/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — every change is an internal className/JSX edit with no external API/interface surface.

### Source Code (repository root)

Existing Next.js App Router web application (`app/`) per `CLAUDE.md`.

```text
app/shipments/[id]/lines/[lineid]/components/ProductInformationCard.tsx        # fix: fields grid (line 26) min-[1000px]:grid-cols-3 -> w1025:grid-cols-3

app/products/ProductClientPage.tsx                                              # fix: remove redundant manual "Load More Products" button block (lines 462-470), keep the IntersectionObserver sentinel
```

**Structure Decision**: Single Next.js project. 2 files edited, no new files, no deletions of files, no new dependency. US1 (breakpoint fix) and US2 (redundant-control removal) touch 2 fully independent files.

## Complexity Tracking

*No violations — table intentionally empty.*

# Implementation Plan: Brand Accent Color Cleanup

**Branch**: `wovn_mathu` (no dedicated feature branch — no `before_specify`/`before_plan` git hook configured, consistent with `079`–`085`) | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/086-brand-accent-cleanup/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

A fresh current-state re-audit (via an Explore subagent, not the confirmed-stale `UI_UX_DESIGN_CONSISTENCY_AUDIT.md`) found 5 groups of confirmed off-brand accent-color drift, plus 2 directly-adjacent bonus findings folded into existing groups, plus a broad sweep confirming a long list of superficially-similar colorful elements are actually legitimate and must NOT be touched:

1. **Search page** — themed entirely in indigo (13 occurrences) plus one off-brand `blue-500` focus ring — the single most visible full-page instance of drift.
2. **Configure's "+Add Group"** — purple button/inputs (6 occurrences), plus 2 adjacent indigo occurrences on the same feature's group-row styling and subtotal figure (bonus find — same feature, would leave a different inconsistency if skipped).
3. **Admin Organizations page** — the worst offender: zero uses of `primary` anywhere in a 706-line file, themed entirely in orange/amber with additional indigo and purple accents; plus its Admin Dashboard tile icon.
4. **4 hardcoded hex "Back" buttons** — an exact near-clone-of-primary hex literal, with 4 sibling files already showing the correct `bg-primary`/`hover:bg-primary/90` pattern to copy verbatim.
5. **Product Gallery** — 2 decorative hardcoded hex backgrounds, lowest priority.

Confirmed explicitly out of scope (verified legitimate, not drift): the entire Admin-Portal internal-tool system (user decision), `StatusBadge`'s deliberate ~13-color semantic system, the Admin-Portal's deliberate sequential-step color code, Home's categorical tile colors, file-type icon conventions, and several semantic status/warning colors. A handful of icon-container color-pairing mismatches (a different defect class) are deferred to a possible future spec.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: Tailwind CSS (existing `primary`/`primary-light`/`primary-dark` tokens already defined in `tailwind.config.ts`); no new packages, no config changes

**Storage**: N/A — presentational only; no schema, query, or data-fetching changes

**Testing**: Manual/visual QA per `quickstart.md`, consistent with `077`–`085` (no automated UI test suite exists), plus explicit light/dark mode spot checks since color tokens differ per mode

**Target Platform**: Web (desktop + responsive), light and dark mode

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — pure className swaps, no new renders or network calls

**Constraints**:
- Every replacement MUST use the existing `primary`/`primary-light`/`primary-dark` Tailwind tokens (or their opacity variants, e.g. `primary/10`) — no new colors introduced.
- Each fix touches only color-bearing classes; shape, spacing, sizing, and font-weight classes on the same elements MUST remain untouched (minimal diff).
- The Configure `lvColors` categorical array's replacement entry MUST remain visually distinct from its 3 other existing entries (gray/blue/green) per FR-003.
- Admin Organizations' one purple mono-badge (line 520) is a data-display chip, not a themed accent — mapped to a neutral gray badge matching the file's own other neutral badges, not forced onto `primary` (see `research.md` §3 rationale).
- None of the explicitly out-of-scope legitimate color usages (FR-008) may be touched — verified via targeted grep before and after implementation, not assumed.
- Dark-mode variants MUST be preserved/updated correctly for every touched element (FR-010) — spot-checked live during implementation, not just statically reviewed.

**Scale/Scope**: 9 files touched: `SearchClientPage.tsx`, `ConfigureOrderClientPage.tsx`, `app/admin/organizations/page.tsx`, `app/admin/page.tsx`, 4 line-detail "Back"-button files, `ProductGallery.tsx`. No new files. No sibling-folder propagation in this feature's scope (separate, user-gated step per established convention).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS (not applicable). No data-layer changes.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability or permission surface.
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes.
- **IV. Multi-Tenant Isolation**: PASS (not applicable). No data scoping involved.
- **V. Simplicity & Phase-Driven Scope**: PASS. This feature only swaps existing Tailwind color tokens for other existing Tailwind color tokens already defined in `tailwind.config.ts` — no new abstractions, no new design-system primitives, and it explicitly declines to "fix" a long list of colorful elements confirmed to be legitimate categorical/semantic usage, avoiding over-generalization.

No violations. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/086-brand-accent-cleanup/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — presentational className changes only; no request/response or API contract involved.

### Source Code (repository root)

Existing Next.js App Router web application (`app/`) per `CLAUDE.md`.

```text
app/
├── search/SearchClientPage.tsx                                       # US1: indigo + 1 blue-500 -> primary
├── configure/ConfigureOrderClientPage.tsx                            # US2: purple + adjacent indigo -> primary
├── admin/organizations/page.tsx                                      # US3: orange/amber/indigo/purple -> primary
├── admin/page.tsx                                                    # US3: orange tile icon -> primary
├── invoices/[id]/lines/[lineid]/page.tsx                             # US4: hex Back button -> primary
├── shipments/[id]/lines/[lineid]/page.tsx                            # US4: hex Back button -> primary
├── quotes/[id]/lines/[lineid]/page.tsx                               # US4: hex Back button -> primary
├── admin/authorize-locations/[id]/delivery-windows/page.tsx          # US4: hex Back button -> primary
└── products/[id]/components/ProductGallery.tsx                      # US5: 2 hex backgrounds -> primary family
```

**Structure Decision**: Single Next.js project. 9 existing files each get targeted className swaps. No new files, no new components, no config changes.

## Complexity Tracking

Not applicable — no violations.

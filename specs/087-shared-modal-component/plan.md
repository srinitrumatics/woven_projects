# Implementation Plan: Shared Accessible Modal Component

**Branch**: `wovn_mathu` (no dedicated feature branch — no `before_specify`/`before_plan` git hook configured, consistent with `079`–`086`) | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/087-shared-modal-component/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build `components/ui/Modal.tsx` on `@radix-ui/react-dialog` (new dependency, user-approved) providing real focus trapping, Escape-to-close, `role="dialog"`/`aria-modal`, and a consistent visual shell (radius, shadow, close button via `lucide-react`'s `X`, `framer-motion`-driven animation), then migrate 8 modal-shaped elements onto it: 4 in the Products module (`AddProductModal`, `AddToOrderModal`, `CertificationModal`, `DatasheetModal`), 2 in Locations/Delivery-Windows (`LocationModal`, `DeliveryWindowModal`), 1 in Shipments (`TrackingTimelineModal`, shell/accessibility only — its separate mock-data bug is untouched), and 1 bonus-found unnamed inline popup in `ProductCatalog.tsx`.

A fresh re-audit corrected 2 stale file-path claims from the original static audit and found the 8th (unnamed) modal via direct grep. It also surfaced an architectural point that applies to all 8, not just the 2 modals currently missing an `isOpen` prop: every existing modal self-guards with `if (!isOpen) return null` (and `CertificationModal`/`DatasheetModal`'s parent additionally conditionally-mounts them), which would prevent any real exit animation regardless of what the shared component does — migrating all 8 requires removing this self-guard uniformly and letting the shared `Modal` (via Radix's `open` state) control mount/unmount.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: `@radix-ui/react-dialog` (**new** — must verify React 19 peer-dependency compatibility at install time, first implementation step); `lucide-react` and `framer-motion` (both already installed, newly used by modals for the first time)

**Storage**: N/A — presentational/component-architecture only; no schema, query, or data-fetching changes

**Testing**: Manual/visual + keyboard/screen-reader QA per `quickstart.md`, consistent with `077`–`086` (no automated UI test suite exists) — this feature's core value (focus trap, Escape, focus-return) is behavior that must be exercised live, not just reviewed in code, since subtle focus-management bugs are easy to introduce and hard to catch by reading JSX alone

**Target Platform**: Web (desktop + responsive), light and dark mode

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — one new dialog-primitive dependency, no new network calls; Radix's portal rendering is a standard, lightweight pattern

**Constraints**:
- FR-008: migrating a modal's shell MUST NOT change its content, fields, validation, or save/submit logic — every migration task is a pure shell swap.
- `AddProductModal.tsx`'s `inlineMode` branch (a separate, non-modal rendering path used elsewhere) MUST be left completely untouched — only its modal branch migrates (research.md §4).
- `TrackingTimelineModal.tsx`'s mock-data-fallback bug MUST NOT be touched (FR-010) — shell/accessibility only.
- `components/layouts/Sidebar.tsx`'s mobile nav drawer MUST NOT be migrated (FR-011) — different UI pattern.
- Every migrated modal's own `if (!isOpen) return null` early return MUST be removed as part of its migration (research.md §3), and `EditProductTabs.tsx`'s 2 conditional-mount wrappers MUST become unconditional renders with an `isOpen` prop passed through.
- The shared component's `size` prop must cover every current `max-w-*` value found across the 8 modals (data-model.md) — no modal should end up narrower or wider than its current width without a stated reason.

**Scale/Scope**: 1 new shared component (`components/ui/Modal.tsx`), 1 new dependency, 8 modal files migrated, 1 parent file (`EditProductTabs.tsx`) updated for the 2 newly-`isOpen`-aware modals. No sibling-folder propagation in this feature's scope (separate, user-gated step per established convention).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS (not applicable). No data-layer changes; every modal's existing fetch/save logic is preserved as-is.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability, route, or permission surface — purely a shared UI shell.
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes.
- **IV. Multi-Tenant Isolation**: PASS (not applicable). No data scoping involved.
- **V. Simplicity & Phase-Driven Scope**: PASS, with one deliberate, justified exception — this feature adds a new dependency (`@radix-ui/react-dialog`), which the constitution doesn't explicitly forbid but does ask features to justify complexity. Justification: zero accessible-dialog primitive exists in this codebase today (confirmed via full-codebase grep), and hand-rolling focus-trap/ARIA correctness from scratch is real, easy-to-get-wrong complexity of its own — the user explicitly chose the smaller, well-tested dependency over building that logic in-house. No other new abstractions are introduced; the shared component directly replaces 8 existing hand-rolled implementations with one, a net reduction in bespoke code.

No other violations. Complexity Tracking table below documents this one exception per the constitution's own gate process.

## Project Structure

### Documentation (this feature)

```text
specs/087-shared-modal-component/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — this feature's only "contract" is the new `Modal` component's prop interface, fully captured in `data-model.md`.

### Source Code (repository root)

Existing Next.js App Router web application (`app/`, `components/`) per `CLAUDE.md`.

```text
components/ui/
└── Modal.tsx                                                          # NEW — shared component, built on @radix-ui/react-dialog

app/
├── products/components/AddProductModal.tsx                           # migrate (non-inline branch only)
├── products/[id]/components/AddToOrderModal.tsx                      # migrate
├── products/[id]/components/CertificationModal.tsx                   # migrate + gain isOpen prop
├── products/[id]/components/DatasheetModal.tsx                       # migrate + gain isOpen prop
├── products/[id]/components/EditProductTabs.tsx                      # update 2 call sites to always-mount + isOpen
├── admin/authorize-locations/components/LocationModal.tsx            # migrate
├── admin/authorize-locations/[id]/delivery-windows/components/DeliveryWindowModal.tsx  # migrate, remove dead animate-in classes
├── shipments/[id]/components/TrackingTimelineModal.tsx               # migrate (shell only)
└── orders/[id]/components/ProductCatalog.tsx                         # migrate its inline image popup

package.json                                                          # add @radix-ui/react-dialog
```

**Structure Decision**: Single Next.js project. 1 new shared component, 1 new dependency, 8 existing modal files each get a targeted shell replacement (not a rewrite of their content/logic), 1 parent file gets 2 small call-site updates.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| New dependency: `@radix-ui/react-dialog` | Zero accessible-dialog primitive exists in this codebase; FR-002/FR-003/FR-004 (Escape, focus trap, ARIA dialog semantics) require correct, tested focus-management logic | Hand-rolling focus-trap/Escape/ARIA logic from scratch (using only already-installed `framer-motion`/`lucide-react`) was considered and explicitly rejected by the user — focus-trap correctness (tab order, shift+tab, initial focus, return-focus-on-close, inert background) is a well-known source of subtle, hard-to-test bugs; a single well-maintained unstyled primitive removes that risk for a small, justified dependency addition |

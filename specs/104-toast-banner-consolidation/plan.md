# Implementation Plan: Toast Banner Consolidation

**Branch**: `wovn_mathu` (no dedicated feature branch — no `before_specify`/`before_plan` git hook configured, consistent with `079`-`103`) | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/104-toast-banner-consolidation/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Two independent, verified defects confirmed via fresh direct-codebase investigation — the last 2 remaining hand-rolled feedback banners in the app, both migrating onto the shared `useToast()` mechanism (already mounted at the application root via `ToastProvider`, used elsewhere since spec `094`). `app/profile/page.tsx`'s `message` state drives an inline banner auto-cleared by a single `useEffect` timer; fix replaces its 4 call sites with `useToast().success()`/`error()` calls at the same 5000ms duration, removing the state, the timer, and the banner JSX. `components/ForgotPasswordForm.tsx`'s `error`/`success` state strings drive 2 inline banners, each cleared by its own scattered `setTimeout`; fix replaces all 9 call sites with toast calls preserving each site's exact existing duration (3000ms or 5000ms), removing the state and both banner JSX blocks. Each file's unrelated timers (Profile's field-level validation display and scroll-to-top; Forgot Password's step-advance and post-reset redirect) are left completely untouched.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: None new — `useToast()`/`ToastProvider` already exist at `components/ui/Toast.tsx` and are already mounted at `app/layout.tsx`; this feature only imports and calls the existing hook, it does not create or mount anything new

**Storage**: N/A — no schema, query, or data-fetching changes anywhere in this feature

**Testing**: Manual/visual verification per `quickstart.md`, consistent with `077`-`103` (no automated UI test suite exists); plus `npx tsc --noEmit`

**Target Platform**: Web (desktop + responsive), light and dark mode (the shared `Toast` component already supports both)

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — no new dependency, no new network calls; swapping a state-driven inline banner for an existing toast call has no meaningful performance implication

**Constraints**:
- FR-002/FR-004: Profile's field-level validation display and Forgot Password's step-advance/redirect timing must not change.
- FR-005: each migrated message's toast duration must match its former banner's exact duration (5000ms for Profile; 3000ms or 5000ms per call site for Forgot Password).
- FR-006: no business logic, data submission, or Salesforce read/write changes anywhere — every change is presentation-layer.

**Scale/Scope**: 2 files touched (Profile: 4 call sites + state/effect/JSX removal; Forgot Password: 9 call sites + state/JSX removal) — no new files, no deletions, no new dependency.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS (not applicable). No data-layer changes anywhere in this feature.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability, route, or permission surface.
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes. `useToast()` is already available via the root-mounted `ToastProvider` — no new provider wiring.
- **IV. Multi-Tenant Isolation**: PASS (not applicable). No data scoping involved.
- **V. Simplicity & Phase-Driven Scope**: PASS. Both fixes reuse an already-existing shared primitive (`useToast()`) exactly as designed — no new abstraction, no new component.

No violations. Complexity Tracking table is empty — nothing to justify.

## Project Structure

### Documentation (this feature)

```text
specs/104-toast-banner-consolidation/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — every change is an internal call-site/JSX edit with no external API/interface surface.

### Source Code (repository root)

Existing Next.js App Router web application (`app/`, `components/`) per `CLAUDE.md`.

```text
app/profile/page.tsx                 # fix: replace 4 setMessage(...) call sites with useToast().success()/error(); remove message state, its auto-clear useEffect, and the inline banner JSX
components/ForgotPasswordForm.tsx    # fix: replace 9 setError/setSuccess+setTimeout call sites with useToast().error()/success(); remove error/success state and both inline banner JSX blocks
```

**Structure Decision**: Single Next.js project. 2 files edited, no new files, no deletions, no new dependency. US1 (Profile) and US2 (Forgot Password) touch 2 fully independent files.

## Complexity Tracking

*No violations — table intentionally empty.*

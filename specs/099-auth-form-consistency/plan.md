# Implementation Plan: Auth Form Consistency

**Branch**: `wovn_mathu` (no dedicated feature branch — no `before_specify`/`before_plan` git hook configured, consistent with `079`-`098`) | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/099-auth-form-consistency/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Two independent, verified auth-surface defects, confirmed via fresh direct-codebase investigation before this spec's authoring (the button count was corrected mid-planning from 2 to 3 per form after a closer read found a 3rd, LinkedIn button the initial scoping missed). This spec covers: (1) both Sign In and Sign Up render 3 social-login buttons each (Facebook, Google, LinkedIn) with zero `onClick` wiring and no OAuth backend anywhere in the codebase — fully decorative dead UI shipping the illusion of a working login method, the same class of defect as spec `083`'s Invoice "Pay Now" gap; fix removes the button row along with its supporting caption and "OR" divider from both forms, leaving the real email/password form untouched. (2) Sign Up's password show/hide toggle renders plain "Show"/"Hide" text where Sign In and Forgot Password both use an identical eye-icon SVG — a copy-paste-drift inconsistency across 3 instances of one control; fix replaces Sign Up's text toggle with the shared icon markup, and separately adds a missing `aria-label` to Forgot Password's own toggle (the same control, found lacking one during this same investigation).

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: None new — every fix is a JSX/markup edit on existing components; no new component, import, or prop is introduced anywhere in this feature

**Storage**: N/A — no schema, query, or data-fetching changes anywhere in this feature

**Testing**: Manual/visual verification per `quickstart.md`, consistent with `077`-`098` (no automated UI test suite exists); plus `npx tsc --noEmit`

**Target Platform**: Web (desktop + responsive), light mode (these 3 auth forms have no dark-mode support today and this feature doesn't add one — out of scope)

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — no new dependency, no new network calls; removing dead markup and swapping button content have no runtime performance implication

**Constraints**:
- FR-003: removing the social-login scaffolding MUST NOT change either form's email/password submit, validation, or error-handling behavior.
- FR-005: Sign Up's password toggle's existing reveal/hide behavior MUST continue working exactly as before.
- FR-007: Sign Up's confirm-password field MUST NOT gain a new show/hide toggle — no new functionality is introduced.
- FR-008: no business logic, authentication behavior, or Salesforce read/write changes anywhere — every change is a presentation-layer correction.

**Scale/Scope**: 3 files touched (2 files each losing a caption/button-row/divider block, 1 of those 2 also gaining an icon swap, 1 file gaining a single `aria-label`) — no new files, no deletions of files, no new dependency.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS (not applicable). No data-layer changes anywhere in this feature.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability, route, or permission surface.
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes. Existing `handleSubmit`/session logic in both forms is untouched.
- **IV. Multi-Tenant Isolation**: PASS (not applicable). No data scoping involved.
- **V. Simplicity & Phase-Driven Scope**: PASS. Both fixes are targeted corrections on confirmed defects (dead UI removal, markup convergence onto an already-proven pattern) with no new abstraction. Sign Up's confirm-password field is explicitly left without a new toggle rather than expanding scope.

No violations. Complexity Tracking table is empty — nothing to justify.

## Project Structure

### Documentation (this feature)

```text
specs/099-auth-form-consistency/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — every change is an internal JSX/markup edit with no external API/interface surface.

### Source Code (repository root)

Existing Next.js App Router web application (`components/`) per `CLAUDE.md`.

```text
components/SignInForm.tsx           # fix: remove social-login caption/button-row/divider block
components/SignUpForm.tsx           # fix: remove social-login caption/button-row/divider block; swap password-toggle text for the shared eye-icon SVG
components/ForgotPasswordForm.tsx   # fix: add aria-label to the existing password-toggle button
```

**Structure Decision**: Single Next.js project. 3 files edited, no new files, no deletions of files, no new dependency. US1 (dead social-login removal) touches `SignInForm.tsx` and `SignUpForm.tsx`; US2 (password-toggle consistency) touches `SignUpForm.tsx` (already touched by US1, non-overlapping region) and `ForgotPasswordForm.tsx`.

## Complexity Tracking

*No violations — table intentionally empty.*

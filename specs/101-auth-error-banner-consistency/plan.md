# Implementation Plan: Auth Error Banner Consistency

**Branch**: `wovn_mathu` (no dedicated feature branch — no `before_specify`/`before_plan` git hook configured, consistent with `079`-`100`) | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/101-auth-error-banner-consistency/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Two independent, verified auth error-banner defects, confirmed via fresh direct-codebase investigation before this spec's authoring — a natural follow-on to spec `099` touching the same 3 auth-form files. This spec covers: (1) Sign In's error banner lacks the border and entrance animation that Sign Up's and Forgot Password's error banners already share identically; fix appends the missing classes to Sign In's banner, converging all 3 onto one visual treatment. (2) Sign Up's error banner has no `role="alert"`, unlike Sign In's and Forgot Password's, which already have it from spec `093`'s earlier accessibility pass — Sign Up was simply missed at the time; fix adds the attribute, closing the gap. Forgot Password's separate success banner (a distinct message type with no equivalent elsewhere) is explicitly out of scope.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: None new — every fix is a className/attribute edit on existing JSX elements; no new component, import, or prop is introduced anywhere in this feature

**Storage**: N/A — no schema, query, or data-fetching changes anywhere in this feature

**Testing**: Manual/visual verification per `quickstart.md`, consistent with `077`-`100` (no automated UI test suite exists); plus `npx tsc --noEmit`

**Target Platform**: Web (desktop + responsive), light mode (these 3 auth forms have no dark-mode support today and this feature doesn't add one — out of scope, consistent with spec `099`)

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — no new dependency, no new network calls; a className append and an attribute addition have no runtime performance implication

**Constraints**:
- FR-002: Sign In's error banner text content and color MUST NOT change — only the border/animation classes are added.
- FR-004: Sign Up's error banner's visual appearance MUST NOT change as a result of adding `role="alert"`.
- FR-005: Forgot Password's success banner MUST NOT be touched.
- FR-006: no business logic, authentication behavior, or Salesforce read/write changes anywhere — every change is a presentation-layer correction.

**Scale/Scope**: 2 files touched (1 className append, 1 attribute addition) — no new files, no deletions, no new dependency.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS (not applicable). No data-layer changes anywhere in this feature.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability, route, or permission surface.
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes. Existing `handleSubmit`/error-state logic in both forms is untouched.
- **IV. Multi-Tenant Isolation**: PASS (not applicable). No data scoping involved.
- **V. Simplicity & Phase-Driven Scope**: PASS. Both fixes converge onto an already-proven pattern present in sibling files — no new abstraction, no new component.

No violations. Complexity Tracking table is empty — nothing to justify.

## Project Structure

### Documentation (this feature)

```text
specs/101-auth-error-banner-consistency/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — every change is an internal className/attribute edit with no external API/interface surface.

### Source Code (repository root)

Existing Next.js App Router web application (`components/`) per `CLAUDE.md`.

```text
components/SignInForm.tsx    # fix: error banner (line 78) gains border border-red-100 animate-in fade-in slide-in-from-top-1
components/SignUpForm.tsx    # fix: error banner (line 141) gains role="alert"
```

**Structure Decision**: Single Next.js project. 2 files edited, no new files, no deletions, no new dependency. US1 (Sign In border/animation) and US2 (Sign Up `role="alert"`) touch 2 fully independent files.

## Complexity Tracking

*No violations — table intentionally empty.*

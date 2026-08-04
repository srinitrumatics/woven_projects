# Implementation Plan: Auth Form Final Consistency Pass

**Branch**: `109-auth-form-final-consistency` | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/109-auth-form-final-consistency/spec.md`

## Summary

Two independent, low-risk fixes across the app's 3 auth forms: (1) remove Sign Up's `order-1`/`order-2` panel-flip and re-mirror its decorative circles so its CTA panel sits on the right like Sign In/Forgot Password; (2) change Sign In's and Sign Up's 7 `sr-only` field labels to visible labels matching Forgot Password's existing convention, keeping all placeholder text/styling/icons unchanged.

## Technical Context

**Language/Version**: TypeScript 5, React 19 (Next.js 15 App Router, client components)

**Primary Dependencies**: None new — pure JSX/className edits to 3 existing form components

**Storage**: N/A

**Testing**: Manual visual verification (dev server, desktop + mobile widths, typing into fields) + `npx tsc --noEmit`; no dedicated test suite exists for this presentational change

**Target Platform**: Web (Next.js 15 app, client-rendered auth pages)

**Project Type**: Web application (Next.js App Router)

**Performance Goals**: N/A — no new network calls, no new components

**Constraints**: Must not change Sign Up's CTA panel content (headline/copy/extra "Sign In" button), must not change mobile stacking order, must not alter existing `htmlFor`/`id` associations, placeholder text, autocomplete attributes, or password show/hide behavior on any of the 3 forms.

**Scale/Scope**: 2 files modified (`components/SignInForm.tsx`, `components/SignUpForm.tsx`); `ForgotPasswordForm.tsx` is read-only reference, not modified.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Salesforce source of truth)**: N/A — no data change.
- **Principle II (RBAC-first)**: N/A — auth forms predate login, no permission surface.
- **Principle III (Next.js 15 App Router patterns)**: No route/param change; both files remain client components. PASS.
- **Simplicity/YAGNI**: Converges onto an already-established convention (Forgot Password's visible labels, Sign In/Forgot Password's panel order) rather than inventing a new pattern. PASS.

No violations. Constitution Check passes with no exceptions needed.

## Project Structure

### Documentation (this feature)

```text
specs/109-auth-form-final-consistency/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
components/SignInForm.tsx          # US2 (visible labels): 2 fields
components/SignUpForm.tsx          # US1 (panel side) + US2 (visible labels): 5 fields
components/ForgotPasswordForm.tsx  # Reference only — not modified
```

**Structure Decision**: Two independent changes within existing components, no new files. US1 (panel side) touches only `SignUpForm.tsx`. US2 (visible labels) touches `SignInForm.tsx` and `SignUpForm.tsx`. Both user stories can be implemented and verified independently of each other.

## Complexity Tracking

*No violations — table omitted.*

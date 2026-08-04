# Implementation Plan: Accessibility Improvements

**Branch**: `wovn_mathu` (no dedicated feature branch — no `before_specify`/`before_plan` git hook configured, consistent with `079`-`092`) | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/093-accessibility-improvements/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Six independent, verified accessibility defects, all re-confirmed against current source (one original audit claim — Header's hamburger button lacking a label — was found stale; it already has `aria-label="Open menu"`, and the theme-toggle button already has `aria-label="Toggle dark mode"`, so both are excluded). Fixes: (1) add `aria-label` to 5 confirmed unlabeled icon-only buttons (Org List edit/delete, Header's bell/account-selector/avatar); (2) add `role="alert"` to 4 confirmed unlabeled error/success banners (SignInForm, Admin Login, ForgotPasswordForm's error and success) so they're announced on mount, independent of their existing auto-clear timers; (3) add matching `id`/`htmlFor` to 9 Profile page fields, reusing each field's existing `name` value as its `id`; (4) replace 2 disabled `<span>` Prev/Next controls in Quote Line Detail with real `<button disabled>` elements; (5) make Admin-Portal Organization Detail's expandable sync-history row keyboard-operable (`role="button"`, `tabIndex`, `onKeyDown` mirroring the existing `onClick`), gated behind the exact same condition that already governs its clickability; (6) add `aria-current="step"` plus `<nav>/<ol>`/`sr-only`-label structure to Admin-Portal Organization Create's 3-step wizard indicator.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: None new — every fix uses only native HTML attributes (`aria-label`, `role`, `id`/`htmlFor`, `disabled`, `tabIndex`, `aria-current`, `aria-expanded`) and existing event handlers

**Storage**: N/A — no schema, query, or data-fetching changes anywhere in this feature

**Testing**: Manual/visual + assistive-technology verification per `quickstart.md`, consistent with `077`-`092` (no automated UI test suite exists); plus `npx tsc --noEmit`

**Target Platform**: Web (desktop + responsive), light and dark mode, keyboard and screen-reader navigation

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — no new dependency, no new network calls, no new renders

**Constraints**:
- FR-003: Header's hamburger and theme-toggle buttons MUST NOT be modified (already correctly labeled).
- FR-005: ForgotPasswordForm's banners MUST remain perceivable long enough once `role="alert"` makes their announcement immediate on mount — no auto-clear-duration change is required as a result (documented in research.md).
- FR-009: Quote Line Detail's enabled Prev/Next behavior MUST remain byte-identical — only the disabled-state branches change element type.
- FR-011: Sync-history rows with no expandable content MUST NOT gain interactive semantics they don't need — the new keyboard attributes are gated behind the exact same condition already governing the existing `onClick`/cursor-pointer styling.
- FR-013: no business logic, data-fetching, form-validation, or Salesforce read/write changes anywhere — every change is a markup/ARIA-attribute correction to existing, already-working behavior.

**Scale/Scope**: 8 files touched (2 Header/Org-List icon-button fixes, 3 banner fixes, 1 Profile field-binding fix, 1 Quote Line Detail Prev/Next fix, 1 sync-history keyboard fix, 1 wizard step-semantics fix — some fixes share a file, see Project Structure), no new files, no new dependency.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS (not applicable). No data-layer changes anywhere in this feature.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability, route, or permission surface.
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes. Both the main-portal auth surface (SignInForm, ForgotPasswordForm) and the admin-portal auth surface (Admin Login) are touched only for their error-banner markup, with no cross-contamination between the two isolated auth systems.
- **IV. Multi-Tenant Isolation**: PASS (not applicable). No data scoping involved.
- **V. Simplicity & Phase-Driven Scope**: PASS. Every fix reuses existing state/handlers (e.g. the sync-history row's new `onKeyDown` calls the exact same `toggleFailures` function its `onClick` already calls) rather than introducing new abstractions. `ForgotPasswordForm`'s auto-clear timers are deliberately left unchanged per research.md rather than over-engineered.

No violations. Complexity Tracking table is empty — nothing to justify.

## Project Structure

### Documentation (this feature)

```text
specs/093-accessibility-improvements/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — every fix is an internal markup/attribute correction to existing UI, not a new external interface.

### Source Code (repository root)

Existing Next.js App Router web application (`app/`, `components/`) per `CLAUDE.md`.

```text
app/(admin-portal)/admin-portal/organizations/page.tsx              # fix: aria-label on edit/delete icon buttons (lines 106-114)
components/Header.tsx                                               # fix: aria-label on account-selector (72-85), bell (138-143), avatar (162-169) buttons

components/SignInForm.tsx                                            # fix: role="alert" on error banner (137-141)
app/(admin-portal)/admin-login/page.tsx                              # fix: role="alert" on error banner (59-64)
components/ForgotPasswordForm.tsx                                    # fix: role="alert" on error (119-123) and success (125-129) banners

app/profile/page.tsx                                                 # fix: id/htmlFor on 9 fields (Title, MobilePhone, Phone, Birthdate, MailingStreet/City/State/PostalCode/Country)

app/quotes/[id]/lines/[lineid]/page.tsx                              # fix: disabled Prev/Next span -> button disabled (625-631, 650-656)

app/(admin-portal)/admin-portal/organizations/[id]/page.tsx          # fix: role/tabIndex/onKeyDown/aria-expanded on sync-history row (642-645), gated behind existing click condition

app/(admin-portal)/admin-portal/organizations/create/page.tsx        # fix: nav/ol/aria-current="step"/sr-only labels on step indicator (273-292)
```

**Structure Decision**: Single Next.js project. 8 files touched, no new files, no new dependency. Every fix is independent — no shared files between the 6 user stories' changes.

## Complexity Tracking

*No violations — table intentionally empty.*

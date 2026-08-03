# Implementation Plan: Auth/Landing/Dashboard Route Consolidation

**Branch**: `wovn_mathu` (no dedicated feature branch — no `before_specify`/`before_plan` git hook configured, consistent with `079`–`084`) | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/085-auth-dashboard-consolidation/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Three related consolidations, all grounded in direct code investigation rather than the (in this tier, partly fabricated) `UI_UX_DESIGN_CONSISTENCY_AUDIT.md`:

1. **Dashboard**: `app/program360/page.tsx` and `app/dashboard/page.tsx` are both confirmed completely orphaned (absent from `Sidebar.tsx`'s nav and from `middleware.ts`'s protected-routes list). Program360 is a near-byte-identical fork of `app/home/page.tsx` whose only real difference is a confirmed bug — its `isManufacturer` check is the sole outlier among 29 total occurrences of this pattern app-wide. Delete both files; redirect both routes to `/home` via `next.config.js`.
2. **Auth/landing**: `app/page.tsx` ("/") and `app/auth/page.tsx` render a Sign-In/Sign-Up slide toggle that is not merely redundant but **actively broken** — `SignInForm.tsx`'s Sign Up button is commented out entirely, and the `onToggle` callback both pages pass is never invoked by either form (both forms hard-navigate to `/signin`/`/signup` instead). Delete both files; redirect both routes to `/signin` (preserving query string, specifically `return`) via `next.config.js`; update the 2 places that currently redirect unauthenticated users to `/auth` (`middleware.ts`, `components/ProtectedPageWrapper.tsx`) to target `/signin`; delete `components/ForceLightMode.tsx` (orphaned once `/auth` is gone) and `components/Navigation.tsx` (already unreferenced); remove the now-dead `onToggle` prop from both form components.
3. **Force-light-mode**: consolidate the 3 duplicated inline `useEffect`s in `app/signin/page.tsx`, `app/signup/page.tsx`, `app/forgot-password/page.tsx` into one shared hook, fixing a confirmed wrapper-class bug (double space + wrong text-color token) on the Forgot Password page in the process.

No new marketing/landing content is built — confirmed via direct search that CLAUDE.md contains no such requirement (the audit's citation was inaccurate).

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: Next.js (`redirects()` config), React; no new packages

**Storage**: N/A — routing/presentation-layer only

**Testing**: Manual/visual QA per `quickstart.md`, consistent with `077`–`084` (no automated UI test suite exists). This feature additionally requires manual verification of redirect behavior (`curl -i`) since it changes server-level routing, not just component rendering.

**Target Platform**: Web (desktop + responsive), light and dark mode

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — redirects are a static Next.js config, not a runtime cost; no new network calls

**Constraints**:
- FR-004/FR-005: the `return` query parameter used to send users back to their originally-requested page after login MUST survive the `/auth` → `/signin` redirect. Next.js `redirects()` forwards query strings automatically for non-wildcard source/destination pairs, but this MUST be explicitly verified against a live request during implementation (`curl -i "http://localhost:3000/auth?return=/orders/123"`), not assumed from documentation alone.
- FR-006: Sign In / Sign Up / Forgot Password's actual fields, validation, submission, and cross-links MUST be unchanged — this feature touches only routing, the dead `onToggle` prop, and the force-light-mode mechanism.
- Per Constitution Principle III, `middleware.ts` is the sole *server-side* enforcement point for route protection. `components/ProtectedPageWrapper.tsx` is a pre-existing client-side complement (not introduced by this feature) that some pages also use — this feature keeps both mechanisms consistent with each other (both pointing at `/signin`) rather than consolidating them into one, which is out of scope.
- No in-app link may be left pointing at the 4 removed routes (FR-010) — verified by a codebase-wide grep during implementation, not assumed from this planning-time investigation alone.

**Scale/Scope**: 4 files deleted (`app/page.tsx`, `app/auth/page.tsx`, `app/program360/page.tsx`, `app/dashboard/page.tsx`), 2 files deleted as now-orphaned (`components/ForceLightMode.tsx`, `components/Navigation.tsx`), 1 new file (`hooks/useForceLightMode.ts`), 6 files edited (`next.config.js`, `middleware.ts`, `components/ProtectedPageWrapper.tsx`, `components/SignInForm.tsx`, `components/SignUpForm.tsx`, plus `app/signin/page.tsx`/`app/signup/page.tsx`/`app/forgot-password/page.tsx` — 3 files — for the hook). No sibling-folder propagation in this feature's scope (separate, user-gated step per established convention).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS (not applicable). No data-layer changes.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability or permission surface — if anything, this feature removes an entry point (`/`, `/auth`) rather than adding one.
- **III. Next.js 15 App Router Patterns**: PASS. `middleware.ts` remains the sole server-side route-protection enforcement point; this feature only changes its redirect *destination* string, not its logic or scope. The two isolated auth systems (main portal vs. admin portal) are untouched — this feature is entirely within the main-portal auth surface.
- **IV. Multi-Tenant Isolation**: PASS (not applicable). No data scoping involved.
- **V. Simplicity & Phase-Driven Scope**: PASS. This feature is a net reduction in code (2 duplicate/dead pages deleted outright, 2 orphaned components deleted, 3 duplicated effects merged to 1) with no new abstractions beyond one small hook that directly replaces 3 copies of identical code.

No violations. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/085-auth-dashboard-consolidation/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — this feature has no external API/interface; its only "contract" is which routes exist, fully captured by `data-model.md`'s redirect table.

### Source Code (repository root)

Existing Next.js App Router web application (`app/`, `components/`, `hooks/`) per `CLAUDE.md`.

```text
next.config.js                              # add redirects(): 4 permanent redirects

app/
├── page.tsx                                # DELETE
├── auth/page.tsx                           # DELETE
├── program360/page.tsx                     # DELETE
├── dashboard/page.tsx                      # DELETE
├── signin/page.tsx                         # use useForceLightMode()
├── signup/page.tsx                         # use useForceLightMode()
└── forgot-password/page.tsx                # use useForceLightMode(); fix wrapper className bug

components/
├── ForceLightMode.tsx                      # DELETE (orphaned once app/auth/page.tsx is gone)
├── Navigation.tsx                          # DELETE (already unreferenced)
├── SignInForm.tsx                          # remove dead onToggle prop + commented-out dead button block
├── SignUpForm.tsx                          # remove dead onToggle prop
└── ProtectedPageWrapper.tsx                # redirect target /auth -> /signin

hooks/
└── useForceLightMode.ts                    # NEW — shared hook, replaces 3 duplicated inline effects

middleware.ts                               # redirect target /auth -> /signin
```

**Structure Decision**: Single Next.js project. 4 route files deleted outright (replaced by config-level redirects, not stub pages), 2 orphaned components deleted, 1 small new hook extracted, 6 files edited with small, targeted changes. No new routes, no new architecture.

## Complexity Tracking

Not applicable — no violations.

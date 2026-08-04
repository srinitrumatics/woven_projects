# Implementation Plan: Proposal Summary Spinner Consolidation

**Branch**: `107-proposal-summary-spinner` | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/107-proposal-summary-spinner/spec.md`

## Summary

Migrate `app/proposals/[id]/summary/page.tsx`'s hand-rolled `w-10 h-10` loading spinner (the one remaining item from the spec 106 spinner-consolidation audit that was excluded for having a 3rd, non-matching size) onto the shared `components/ui/LoadingSpinner` component using `size="md"` and `text="Loading workspace..."`, on the semantic grounds that this spinner represents a whole-panel loading state (analogous to spec 106's Bucket A) rather than a nested tab-panel one (Bucket B).

## Technical Context

**Language/Version**: TypeScript 5, React 19 (Next.js 15 App Router, client component)

**Primary Dependencies**: `components/ui/LoadingSpinner.tsx` (existing shared component, already used by 26 call sites after spec 106)

**Storage**: N/A

**Testing**: Manual visual verification (dev server) + `npx tsc --noEmit`; no dedicated test suite exists for this UI-only change

**Target Platform**: Web (Next.js 15 app, client-side rendered page)

**Project Type**: Web application (Next.js App Router)

**Performance Goals**: N/A — purely a presentational swap, no behavioral or performance impact

**Constraints**: Must not alter `loading`/`Project_Workspace__c` branching logic, must not change the "no workspace configured" fallback state, must not resize or restructure the surrounding `h-[calc(100vh-200px)]` panel

**Scale/Scope**: Single file, single JSX block (lines ~95-99 of `app/proposals/[id]/summary/page.tsx`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Salesforce source of truth)**: N/A — no data-fetching logic touched, only the loading UI.
- **Principle II (RBAC-first)**: N/A — no new functionality or permission surface introduced.
- **Principle III (Next.js 15 App Router patterns)**: No change to route params or component type; page remains a client component. PASS.
- **Simplicity/YAGNI**: Reuses an existing shared component instead of introducing a new one; no new abstraction created. PASS.

No violations. Constitution Check passes with no exceptions needed.

## Project Structure

### Documentation (this feature)

```text
specs/107-proposal-summary-spinner/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output (N/A note — no data entities)
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
app/proposals/[id]/summary/page.tsx   # Only file touched
components/ui/LoadingSpinner.tsx      # Existing shared component, imported, unchanged
```

**Structure Decision**: Single-file change within the existing Next.js App Router structure (`app/proposals/[id]/summary/page.tsx`). No new files, directories, or components are created — this feature only adds an import and a JSX swap in one existing page component.

## Complexity Tracking

*No violations — table omitted.*

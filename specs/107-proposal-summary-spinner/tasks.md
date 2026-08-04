# Tasks: Proposal Summary Spinner Consolidation

**Input**: Design documents from `/specs/107-proposal-summary-spinner/`

**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: Not requested for this feature — verification is via `npx tsc --noEmit` and manual visual check (see quickstart.md).

**Organization**: Single user story (US1, P1), single file. No Setup or Foundational phase needed — there is no shared infrastructure to stand up.

## Phase 1: User Story 1 - Consistent loading indicator on Proposal Summary (Priority: P1) 🎯 MVP

**Goal**: Replace the hand-rolled 40px spinner in Proposal Summary with the shared `LoadingSpinner` component at `size="md"`, matching every other whole-panel loading state in the app.

**Independent Test**: Open a Proposal's Summary tab while the workspace iframe is loading; the spinner must visually match the shared spinner used on other detail pages (size, color, text placement).

- [X] T001 [US1] In `app/proposals/[id]/summary/page.tsx`, add `import LoadingSpinner from "@/components/ui/LoadingSpinner";`
- [X] T002 [US1] In `app/proposals/[id]/summary/page.tsx`, replace the `loading` branch's hand-rolled spinner block (the `<div className="flex flex-col items-center gap-3">` wrapper containing the `w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin` div and the `<p>Loading workspace...</p>` caption) with `<LoadingSpinner size="md" text="Loading workspace..." />`
- [X] T003 [US1] Run `npx tsc --noEmit` from the repo root to confirm no type errors
- [X] T004 [US1] Run the quickstart.md validation steps manually (dev server, light + dark mode) to confirm visual parity with other `LoadingSpinner` call sites

**Checkpoint**: Proposal Summary's loading state is now visually identical to the app's other whole-panel loading states; this closes the last open item from the spec 106 spinner-consolidation audit.

---

## Dependencies & Execution Order

- T001 → T002 (import must exist before use) → T003 → T004. Fully sequential; no parallelizable tasks (all four touch/verify the same single file).

## Implementation Strategy

Single-story MVP: complete T001-T004 in order, then stop. No further phases exist for this feature.

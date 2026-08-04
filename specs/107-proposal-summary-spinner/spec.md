# Feature Specification: Proposal Summary Spinner Consolidation

**Feature Branch**: `107-proposal-summary-spinner`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Fix Proposal Summary's spinner, the one remaining tracked-open item from the spinner consolidation audit (spec 106). app/proposals/[id]/summary/page.tsx line 97 renders a lone hand-rolled spinner with a 'Loading workspace...' caption below it while the proposal's embedded Project Workspace iframe loads. This file was explicitly excluded from spec 106 because its spinner is w-10 h-10 (40px), a 3rd distinct size matching neither Bucket A's size='md' (48px) nor Bucket B's size='sm' (32px). This feature migrates this single file to use the shared LoadingSpinner component with size='md' and text='Loading workspace...', on semantic grounds (a whole-panel loading state, not a nested tab-panel one)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consistent loading indicator on Proposal Summary (Priority: P1)

A user viewing a Proposal's Summary tab waits for the embedded Project Workspace panel to load. While it loads, they see a loading indicator that looks and behaves identically to every other loading indicator in the app (same spinner style, same brand color, same text placement), instead of a one-off variant unique to this page.

**Why this priority**: This is the last remaining inconsistent loading indicator identified by the design-consistency audit; closing it makes the loading-state pattern 100% consistent app-wide.

**Independent Test**: Open a Proposal's Summary tab while the workspace iframe is still loading and visually confirm the spinner matches the shared spinner used on other detail pages (e.g., Proposal Detail, Quote Detail) in size, color, and text layout.

**Acceptance Scenarios**:

1. **Given** a user navigates to a Proposal's Summary tab, **When** the embedded Project Workspace has not yet loaded, **Then** the user sees the shared loading spinner with the caption "Loading workspace..." centered within the panel.
2. **Given** the Project Workspace finishes loading, **When** the iframe becomes ready, **Then** the loading spinner and caption disappear and the workspace iframe is shown, unchanged from current behavior.

### Edge Cases

- What happens when the proposal has no `Project_Workspace__c` value at all (no workspace configured)? Existing fallback message behavior (shown after `loading` becomes false) is unaffected by this change — only the loading-state visual changes.
- What happens in dark mode? The shared spinner component already supports dark mode identically to every other page using it; no separate handling is needed here.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Proposal Summary page MUST display the same shared loading-spinner component used elsewhere in the app while the embedded workspace is loading, instead of a page-specific spinner.
- **FR-002**: The loading state MUST continue to display the caption "Loading workspace..." beneath the spinner.
- **FR-003**: The visual size of the loading spinner MUST match the size used for other whole-panel/whole-page loading states across the app (the larger of the app's two standard spinner sizes), not the smaller size used for nested tab-panel loading states.
- **FR-004**: No other behavior of the Proposal Summary page (workspace loading logic, fallback states, layout of the surrounding panel) may change.

### Key Entities

- **Proposal Summary loading state**: The transient UI shown while `loading` is true and the proposal's embedded workspace has not yet rendered.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the app's whole-page/whole-panel loading states (previously 25 of 26 after spec 106) now use the shared spinner component — Proposal Summary is the final one.
- **SC-002**: Visual review confirms the Proposal Summary loading indicator is indistinguishable in style from other detail-page loading indicators (same size, color, and text placement pattern).

## Assumptions

- The 40px hand-rolled spinner is treated as a whole-panel loading state (matching the app's larger standard spinner size) rather than a nested tab-panel state, because it fills a large dedicated content area (`h-[calc(100vh-200px)]`), not a small in-page tab section.
- No commit, push, or sibling-repo propagation is performed as part of this feature; that remains a separate, explicit follow-up step per this project's established workflow.

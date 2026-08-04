# Feature Specification: Spinner Consolidation

**Feature Branch**: `106-spinner-consolidation`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Fix the audit's 'spinner consolidation' finding, scoped after a full-codebase investigation of all 66 animate-spin occurrences across the app. components/ui/LoadingSpinner.tsx exists but is confirmed imported nowhere in the app - 0 call sites. The 66 occurrences fall into 4 distinct shapes; this feature covers only the 2 that genuinely match LoadingSpinner's existing design, leaving inline button/icon spinners as a separate, explicitly out-of-scope initiative requiring a different, smaller shared primitive. (1) Bucket A - 'this whole page is loading' - 16 files each rendering a lone centered h-12 w-12 spinner - an exact match for LoadingSpinner's existing size='md'. (2) Bucket B - 'this tab panel's content is loading' - 10 files each rendering a smaller h-8 w-8 spinner, including 2 files currently using an off-brand blue instead of the brand color (corrected automatically by this migration), and the shared DataTable component's own built-in loading-row spinner. Since LoadingSpinner is confirmed unused anywhere, this feature also changes LoadingSpinner's own size='sm' definition to match Bucket B's real-world size exactly, rather than inventing an awkward new size name. Explicitly out of scope: inline button/icon spinners (~25+ occurrences) including save-button spinners, 8 near-identical duplicated file-upload spinners across every module's FilesTab component, and refresh-icon spinners - none of these fit LoadingSpinner's shape, and forcing them onto it would be worse than leaving them as-is until a dedicated small-inline-spinner initiative is scoped separately."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Every full-page loading state looks the same (Priority: P1)

A user navigating to any detail page, line-detail page, or the order-creation page while its data is still loading sees the exact same loading spinner — not one of several subtly different hand-rolled spinner styles depending on which page happened to be built by whom.

**Why this priority**: The largest, most consistent population — 16 files already using the identical visual pattern (same size, same color, same centering), just never wired through the one shared component that already exists for exactly this purpose.

**Independent Test**: Open several different detail/line-detail pages while their data is loading (or throttle the network to see the loading state longer) and confirm every one renders the identical spinner component.

**Acceptance Scenarios**:

1. **Given** any of the 16 full-page-loading files, **When** its data is still loading, **Then** it renders the shared loading spinner component at its full-page size.
2. **Given** a page whose loading block also had a separate text label (e.g., "Loading..."), **When** viewed, **Then** that label is preserved.
3. **Given** the page once loading completes, **When** the real content renders, **Then** it is completely unaffected by this change.

---

### User Story 2 - Every tab-panel loading state looks the same, and uses the brand color (Priority: P2)

A user viewing a tab or nested sub-section that's still fetching its own data sees the same smaller loading spinner used consistently across every other tab panel — not a slightly different size, and not, in 2 confirmed cases, an off-brand color.

**Why this priority**: A smaller, still-real population (10 files) with the added benefit of fixing 2 confirmed off-brand color bugs as a side effect of the same migration, and improving the shared `DataTable` component's own loading state for every table that uses it.

**Independent Test**: Open a tab or sub-section that fetches its own data (e.g., a Product's compliance certs tab) while it's loading, and confirm it renders the shared spinner component at its tab-panel size, in the brand color.

**Acceptance Scenarios**:

1. **Given** any of the 10 tab-panel-loading files, **When** its content is still loading, **Then** it renders the shared loading spinner component at its tab-panel size.
2. **Given** the 2 files previously using an off-brand color, **When** viewed loading, **Then** the spinner now renders in the app's brand color.
3. **Given** any table built on the shared `DataTable` component, **When** it shows its built-in loading state, **Then** it now uses the shared spinner component too.

### Edge Cases

- What happens to inline button/icon spinners (save buttons, file-upload progress indicators, refresh icons)? Left completely untouched — they don't fit the shared spinner component's shape (a centered, padded block with an optional text label), and are explicitly out of scope for this feature; they'd need a different, smaller shared primitive designed separately.
- What happens to the shared spinner component's existing `size="sm"` definition? Since it's confirmed unused anywhere in the codebase today, this feature redefines it to exactly match the tab-panel population's real-world size, rather than leaving an unused, mismatched value in place or inventing a new size name.
- What happens if a page's old loading block had extra wrapper markup (e.g., a `mx-auto`/`mb-4` div) solely to center the old raw spinner? That wrapper is removed, since the shared component centers itself; any other purpose that wrapper served (like a separately-positioned text label) is preserved.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All 16 full-page-loading files MUST render the shared loading spinner component instead of a hand-rolled spinner.
- **FR-002**: All 10 tab-panel-loading files (including the shared `DataTable` component's built-in loading state) MUST render the shared loading spinner component instead of a hand-rolled spinner.
- **FR-003**: Any text label that previously accompanied a loading spinner MUST be preserved.
- **FR-004**: The 2 files previously using an off-brand spinner color MUST render in the app's brand color after migration.
- **FR-005**: The shared loading spinner component's "tab-panel" size option MUST be resized to exactly match the real-world tab-panel spinner size, since it has no existing call sites to preserve.
- **FR-006**: Inline button/icon spinners MUST NOT be modified by this feature.
- **FR-007**: None of the fixes in this feature MUST change any business logic, data-fetching, or Salesforce read/write behavior — every change is a presentation-layer correction.

### Key Entities

- **Full-page loading spinner**: The lone, centered spinner shown while an entire page's data is still being fetched, now rendered via one shared component across all 16 occurrences.
- **Tab-panel loading spinner**: The smaller, centered spinner shown while a nested tab or sub-section's own data is still being fetched, now rendered via the same shared component (at a smaller size) across all 10 occurrences.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the 16 full-page-loading files render the shared spinner component.
- **SC-002**: 100% of the 10 tab-panel-loading files render the shared spinner component.
- **SC-003**: 0 regressions in any loading-state text labels.
- **SC-004**: 0 off-brand spinner colors remain among the migrated files.
- **SC-005**: 0 regressions in any business logic, data-fetching, or Salesforce interaction across all changes in this feature.

## Assumptions

- This feature is scoped to the 2 confirmed shape-matches for the existing shared spinner component (full-page and tab-panel loading states) — inline button/icon spinners are a distinctly different shape and are explicitly excluded, per the investigation that preceded this spec.
- Redefining the shared component's "tab-panel" size to match Bucket B's real-world size is safe precisely because that size option has zero existing call sites anywhere in the codebase today.
- No database schema or Salesforce data changes are required — every fix is presentation-layer, consistent with the existing architecture.
- No sibling-folder propagation, commit, or push is included in this feature's scope — per this repo's established convention, those happen only when explicitly requested after implementation and verification.

# Feature Specification: Redundant Page Padding

**Feature Branch**: `105-redundant-page-padding`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Fix the audit's remaining 'Layout' tier findings on redundant page-padding wrappers, confirmed via fresh investigation as two independent, single-file defects. Both pages stack their own extra background/padding wrapper on top of the shared Sidebar shell's own inset. (1) app/search/SearchClientPage.tsx wraps its entire content in a div with a redundant page-background color that doesn't even match the shell's own background (a visible light-mode color mismatch, not just double-padding), plus a redundant horizontal inset stacking on the shell's own padding. Fix removes both wrapper divs entirely, letting Search's content sit directly in the shell's own background/padding like every other page. (2) app/inventory/[id]/page.tsx's root element is redundant with the shell's own padding applied via app/inventory/layout.tsx's Sidebar wrapper - confirmed this Detail page is the outlier since its own sibling List page correctly uses a minimal root wrapper, avoiding this exact double-inset. Fix removes the redundant padding from Detail's root div. Explicitly out of scope: Search's other still-open finding about reusing ErrorMessage for its config-missing state - investigated and declined, same shape-mismatch reasoning as spec 103's Unauthorized decision; Inventory List's own root wrapper is already correct and untouched; no other page's padding is touched."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search page background and spacing match every other page (Priority: P1)

A user on the Search page sees the same background color and content inset used by every other page in the app — not a slightly different, mismatched background color and an extra layer of horizontal padding stacked on top of the app shell's own spacing.

**Why this priority**: The more visible of the two findings — a genuine color mismatch (not just extra spacing) that's noticeable in light mode, on a page every user is likely to visit.

**Independent Test**: Open Search and compare its background color and content inset against another simple page (e.g., Reports); confirm they now match.

**Acceptance Scenarios**:

1. **Given** the Search page, **When** viewed in light mode, **Then** its background color matches the app shell's standard background rather than a different shade.
2. **Given** the Search page, **When** viewed at any width, **Then** its content sits at the same horizontal inset as other pages, without an extra nested padding layer.
3. **Given** Search's actual functionality (search box, filters, results grid), **When** used, **Then** it behaves exactly as before — only the outer background/padding wrapper is removed.

---

### User Story 2 - Inventory Detail's spacing matches Inventory List's (Priority: P2)

A user navigating from the Inventory list into a specific item's detail page sees a consistent amount of padding around the content — not a noticeably larger inset appearing for no reason between two pages in the same module.

**Why this priority**: A real, isolated spacing mismatch between 2 pages in the same immediate flow — lower urgency than User Story 1 since it's spacing only, not a color mismatch.

**Independent Test**: Open Inventory List, note its content inset, then click into any item's Detail page and confirm the inset is no longer noticeably larger.

**Acceptance Scenarios**:

1. **Given** Inventory Detail, **When** viewed, **Then** its content padding no longer stacks an extra inset on top of the app shell's own spacing.
2. **Given** Inventory Detail's actual content (breadcrumb, header, tables), **When** viewed, **Then** it is otherwise unchanged — only the outer padding wrapper is corrected.

### Edge Cases

- What happens to Search's other still-open finding — reusing the shared `ErrorMessage` component for its "configuration missing" state? Investigated and declined — that state displays a numbered environment-variable setup checklist that `ErrorMessage`'s shape has no room for, the same reasoning already applied to Unauthorized in a prior spec. Not part of this feature.
- What happens to Inventory List's own root padding? Left untouched — it's already the correct, minimal treatment; only Detail's outlier padding is corrected.
- What happens to any other page's padding? Untouched — this feature is scoped to these 2 confirmed defects only.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Search page's background color MUST match the app shell's standard background rather than a mismatched shade.
- **FR-002**: The Search page's content MUST NOT have an extra horizontal padding layer stacked on top of the app shell's own spacing.
- **FR-003**: Search's actual search/filter/results functionality MUST NOT change as a result of FR-001/FR-002.
- **FR-004**: Inventory Detail's content padding MUST NOT stack an extra inset on top of the app shell's own spacing.
- **FR-005**: Inventory Detail's actual content (breadcrumb, header, tables) MUST NOT change as a result of FR-004.
- **FR-006**: Search's "configuration missing" error state MUST NOT be rebuilt onto the shared `ErrorMessage` component — this feature corrects padding/background only.
- **FR-007**: Inventory List's own root padding MUST NOT be modified by this feature.
- **FR-008**: None of the fixes in this feature MUST change any business logic, data-fetching, or Salesforce read/write behavior — every change is a presentation-layer correction.

### Key Entities

- **Page content wrapper**: The outermost element of a page's content (inside the shared app shell), which should rely on the shell's own background/padding rather than adding a redundant, possibly mismatched layer of its own.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Search's background color visually matches the app shell's standard background in light mode.
- **SC-002**: Search's content inset matches other simple pages, with no extra nested padding layer.
- **SC-003**: Inventory Detail's content inset visually matches Inventory List's.
- **SC-004**: 0 regressions in Search's search/filter/results functionality.
- **SC-005**: 0 regressions in Inventory Detail's breadcrumb, header, or table content.
- **SC-006**: 0 regressions in any business logic, data-fetching, or Salesforce interaction across all changes in this feature.

## Assumptions

- Search's fix removes its redundant wrapper divs entirely rather than adjusting their colors/padding to match the shell — since the shell already provides the correct background and padding, no wrapper is needed at all.
- Inventory Detail's fix removes its redundant padding class rather than reducing it to a smaller value — matching Inventory List's own minimal-wrapper precedent exactly.
- Search's "config-missing" state keeps its own bespoke layout (numbered setup checklist) rather than being rebuilt onto `ErrorMessage` — the same reasoning already applied to Unauthorized.
- No database schema or Salesforce data changes are required — every fix is presentation-layer, consistent with the existing architecture.
- No sibling-folder propagation, commit, or push is included in this feature's scope — per this repo's established convention, those happen only when explicitly requested after implementation and verification.

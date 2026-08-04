# Feature Specification: Quick Wins & Dead Code Cleanup

**Feature Branch**: `089-quick-wins-cleanup`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Fix the audit's 'Quick Wins' tier — a bundle of small, mechanical, low-risk fixes verified via fresh direct-codebase investigation. Covers: 5 invalid/no-op Tailwind classes silently doing nothing (a case-typo, a missing-brackets arbitrary value repeated twice, a contradictory dead class, a not-a-real-token spacing class, plus one new finding); 2 confirmed-dead files with zero incoming references (a 740-line orphaned stylesheet, an unused component); 1 lowercase filename breaking an otherwise-universal PascalCase convention; 3 dead/miswired interactive elements each needing a different treatment (a 'Generate Report' button with no backend to wire to — disable it; an 'Average Aged' inventory stat card that looks clickable but isn't, even though its backing data already exists and its 3 sibling cards already work this way — wire it up for real; a redundant dead eye-icon on Purchase Order list rows — remove it, since other cells already navigate); and 1 unreachable dead code path (Shipment Detail's in-page 'Tracking' tab, confirmed superseded by an already-working modal from a prior spec — remove the dead branch and delete the now-fully-unused file it renders). One originally-flagged item (a hardcoded status color) was investigated and confirmed already fixed by a prior spec, so it's dropped from scope."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Every styling class actually does what it looks like it does (Priority: P1)

A developer reading or maintaining any of these 5 spots sees Tailwind classes that visibly work as intended — no silent no-ops from typos, missing brackets, or invalid tokens. A user viewing the Quote Sales Orders sub-tab, Configure's account dropdown, a product card in the catalog, or an Order Detail stat tile sees the padding, sizing, and text emphasis that was actually intended, not what happened to render by accident when the intended styling silently failed to apply.

**Why this priority**: Highest-value-per-effort fixes in this tier — each is a one-line, zero-risk correction, but each currently produces a real (if subtle) visible difference from intended design, and left uncorrected, invalid classes like these tend to get copy-pasted forward into new code.

**Independent Test**: View each of the 5 affected screens before and after the fix and confirm the intended spacing/sizing/emphasis now actually renders.

**Acceptance Scenarios**:

1. **Given** the Quote Detail page's Sales Orders sub-tab, **When** viewing its content wrapper, **Then** the intended padding is visibly applied (previously zero padding due to a case-typo'd class).
2. **Given** Configure's account-selector dropdown, **When** it opens, **Then** it renders at its intended width (previously an arbitrary, non-standard width value that Tailwind silently dropped).
3. **Given** any product card in the Products catalog, **When** viewing the product name and description, **Then** both respect their intended minimum width, and the product name reads visibly larger than its description (previously a contradictory size class made the name render at the smaller of two conflicting sizes).
4. **Given** an Order Detail stat tile, **When** viewing its layout, **Then** it renders at its intended width rather than a silently-ignored non-standard value.

---

### User Story 2 - No confusing dead code lingers in the codebase (Priority: P2)

A developer working in the Configure or Quotes modules doesn't stumble across an orphaned 740-line stylesheet or an unused, never-rendered component while trying to understand what's actually in use, and doesn't find a lowercase-named file breaking an otherwise-consistent naming pattern in the Purchase Order line-detail module.

**Why this priority**: Pure codebase hygiene — no end-user-visible change, but removes real, measurable maintenance friction (dead files that could mislead a future edit, a naming outlier that stands out every time that directory is browsed).

**Independent Test**: Confirm the 2 dead files no longer exist and nothing references them; confirm the renamed file's single caller still works exactly as before.

**Acceptance Scenarios**:

1. **Given** the codebase after this change, **When** searching for the 2 confirmed-dead files, **Then** neither exists, and no remaining file references them.
2. **Given** the Purchase Order Line Detail page's Serial Number Log tab, **When** it renders, **Then** it behaves exactly as before, now served from a PascalCase-named file consistent with every sibling file in its directory.

---

### User Story 3 - Every clickable-looking element on screen is either real or honestly disabled (Priority: P1)

A user on the Reports page sees the "Generate Report" button clearly presented as not-yet-available rather than looking active with no effect when clicked. A user on the Inventory list can click the "Average Aged" stat card exactly like its 3 sibling cards and see the table filter to just those aged items. A user browsing the Purchase Order list no longer sees a decorative eye icon on each row that does nothing when clicked.

**Why this priority**: Directly affects end-user trust in the interface — clicking something that visibly invites a click and getting no response is a worse experience than either a working control or an honestly-disabled one. Tied for P1 because it's the most user-visible category in this tier.

**Independent Test**: Click each of the 3 elements and confirm the new, honest behavior — a clearly-disabled Generate Report button, a working Average Aged filter, and no dead eye icon remaining.

**Acceptance Scenarios**:

1. **Given** the Reports page, **When** a user views the "Generate Report" button, **Then** it's visibly disabled (not clickable, distinct styling) rather than appearing active with no effect.
2. **Given** the Inventory list, **When** a user clicks the "Average Aged" stat card, **Then** the table filters to show only aged inventory items, exactly like clicking any of its 3 sibling cards already does.
3. **Given** the Inventory list's compact filter row (used on smaller screens), **When** a user views it, **Then** an "Average Aged" option is available alongside the existing filter options, staying in sync with the stat cards above it.
4. **Given** the Purchase Order list, **When** a user views any row, **Then** no non-functional eye icon remains — existing navigation via the row's own linked fields is unchanged.

---

### User Story 4 - Shipment Detail has no unreachable dead tab (Priority: P3)

A developer working on the Shipment Detail page doesn't encounter a tab definition and its rendered content that can never actually be reached through any user interaction, left over from before an equivalent feature was rebuilt as a modal elsewhere on the same page.

**Why this priority**: Lowest priority — genuinely unreachable code with zero end-user-visible effect either way, but its removal eliminates a confusing trap for a future developer who might otherwise try to "fix" a tab that was never wired up, not realizing an equivalent, working modal-based feature already exists on the same page.

**Independent Test**: Confirm the working "Track Timeline" modal (already shipped separately) is completely unaffected; confirm the dead tab definition and its rendering branch are gone; confirm the file that rendered it no longer exists and nothing else references it.

**Acceptance Scenarios**:

1. **Given** the Shipment Detail page, **When** a user opens the working "Track Timeline" modal via its button, **Then** it behaves exactly as before this change.
2. **Given** the Shipment Detail page's tab bar, **When** inspecting its available tabs, **Then** no unreachable "tracking" tab definition remains anywhere in the underlying code.

### Edge Cases

- What happens to the Purchase Order list row after the eye icon is removed — does the row still communicate that clicking any of its own linked fields (PO#, quote, proposal, order) navigates somewhere? Yes — those links are untouched; only the redundant non-functional icon is removed.
- What happens if a future feature genuinely needs report generation? The "Generate Report" button remains present and visibly disabled (not deleted), so it's a ready placeholder if a real backend is built later — this change only corrects its current honesty, not its future potential.
- What happens to the Average Aged card's existing displayed numbers (unique products, total value) once it becomes clickable — do they change? No — the fix only adds click-to-filter behavior; the stat values themselves are already computed correctly today and are unaffected.
- What happens to `ShipmentTabId`'s `"tracking"` value if some other, not-yet-found piece of code depends on it existing? Confirmed via investigation that its only use was the now-removed dead branch; removing it is safe.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Quote Sales Orders sub-tab's content wrapper MUST render with its intended padding (correcting a case-typo'd class that currently applies zero padding).
- **FR-002**: Configure's account-selector dropdown MUST render at its intended width (correcting a non-standard spacing class that Tailwind currently silently ignores).
- **FR-003**: Product catalog cards' name and description text MUST respect their intended minimum-width constraint (correcting a missing-brackets arbitrary value, appearing twice on the same card, that Tailwind currently silently ignores).
- **FR-004**: A product card's name heading MUST render visibly larger than its description text below it (correcting a contradictory pair of text-size classes currently applied to the same element).
- **FR-005**: An Order Detail stat tile MUST render at its intended width (correcting a non-standard spacing class that Tailwind currently silently ignores).
- **FR-006**: The 2 confirmed-dead files (an orphaned stylesheet and an unused component, both with zero incoming references anywhere in the codebase) MUST be deleted.
- **FR-007**: The lowercase-named Purchase Order Serial Number Log file MUST be renamed to match the PascalCase convention used by every sibling file in its directory, with its single existing caller updated accordingly and its rendered behavior unchanged.
- **FR-008**: The Reports page's "Generate Report" button MUST be visibly presented as disabled (not clickable) rather than appearing active while doing nothing, since no report-generation capability exists to wire it to.
- **FR-009**: The Inventory list's "Average Aged" stat card MUST become a real, working filter control — clicking it MUST filter the inventory table to the same "Average Aged" data category the card already displays statistics for, matching the existing click-to-filter behavior of its 3 sibling cards exactly.
- **FR-010**: The Inventory list's compact/mobile filter row MUST include an "Average Aged" option alongside its existing options, staying in sync with the stat cards' available filter values.
- **FR-011**: The Purchase Order list's non-functional row-level eye icon MUST be removed; the row's existing linked-field navigation MUST remain unchanged.
- **FR-012**: Shipment Detail's unreachable "tracking" tab definition and its dead rendering branch MUST be removed; the file that rendered it MUST be deleted once confirmed to have no other callers.
- **FR-013**: Shipment Detail's already-working "Track Timeline" modal (a separate, already-shipped feature) MUST NOT be affected by removing the unreachable in-page tab.
- **FR-014**: None of the fixes in this feature MUST change any business logic, data fetching, or Salesforce read/write behavior — every fix is either a pure styling correction, a dead-code removal, or a UI control being made honestly functional using data that already exists.

### Key Entities

- **Invalid Tailwind class instance (×5)**: A CSS utility class string that is syntactically present in the source but does not correspond to any real Tailwind utility (due to a typo, missing arbitrary-value brackets, an out-of-scale spacing number, or a self-contradicting pair) and therefore renders no visual effect today.
- **Dead file (×3 total across removals/rename)**: `app/configure/configure.css`, `app/quotes/[id]/components/QuoteScopeSummary.tsx` (both deleted), and the renamed Purchase Order Serial Number Log component file.
- **Average Aged filter category**: The inventory data category already returned by the existing inventory data source and already used to compute the "Average Aged" card's displayed statistics, gaining a new, real click-to-filter path onto the inventory table alongside the 3 categories that already have one.
- **Shipment Detail's dead tracking tab**: The unreachable tab definition, its dead rendering branch, and the component file it rendered — all removed as one unit, distinct from the separate, already-working "Track Timeline" modal feature on the same page.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the 5 identified invalid Tailwind class instances render their intended visual effect after the fix, verified by direct visual comparison before/after.
- **SC-002**: 0 remaining references anywhere in the codebase to either of the 2 deleted dead files.
- **SC-003**: The renamed Purchase Order Serial Number Log file's single call site continues to work with 0 behavior change.
- **SC-004**: 100% of the 3 fixed interactive elements behave honestly — the Generate Report button is visibly non-interactive, the Average Aged card filters the table exactly like its siblings, and the Purchase Order list has 0 remaining non-functional icons.
- **SC-005**: 0 remaining unreachable tab definitions in Shipment Detail's tab system; the separate, already-working Track Timeline modal shows 0 regressions.
- **SC-006**: 0 regressions in any business logic, data-fetching, or Salesforce interaction across all changes in this feature.

## Assumptions

- The "Generate Report" button is disabled in place (not removed entirely) since "Reports page coming soon..." copy on the same page implies real future intent for this feature — disabling honestly reflects "not ready yet" without discarding the placeholder, consistent with how a prior spec in this series handled an analogous no-backend CTA (disabled/dropped rather than left looking functional).
- The Purchase Order list's eye icon is removed entirely (not wired to a new action) since the audit and this feature's own investigation found no distinct "view" action implied anywhere else in the codebase, and the row's existing linked fields already provide navigation — inventing a new target would exceed this feature's fix-what-exists scope.
- "Average Aged" is treated as a real, wireable filter (not merely visual-affordance-stripping) because its backing data already exists in the same data source powering its 2 working sibling filters — this is a small logic addition (a new filter branch + type value), not new business logic or a new data source.
- Deleting `app/shipments/[id]/components/PlaceholderTabs.tsx` is safe because its only export has no callers once the dead tab-rendering branch that references it is removed — reconfirmed as part of this feature's own implementation, not assumed from the scoping investigation alone.
- No sibling-folder propagation, commit, or push is included in this feature's scope — per this repo's established convention, those happen only when explicitly requested after implementation and verification.

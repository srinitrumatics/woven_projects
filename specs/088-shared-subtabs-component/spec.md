# Feature Specification: Shared Underline SubTabs Component

**Feature Branch**: `088-shared-subtabs-component`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Build a shared underline SubTabs component and migrate every hand-rolled nested-tab bar onto it, plus fix 3 sites that duplicate the existing pill Tabs.tsx instead of importing it. Item #7 of the UI/UX audit's Top 20, rescoped via a fresh current-state re-investigation: the audit's own grep-based claim of 'six modules' was inaccurate (a naive grep for 'border-b-2 border-primary' only matched loading-spinner markup); the real pattern search found 18 genuine hand-rolled underline sub-tab bars across Orders, Proposals, Purchase Orders, Quotes, Supplier Bills, and Invoices, with at least 5 distinct drifting inactive-state style variants (some missing dark-mode support entirely), plus one confirmed invalid Tailwind class bug (`dark:hover:white`). Separately, 3 sites (Order Detail's view-mode tabs, Quote Line Detail's top tabs, PO Line Detail's 'Related Items' tabs) hand-roll a duplicate of the already-existing shared pill `Tabs.tsx` component instead of importing it, each drifting from it in a different way (wrong border-gray shade, a missing border entirely, a stray double-space). Explicitly out of scope: 11 QuoteLine sub-tab files that are content panels only, with no nav-bar UI of their own despite 'SubTab' in the filename; any visual redesign of sub-tab content, only the shared nav-bar shell."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Every nested sub-tab bar in the app looks and behaves consistently (Priority: P1)

A user viewing the Fulfillment/Purchases/Returns (or Payments) nested tabs on an Order, Proposal, Proposal Line, Purchase Order, Purchase Order Line, Quote, Quote Line, Supplier Bill, or Invoice detail page sees the same underline tab style everywhere: same active/inactive colors, same hover treatment, same dark-mode support. Today, 18 separate hand-rolled copies of this control exist across those modules, drifting in at least 5 different ways — some (Purchase Order Returns ×2, Supplier Bill Payments) have no dark-mode styling on this control at all, and one (Quote Line Returns) has a silently-broken hover class from a typo.

**Why this priority**: The single largest, most widespread inconsistency in this tier — 18 independent implementations of what should be one control, spanning 6 modules, including two confirmed real defects (a missing-in-3-places dark-mode gap and an invalid Tailwind class that silently does nothing). Building this once, correctly, fixes both defects as a side effect of consolidation.

**Independent Test**: Open the nested sub-tabs on an Order, a Proposal, a Purchase Order, a Quote, a Supplier Bill, and an Invoice detail page back-to-back, and confirm all six render identical active/inactive/hover styling in both light and dark mode.

**Acceptance Scenarios**:

1. **Given** a user opens the nested Fulfillment/Purchases/Returns tabs on any of the 6 in-scope modules, **When** comparing them side by side, **Then** all render identical active-tab and inactive-tab styling.
2. **Given** dark mode is enabled, **When** a user views any of the 18 migrated sub-tab bars, **Then** all show correct, legible dark-mode styling (including the 3 that previously had none at all).
3. **Given** a user hovers an inactive sub-tab in Quote Line Detail's Returns tab, **When** the hover state renders, **Then** the text visibly changes color (previously silently broken by an invalid class).
4. **Given** any of the 18 migrated sub-tab bars, **When** a user clicks a tab, **Then** the existing tab-switching behavior for that page is unchanged.

---

### User Story 2 - The 3 duplicated pill-tab sites use the real shared component (Priority: P2)

A user viewing Order Detail's view-mode tabs, Quote Line Detail's top tab row, or Purchase Order Line Detail's "Related Items" tabs sees tabs styled identically to every other page that correctly imports the shared pill `Tabs.tsx` component — rather than a hand-rolled duplicate that has drifted from it (wrong border-gray shade in two cases, a missing border entirely in the third).

**Why this priority**: A smaller, more contained fix than User Story 1 — three specific sites, no new component needed, just replacing a duplicate with the real shared import. Lower priority since the visual drift here is subtler (a border color/presence difference) than User Story 1's dark-mode gaps and broken hover state.

**Independent Test**: Open Order Detail's view-mode tabs, Quote Line Detail's top tabs, and PO Line Detail's "Related Items" tabs, and confirm each now renders with the exact same border/background/hover treatment as a page that already correctly imports `Tabs.tsx` (e.g. the Invoices list page).

**Acceptance Scenarios**:

1. **Given** a user views Order Detail's view-mode tabs, **When** comparing them to a page using the shared `Tabs.tsx` component, **Then** the border color matches exactly (previously a lighter gray shade than the shared component).
2. **Given** a user views Quote Line Detail's top tab row, **When** comparing it to the shared component, **Then** the border color matches and no stray double-space artifact remains in the markup.
3. **Given** a user views PO Line Detail's "Related Items" tabs, **When** inspecting the inactive tab state, **Then** it now has a visible border (previously missing entirely).

### Edge Cases

- What happens to the 11 `QuoteLine*SubTab.tsx`/`QuoteLineFilesTab.tsx`/`QuoteLineTaxesTab.tsx` files that have "SubTab"/"Tab" in their filename but were confirmed to contain no nav-bar UI of their own (only unrelated table-row borders)? They are explicitly out of scope and must not be touched — migrating them would be a no-op at best and a misapplied edit at worst.
- What happens on a sub-tab bar with only 2 tabs versus one with 4 (e.g. Supplier Bill Payments vs. a Fulfillment/Purchases/Returns trio)? The shared component must support a variable number of tabs without requiring layout changes per caller.
- What happens to any page's loading-spinner markup that happens to contain the literal substring "border-b-2 border-primary" (the source of the original audit's inaccurate "six modules" grep-based claim)? These are not tab bars and must not be modified by this feature.
- What happens if a migrated sub-tab bar's wrapper previously had a bottom border on its container (some do, some don't, per the investigation) versus one that didn't? The shared component's own styling must produce a visually correct result in both cases without requiring each caller to patch around it.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST provide one shared underline sub-tab component used by all 18 in-scope nested sub-tab bars, replacing each one's individually hand-rolled active/inactive/hover styling.
- **FR-002**: The shared sub-tab component MUST visually match the existing shared pill `components/ui/Tabs.tsx` component's API shape (same tabs-list/active-key/on-change pattern) while rendering the underline visual style rather than the pill style, since the two are intentionally distinct tiers of navigation.
- **FR-003**: Migrating a sub-tab bar to the shared component MUST NOT change any existing tab-switching behavior, only its visual shell (border/color/spacing/dark-mode).
- **FR-004**: All 18 migrated sub-tab bars MUST render correct, legible styling in both light and dark mode, including the 3 that previously had no dark-mode styling on this control at all.
- **FR-005**: The invalid Tailwind class in Quote Line Detail's Returns sub-tab (`dark:hover:white`) MUST be corrected as part of migrating that file onto the shared component.
- **FR-006**: The 3 sites that hand-roll a duplicate of the existing shared pill `Tabs.tsx` component (Order Detail's view-mode tabs, Quote Line Detail's top tabs, PO Line Detail's "Related Items" tabs) MUST be replaced with a direct import of `Tabs.tsx`, removing the duplicated markup entirely.
- **FR-007**: The 11 `QuoteLine*` files confirmed to contain no nav-bar UI of their own MUST NOT be modified by this feature.
- **FR-008**: Any loading-spinner markup that happens to contain the substring "border-b-2 border-primary" MUST NOT be modified by this feature — it is not a tab bar.
- **FR-009**: No visual redesign of any sub-tab's content is in scope — only the shared nav-bar shell (border/color/spacing/dark-mode/hover) changes; each page's tab content and business logic are preserved as-is.

### Key Entities

- **Shared SubTabs component**: The single reusable underline-style tab-bar control every migrated sub-tab bar renders through — owns active/inactive/hover styling and dark-mode support, mirroring the existing `Tabs.tsx`'s API shape but with the underline visual language.
- **Migrated sub-tab bar (×18)**: The nested Fulfillment/Purchases/Returns/Payments tab bars across Orders, Proposals (both order-level and line-level), Purchase Orders (both order-level and line-level), Quotes (both order-level and line-level), Supplier Bills, and Invoices — each retains its own tab-content panels but delegates its nav-bar shell to the shared component.
- **Pill-tab duplicate site (×3)**: Order Detail's view-mode tabs, Quote Line Detail's top tabs, and PO Line Detail's "Related Items" tabs — each currently hand-rolls a drifting duplicate of `Tabs.tsx` and will be updated to import it directly instead.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the 18 in-scope sub-tab bars share identical active/inactive/hover styling, verified by direct visual comparison across all 18.
- **SC-002**: 100% of the 18 migrated sub-tab bars render correct, legible dark-mode styling (up from 15 of 18 today).
- **SC-003**: 0 remaining invalid Tailwind classes among the 18 migrated sub-tab bars (the confirmed `dark:hover:white` typo is corrected).
- **SC-004**: 0 regressions in existing tab-switching behavior across all 18 migrated sub-tab bars and all 3 pill-tab duplicate sites.
- **SC-005**: 100% of the 3 pill-tab duplicate sites render with the exact same border/background/hover treatment as pages already correctly importing `Tabs.tsx`.
- **SC-006**: 0 remaining hand-rolled duplicates of the shared `Tabs.tsx` component's markup at the 3 in-scope sites.
- **SC-007**: 0 of the 11 explicitly out-of-scope `QuoteLine*` content-panel files are modified by this feature.

## Assumptions

- The shared `SubTabs` component is a new, separate component from `components/ui/Tabs.tsx` (not a `variant` prop added to it), since the pill and underline styles are two intentionally distinct navigation tiers used side-by-side on the same pages in several modules — collapsing them into one component with a variant flag would be a less clear API than two small, purpose-built components.
- The 18 in-scope files' active-state styling (`border-primary text-primary` / `border-transparent` for inactive) is already consistent across all of them and does not itself need to change — only the drifting inactive-state hover/dark-mode details are being unified.
- No new dependency is required — this is a pure Tailwind/React component built from the same primitives already used by `components/ui/Tabs.tsx`.
- No database, Salesforce, or business-logic changes are required — this is a presentation-layer component consolidation, matching the scope and approach of the prior `087-shared-modal-component` spec.
- The 3 pill-tab duplicate sites require no new component work, only replacing hand-rolled markup with an existing import — a smaller, more mechanical change than User Story 1.

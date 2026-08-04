# Feature Specification: Tab & Pagination Spacing Consistency

**Feature Branch**: `090-tab-spacing-consistency`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "fix all ui issues like tab, datatables, pagination and space between tab header and sub header & space between tab & tab content" — with 2 screenshots: a Proposal Detail page showing the pill tab row, underline sub-tab row, and table content all sitting nearly flush against each other with almost no gap, and a Shipments list page showing a DataTable and Pagination row. Investigated directly against the current codebase (not assumed from the screenshots alone): confirmed the near-zero gap is specifically the pill-tabs-to-sub-tabs boundary on Proposal and Quote Detail pages (the only 2 of 6 detail pages missing top padding on their tab-content wrapper), traced a second, more systemic root cause (the shared underline sub-tabs component's spacing is fully overridable per caller with no consistent default, producing gaps from 0 to 24px across its 17 call sites app-wide), and found one concrete, Shipments-specific inconsistency in how its pagination row is styled compared to every other list page in the app. No defect was found inside the shared DataTable/Pagination components themselves.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Proposal and Quote Detail pages have proper breathing room around their tabs (Priority: P1)

A user viewing a Proposal or Quote Detail page sees clear, comfortable vertical spacing between the top-level tab row (Products/Elements/Taxes/etc.) and whatever sits below it — whether that's a nested sub-tab row (for Fulfillment/Purchases/Returns) or table content directly — matching the spacing already present on every other detail page in the app (Purchase Orders, Invoices, Supplier Bills, Orders).

**Why this priority**: This is the exact defect shown in the reported screenshot — the two pages where content visually reads as "stuck" to the tab bar above it, a jarring, clearly-wrong-looking gap that every sibling detail page already gets right.

**Independent Test**: Open a Proposal Detail page and a Quote Detail page, view any tab, and confirm a clear gap exists between the tab row and the content below it, matching the gap visible on a Purchase Order or Invoice Detail page's equivalent boundary.

**Acceptance Scenarios**:

1. **Given** a user opens a Proposal Detail page, **When** viewing any top-level tab's content, **Then** there is a visually clear gap between the tab row and the content below it, not a near-zero gap.
2. **Given** a user opens a Quote Detail page, **When** viewing any top-level tab's content, **Then** the same clear gap is present.
3. **Given** a user compares this gap side-by-side with a Purchase Order Detail or Invoice Detail page's equivalent tab-to-content boundary, **Then** the spacing reads as consistent, not noticeably tighter.

---

### User Story 2 - Every nested sub-tab bar has the same, predictable space below it (Priority: P1)

A user viewing any nested sub-tab row (Fulfillment/Purchases/Returns, wherever it appears — Orders, Proposals, Purchase Orders, Quotes, Supplier Bills, Invoices, and their line-detail equivalents) sees the same consistent gap between the sub-tab row and its content below, everywhere it appears — not a gap that varies from nearly nothing to noticeably large depending on which module happens to be open.

**Why this priority**: This is the deeper, systemic root cause behind User Story 1 — the shared sub-tabs building block used everywhere already lets each of its 17 call sites set its own, uncoordinated spacing, so the "too tight" problem the user noticed on Proposals is really one visible symptom of a wider inconsistency that also produces "too loose" gaps elsewhere. Fixing the shared building block once fixes the problem everywhere it occurs, not just on the 2 pages a user happened to screenshot.

**Independent Test**: Open the nested sub-tabs on at least 4 different modules (e.g. Orders, Proposals, Quotes, Purchase Orders) and confirm the gap between the sub-tab row and its content is visually identical across all of them.

**Acceptance Scenarios**:

1. **Given** a user opens the nested sub-tabs on any module that has them, **When** comparing the gap below the sub-tab row across modules, **Then** the gap is the same everywhere, not ranging from "nearly none" to "noticeably large" depending on the module.
2. **Given** a page's sub-tab row sits inside a component that needs its own extra inset for layout reasons unrelated to tab spacing (for example, a panel with its own internal padding), **When** that page renders, **Then** the sub-tab-to-content gap still matches every other module's, without breaking that page's own necessary layout.

---

### User Story 3 - The Shipments list page's pagination looks like every other list page's (Priority: P2)

A user viewing the Shipments list page's pagination row (page numbers, Previous/Next) sees it styled the same way as every other list page's pagination row in the app (Proposals, Quotes, Purchase Orders, Supplier Bills, Orders) — not sitting on a distinct shaded background band that no other page has.

**Why this priority**: Lower priority than the tab-spacing fixes since it's a subtler visual difference (a light background tint) rather than a glaring layout gap, but it's a confirmed, concrete inconsistency unique to one page, worth correcting as part of the same pass since it was flagged in the same report.

**Independent Test**: Open the Shipments list page and at least 2 other list pages (e.g. Proposals, Purchase Orders) and confirm the pagination row's background and padding look the same across all of them.

**Acceptance Scenarios**:

1. **Given** a user opens the Shipments list page, **When** viewing its pagination row, **Then** it has no distinct shaded background band that other list pages' pagination rows don't have.
2. **Given** a user compares the Shipments pagination row to the Proposals or Purchase Orders list page's pagination row, **Then** both look the same.

### Edge Cases

- What happens on a page whose sub-tab bar previously relied on a non-default spacing override for a genuine structural reason (e.g. a panel needing extra horizontal inset because it has no other padding of its own)? That page's own structural inset must be preserved even as its vertical sub-tab-to-content gap is brought in line with every other page's.
- What happens to pages already correctly spaced (Purchase Orders, Invoices, Supplier Bills, Orders detail pages)? They must show zero visible change — only Proposals and Quotes are actually broken today.
- What happens to the DataTable and Pagination shared components' own internal styling? Investigated directly and found no defect inside either — this feature does not change them; only page-level usage of Pagination on the Shipments page is corrected.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Proposal Detail's tab-content wrapper MUST have the same top spacing as Purchase Order Detail, Invoice Detail, Supplier Bill Detail, and Order Detail's equivalent wrappers, eliminating the near-zero gap between the pill tab row and whatever renders below it.
- **FR-002**: Quote Detail's tab-content wrapper MUST receive the same fix as FR-001, since it has the identical defect.
- **FR-003**: The shared underline sub-tabs component MUST produce the same vertical gap below itself everywhere it's used, replacing the current situation where its 17 call sites each set an uncoordinated, arbitrary spacing value (ranging from no gap at all to a noticeably large one).
- **FR-004**: Fixing the shared sub-tabs component's spacing MUST NOT remove any call site's genuinely-needed structural layout adjustments (e.g. a panel's own horizontal inset) — only the vertical spacing below the sub-tab row is standardized.
- **FR-005**: The Shipments list page's pagination row MUST render without the shaded background band that no other list page's pagination row has, matching the plain presentation used everywhere else.
- **FR-006**: None of the fixes in this feature MUST change any business logic, data fetching, tab-switching behavior, or Salesforce read/write behavior — every fix is a spacing/styling correction.
- **FR-007**: Detail pages already correctly spaced (Purchase Orders, Invoices, Supplier Bills, Orders) MUST show no visible change as a result of this feature.

### Key Entities

- **Tab-content wrapper**: The container on a detail page that sits directly below the top-level pill tab row and holds whichever tab's content is currently active — the thing whose top spacing is being corrected on Proposals and Quotes specifically.
- **Shared underline sub-tabs component**: The single component (already built in a prior spec) used by all 17 nested sub-tab bars app-wide — gaining a consistent, predictable default spacing below itself as part of this feature.
- **Shipments pagination row**: The Previous/page-number/Next control at the bottom of the Shipments list page, currently wrapped in an extra shaded panel unique to this one page.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of Proposal and Quote Detail pages show a tab-to-content gap visually matching Purchase Order, Invoice, Supplier Bill, and Order Detail pages' equivalent gap.
- **SC-002**: 100% of the 17 sub-tab-bar call sites app-wide produce the same, single consistent gap below the sub-tab row, verified by direct visual comparison across at least 4 different modules.
- **SC-003**: 0 pages that need their own structural layout inset lose that inset as a side effect of the spacing standardization.
- **SC-004**: The Shipments list page's pagination row visually matches every other list page's pagination row (no distinct shaded band).
- **SC-005**: 0 regressions in any business logic, data-fetching, or tab-switching behavior across all changes in this feature.
- **SC-006**: 0 visible changes to the 4 detail pages already confirmed correctly spaced today.

## Assumptions

- The shared DataTable and Pagination components (`components/ui/DataTable.tsx`, `components/ui/Pagination.tsx`) were directly investigated and found to have no internal defect — this feature does not modify either component; the Shipments fix is a page-level usage correction only (removing an extra wrapper unique to that page), not a component change.
- The redundant nested rounded/shadow wrapper found identically on the Shipments, Invoices, and Orders list pages around their tables is visually inert (no visible effect, confirmed during investigation) and is out of scope for this feature, which focuses on the concrete, visible spacing defects the user actually reported.
- "The same consistent gap" for the underline sub-tabs component (FR-003) means one single spacing value used everywhere, not a menu of acceptable values — the exact value is an implementation detail to be chosen consistently, not dictated by this spec.
- No sibling-folder propagation, commit, or push is included in this feature's scope — per this repo's established convention, those happen only when explicitly requested after implementation and verification.

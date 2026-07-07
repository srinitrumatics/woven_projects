# Feature Specification: Paginate the Remaining Returns Sub-Tabs

**Feature Branch**: `048-returns-subtab-pagination`

**Created**: 2026-07-07

**Status**: Draft

**Input**: User description: "add pagination to all datatables for sub tabs"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Every sub-tab within the order Returns tab pages its rows consistently (Priority: P1)

A user viewing an order's **Returns** tab switches between its four sub-tabs — RMAs, Credit
Memos, Debit Memos, and RTVs. The RMAs and Credit Memos sub-tabs already show 10 rows at a
time with page navigation, matching every other data table in the portal. The Debit Memos and
RTV sub-tabs, however, currently render every row at once with no pagination — an
inconsistency within the very same tab group that a user notices immediately when switching
between sub-tabs on a record with many debit memos or RTVs.

**Why this priority**: This is the exact reported gap — the same view has some sub-tabs
correctly paginated and some not, which is a more visible/confusing inconsistency than a whole
table simply lacking pagination, since the user can compare sub-tabs side by side within one
click.

**Independent Test**: On an order with more than 10 debit memos (or more than 10 RTVs), open
the order's Returns tab, switch to the Debit Memos sub-tab (or the RTVs sub-tab), and confirm
only 10 rows show at once with working page navigation — matching the RMAs and Credit Memos
sub-tabs in the same tab group.

**Acceptance Scenarios**:

1. **Given** an order's Returns tab with more than 10 debit memos, **When** the user switches
   to the "Debit Memos" sub-tab, **Then** only 10 rows are shown along with pagination controls
   (page numbers, Previous/Next), matching the behavior already present on the RMAs and Credit
   Memos sub-tabs.
2. **Given** an order's Returns tab with more than 10 RTVs, **When** the user switches to the
   "RTV" sub-tab, **Then** only 10 rows are shown along with working pagination controls.
3. **Given** the user is on a later page of the Debit Memos (or RTV) sub-tab, **When** the user
   switches to a different sub-tab and back, **Then** the sub-tab returns to page 1 (matching
   the existing reset-on-switch behavior already used by the other sub-tabs in this tab group).
4. **Given** the user sorts a column while viewing the Debit Memos or RTV sub-tab, **When** the
   sort is applied, **Then** the currently-selected page number is preserved and the same page
   position is re-rendered against the newly-sorted rows — matching the RMAs and Credit Memos
   sub-tabs' existing behavior, which does not reset to page 1 on sort either (only switching
   sub-tabs resets the page).

---

### Edge Cases

- What happens when a sub-tab has 10 or fewer rows? Behavior is unchanged from every other
  paginated table in the app — the row list displays fully, consistent with how the RMAs and
  Credit Memos sub-tabs already behave with a small row count.
- What happens to the existing "kept unchanged per spec" hyperlink behavior on the Debit Memos
  and RTV sub-tabs (Customer Order links, etc., added in a prior feature)? It is preserved
  exactly as-is — only pagination is added; no columns, links, or row content change.
- What happens to column sorting and column resizing on these two sub-tabs? Both continue to
  work exactly as they do today; only the addition of page-limiting and pagination controls
  changes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST page the Debit Memos sub-tab of the order Returns tab in groups of
  10 rows, with working Previous/Next and page-number navigation.
- **FR-002**: System MUST page the RTV sub-tab of the order Returns tab in groups of 10 rows,
  with working Previous/Next and page-number navigation.
- **FR-003**: System MUST reset both sub-tabs to page 1 whenever the user switches to that
  sub-tab, matching the existing reset-on-switch behavior of the RMAs and Credit Memos
  sub-tabs. Sorting a column MUST NOT itself reset the page, matching those same sub-tabs'
  existing sort behavior.
- **FR-004**: System MUST NOT change any other existing behavior of these two sub-tabs —
  columns, hyperlinks, sorting, column resizing, and row content remain exactly as they are
  today; pagination is the only addition.
- **FR-005**: System MUST NOT change the already-correctly-paginated RMAs and Credit Memos
  sub-tabs, or any other data table in the application, as part of this fix.

### Key Entities

- **Returns Sub-Tab**: One of the four mutually-exclusive row-list views (RMAs, Credit Memos,
  Debit Memos, RTVs) shown within an order's Returns tab, selected by a sub-tab control. Two of
  the four (Debit Memos, RTVs) are missing pagination today; this feature closes that gap.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the four sub-tabs in the order Returns tab (RMAs, Credit Memos, Debit
  Memos, RTVs) page their rows in groups of 10 with working navigation — no sub-tab in this
  group behaves differently from its siblings.
- **SC-002**: Zero regressions to the RMAs and Credit Memos sub-tabs' existing pagination, or
  to any other data table's sorting, resizing, or content in the application.
- **SC-003**: Switching sub-tabs always returns the Debit Memos and RTV views to page 1, and
  sorting never resets the page on its own — both exactly matching the sibling RMAs and Credit
  Memos sub-tabs' existing behavior.

## Assumptions

- "Sub tabs" in this request refers to mutually-exclusive nested row-list views selected by a
  secondary tab control within a single parent tab (e.g., RMAs/Credit Memos/Debit
  Memos/RTVs within an order's "Returns" tab) — as distinct from the top-level record tabs
  (Taxes, Files, Fulfillment, etc.) already covered by a prior feature
  (`047-add-datatable-pagination`).
- A systematic review of every such nested sub-tab group across the application (orders,
  proposals, proposal lines, quotes, quote lines, purchase orders, purchase order lines,
  invoices, supplier bills) found exactly one gap: the order Returns tab's Debit Memos and RTV
  sub-tabs. Every other sub-tab group already pages every one of its sibling views
  consistently (confirmed by inspecting each group's sub-tab-switching and pagination-state
  wiring, not just whether the containing file has pagination present anywhere).
- Taxes-breakdown tables remain out of scope, consistent with the prior pagination feature's
  explicit exclusion.
- This applies to all user roles/portals (Client, Partner, Client-Partner) since the underlying
  component is shared, not role-specific.

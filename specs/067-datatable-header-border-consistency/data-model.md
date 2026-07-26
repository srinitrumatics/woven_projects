# Phase 1 Data Model: Standardize Data Table Header Corners & Border Styling

## Note

This feature is a presentation-only styling correction. It introduces no new persisted data,
database tables, or business entities, and requires no Drizzle schema changes. The "entity"
below is the conceptual **presentation contract** for a data table's visual styling — the set of
attributes being standardized across every table in the app — not a stored data record.

## Entity: Data Table Style

Represents the standardized visual treatment every on-screen data table in the web app must
follow.

| Attribute | Description | Standardized Value |
|---|---|---|
| Header corner radius | Rounding applied to the header row's top-left and top-right corners | `rounded-lg` (via outer wrapper + `overflow-hidden`, matching the existing `ElementsTab.tsx` pattern) |
| Outer border | Border framing the full perimeter of the table | None — removed from all tables that currently have it (`ReturnsTab.tsx`, `TaxesTab.tsx`, `POLinesTable.tsx`) |
| Outer visual separation | Non-border way the table is distinguished from the page background | `shadow-sm` (kept/added where the outer border is removed) |
| Row bottom border | Divider line under each data row, including the last | `divide-y divide-gray-200 dark:divide-gray-700` on the row container (`TBody`/`tbody`) |
| Light/dark mode support | Whether the above render correctly in both themes | Required — all values already have `dark:` variants defined |

### Relationships

- Applies to every consumer of `components/ui/DataTable.tsx` (`Table`, `THead`, `TBody`, `Tr`,
  `Th`, `Td`) — approximately 98 files across list pages and detail-page sub-tabs.
- Applies by hand to `components/UserManagement/UserList.tsx`, which renders equivalent raw
  `<table>` markup outside the shared primitive.
- Does **not** apply to `app/orders/[id]/components/PDFTemplate.tsx` (printed/exported document,
  out of scope per spec Assumptions).

### Validation Rules (from spec Functional Requirements)

- FR-001 / FR-006: Header corner radius must render correctly even when the table scrolls
  horizontally (no square corners exposed at scroll boundaries).
- FR-002: No table may have a border value present on all four sides of its outer wrapper
  simultaneously.
- FR-003: Row bottom border must be present on every row, including the last row in the table
  (i.e., not just between rows).
- FR-004: Every value above must have a corresponding `dark:` Tailwind variant.
- FR-005: Header corner radius must remain visually correct while the header is in a sticky/pinned
  scroll state.
- FR-009: Empty-state and loading-state views must render inside a container that still carries
  the header-corner and no-outer-border treatment (i.e., these states don't bypass the standard
  wrapper).

### State Transitions

Not applicable — this is a static visual style, not a stateful entity.

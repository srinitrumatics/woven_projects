# Data Model: Redundant Page Padding

No database schema, Drizzle table, or Salesforce object changes anywhere in this feature. This document captures the exact edits per file.

## Search page wrapper removal (US1)

| File | Element | Before | After |
|---|---|---|---|
| `app/search/SearchClientPage.tsx:211` | Outer wrapper `<div>` | `<div className="bg-gray-50 dark:bg-gray-900">` | Removed |
| `app/search/SearchClientPage.tsx:212` | Inner wrapper `<div>` | `<div className="container mx-auto px-4">` | Removed |
| `app/search/SearchClientPage.tsx:332-333` | Matching closing tags | 2 `</div>` | Removed |

Reference (unchanged, already correct): `components/layouts/Sidebar.tsx:330` — `<main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 md:p-6">`.

## Inventory Detail padding removal (US2)

| File | Element | Before | After |
|---|---|---|---|
| `app/inventory/[id]/page.tsx:150` | Root `<div>` | `<div className="p-6">` | `<div>` |

Reference (unchanged, already correct): `app/inventory/page.tsx:343` — `<div className="flex flex-col gap-6 p-1 min-w-0">` (the sibling List page's own minimal wrapper); `app/inventory/layout.tsx` — the shared `<Sidebar>` wrapper applied to both List and Detail.

## Explicitly unmodified elements

| Element | Reason |
|---|---|
| Search's "configuration missing" error state | Keeps its own bespoke layout — investigated and confirmed not a fit for `ErrorMessage`, same reasoning as spec `103` |
| Inventory List's root wrapper (`p-1 min-w-0 flex flex-col gap-6`) | Already correct — the reference pattern, not touched |
| Every other page's padding | Not named in this feature's scope |

## Key Entities

- **Page content wrapper**: The outermost element of a page's content inside the shared app shell, now relying on the shell's own background/padding for Search and Inventory Detail instead of a redundant, possibly mismatched layer of its own.

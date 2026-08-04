# Data Model: Admin-Portal Structural Fixes

No database schema, Drizzle table, or Salesforce object changes anywhere in this feature. This document captures the component/state changes per file.

## `components/Header.tsx` (US1)

| Element | Before | After |
|---|---|---|
| `isAdminPortalUser` (new local const) | N/A | `user?.role === 'Super Admin' || user?.role === 'Admin'` |
| Account-selector block (`{user && (...)}`, lines 70-137) | Renders whenever `user` is truthy | Renders only when `user && !isAdminPortalUser` |
| Notification-bell `<button>` (lines 139-144) | Always renders | Renders only when `!isAdminPortalUser` |
| Hamburger, theme-toggle, user-avatar dropdown | Unchanged | Unchanged |

## `app/(admin-portal)/admin-portal/organizations/page.tsx` (US2, US3, US4)

| State/Element | Before | After |
|---|---|---|
| `orgs`, `loading` (existing) | Unchanged | Unchanged |
| `error` (new) | N/A | `boolean`, `true` on fetch failure or unsuccessful API response |
| `searchQuery` (new) | N/A | `string`, filters `orgs` by name (case-insensitive substring) |
| Sort (new, via `useSortableData`) | N/A | `requestSort('name' \| 'createdAt')`, driven by a `<select>` |
| `currentPage` (new, via `Pagination`) | N/A | `number`, paginates the filtered+sorted result |
| Render branches | `loading` → skeleton; `orgs.length === 0` → empty state; else → full unfiltered grid | `loading` → skeleton; `error` → `ErrorMessage` with retry; `orgs.length === 0` (and no error) → empty state (unchanged); else → filtered+sorted+paginated grid |
| `page.tsx:138` `alert('No site URL configured...')` | Native blocking alert | `errorToast('No site URL configured for this organization.')` |

## `app/(admin-portal)/admin-portal/organizations/create/page.tsx` (US4)

| Element | Before | After |
|---|---|---|
| `create/page.tsx:262` `alert('No site URL configured...')` | Native blocking alert | `errorToast('No site URL configured for this organization.')` (new `useToast` import) |
| `create/page.tsx:692` `alert('Please complete "Load Products"...')` | Native blocking alert (informational only — `router.push` on line 696 already fires unconditionally right after, confirmed via source read) | `errorToast(...)` with identical message; `router.push` behavior unchanged |

## Key Entities

- **Admin-Portal session**: A signed-in user whose `role` is `'Super Admin'` or `'Admin'` — the same field/values `Sidebar.tsx` already checks.
- **Organization**: `{ id, name, orgId, salesforceUrl, siteUrl, createdAt }` — unchanged shape; gains search/sort/pagination handling in the UI layer only.
- **Organizations List fetch state**: Now 3-way — `loading`, `error` (new), or loaded (empty or populated) — instead of the prior 2-way `loading`/loaded where a failure was indistinguishable from a genuine empty result.

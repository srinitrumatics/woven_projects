# Research: Admin-Portal Structural Fixes

All findings below are grounded in a direct read of every affected file before planning. No `NEEDS CLARIFICATION` markers remain in the spec.

## 1. Header's Super Admin/Admin role check

**Decision**: Introduce a single local `const isAdminPortalUser = user?.role === 'Super Admin' || user?.role === 'Admin';` near the top of `components/Header.tsx`, then guard the account-selector block (`{user && (...)}` at line 70) with `{user && !isAdminPortalUser && (...)}` and wrap the notification-bell `<button>` (lines 139-144) in `{!isAdminPortalUser && (...)}`.

**Rationale**: Confirmed via direct read that `components/layouts/Sidebar.tsx:156,201` already uses the exact expression `user?.role === 'Super Admin' || user?.role === 'Admin'` twice to special-case the nav rendering (showing only an "Organizations" link instead of the full commerce nav array) — Header.tsx has access to the same `user` object via `useUserSession()` (already imported, line 19) but never performs this check anywhere. Reusing the identical boolean expression (rather than inventing a new role-check helper) keeps the two files' admin-detection logic textually identical, so a future change to what counts as an "admin-portal session" only needs updating in one well-known pattern, not reconciled across two different implementations.

**Alternatives considered**:
- Use the already-imported `isSuperAdmin` from `usePermissions()` (Header.tsx line 20) instead — rejected; that flag is a distinct concept (an `isSuperAdmin` localStorage-driven *permission bypass* for ordinary users, per Constitution Principle II) unrelated to the `user.role` field Sidebar.tsx checks for admin-portal identity. Using it here would conflate two different mechanisms.
- Build a dedicated `AdminPortalHeader` component instead of conditionally hiding elements in the shared `Header` — rejected; the account-selector and bell are the *only* 2 confirmed problem elements (the logo, hamburger, theme-toggle, and user-avatar menu all remain correct and desired for admin-portal sessions too), so a full component fork would duplicate far more markup than it fixes.

## 2. Organizations List search/sort/pagination

**Decision**: Add local `searchQuery` state and a search `<input>`; wire `useSortableData` (already generic and callable independent of the table-only `SortableHeader` component, confirmed via source read of `hooks/useSortableData.ts`) with a simple sort `<select>` (Name / Created Date, each toggling asc/desc via `requestSort`); wrap the final rendered slice in `components/ui/Pagination.tsx` (confirmed prop shape: `currentPage`, `totalPages`, `totalItems`, `itemsPerPage`, `onPageChange`, `itemName`).

**Rationale**: `useSortableData<T>(items, config)` returns `{ items: sortedItems, requestSort, sortConfig }` and has no dependency on `SortableHeader`'s table-header rendering — it's already designed to be called from any control. Organizations List is a card grid, not a table, so a `<select>`-driven sort (rather than clickable `<th>` headers) is the natural fit for this page's existing visual layout, while still reusing the same underlying hook every other list page uses for its sort *logic*.

**Alternatives considered**: Building a page-specific sort/search implementation from scratch — rejected; `useSortableData` and `Pagination` already exist precisely to avoid this, and FR-004/005/006 only require search/sort/pagination *capability*, not a specific `SortableHeader` UI which doesn't fit a card-grid layout anyway.

## 3. Distinguishing a fetch failure from a genuine empty list

**Decision**: Add a `const [error, setError] = useState(false);` alongside the existing `orgs`/`loading` state. Set it `true` in both the `.catch()` branch (network failure) and when `data.success` is falsy (API responded but reported failure) — the current code silently does nothing in that second case either, confirmed via source read (`page.tsx:26-29`). Render `components/ui/ErrorMessage.tsx` (confirmed exists, supports an `onRetry` callback) when `error` is true, before the existing `loading`/empty-state/populated branches. A retry re-runs the same fetch effect (via a retry counter dependency, or by extracting the fetch into a callable function invoked both on mount and on retry).

**Rationale**: The existing code already has 2 distinct silent-failure paths (network error, and a successful-but-unsuccessful API response) that both currently fall through to the same "no tenants active" empty state — confirmed via source read there is no `success`-check `else` branch today. Reusing the pre-existing `ErrorMessage` component (already used elsewhere in the app for this exact purpose, confirmed to exist in `components/ui/`) avoids building new error-display UI.

**Alternatives considered**: Using a toast (`errorToast`, already imported in this file) instead of a persistent `ErrorMessage` block — rejected as the sole mechanism; a toast disappears and doesn't replace what would otherwise render as a false "no organizations" empty state, so a persistent in-page error state (per FR-007, "distinct, visible") is required; a toast could optionally accompany it but isn't a substitute.

## 4. Alert-to-toast conversions

**Decision**: Replace all 3 confirmed `alert(...)` calls — Organizations List's `page.tsx:138` ("no site URL"), Organization Create's `create/page.tsx:262` ("no site URL"), and `create/page.tsx:692` ("complete Load/Index Products first") — with `errorToast(...)` (List page already imports `useToast`'s `error` as `errorToast`; Create page needs the same import added) carrying the identical message text.

**Rationale**: Confirmed via source read that `useToast` is already imported and working in `organizations/page.tsx` for the delete-confirmation flow (`confirmToast`/`successToast`/`errorToast`, lines 20, 38-51) — extending its use to the "no site URL" case in the same file, and importing it fresh in `create/page.tsx` (which currently has zero toast usage), both follow an established, already-proven-working pattern rather than introducing anything new.

**Alternatives considered**: Leaving the Create-page "complete Load/Index Products first" case as a blocking `alert()` since it gates a "Complete Setup" navigation action — rejected; the underlying `router.push('/admin-portal/organizations')` already fires unconditionally right after the alert in the current code (confirmed via source read, `create/page.tsx:693-696` — the push is NOT inside an `else`, so today's `alert()` is purely informational, not a hard block), so converting it to a non-blocking toast changes nothing about the actual navigation behavior, only the notification mechanism.

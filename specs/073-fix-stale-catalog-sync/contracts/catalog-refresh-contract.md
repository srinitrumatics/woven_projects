# Contract: Catalog Refresh Behavior

This feature has no new network API surface (no new routes, no changed request/response shapes on `/api/algolia/browse` or the direct Algolia `index.search()` calls). The contract worth pinning down is *behavioral*: when each view must (re)fetch, and what it must do when that fetch fails. This document is the acceptance contract implementation and QA should check against.

## Contract 1 — Configure Quick Add

**Component**: `app/configure/ConfigureOrderClientPage.tsx`

**Triggers that MUST invoke a catalog fetch** (reusing the existing `index.search('', { hitsPerPage: 1000 })` call):
1. Component mount (existing behavior — unchanged).
2. `quickAddOpen` transitioning from `false` to `true` (i.e., the user clicks/focuses/types into the Quick Add input after it was previously closed).
3. The user clicking the manual refresh control.

**On success**: replace `catalog` state with the newly fetched, mapped, brand-enriched list (existing mapping logic unchanged).

**On failure**:
- MUST NOT clear `catalog` to `[]`.
- MUST leave the previously loaded `catalog` state exactly as it was before the failed attempt.
- MUST call `toastError(...)` (existing `useToast` hook) with a user-facing message indicating the refresh failed.

**MUST NOT**:
- Fetch on every keystroke while `quickAddOpen` is already `true` (avoid redundant refetching of a 1000-row snapshot per character typed).
- Introduce a polling interval while the panel remains open and untouched.

## Contract 2 — Order Detail Product Catalog

**Component**: `app/orders/[id]/OrderClientPage.tsx` (state feeds the presentational `components/ProductCatalog.tsx`)

**Triggers that MUST invoke a catalog fetch** (reusing the existing `loadProducts()` call to `/api/algolia/browse`):
1. Component mount, once `SF_ACCOUNT_ID`/`SF_CONTACT_ID` are available (existing behavior — unchanged).
2. `viewMode` transitioning to `"catalog"` (i.e., the user clicks into the Product Catalog tab), including repeat activations after switching away and back.
3. The user clicking the manual refresh control.

**On success**: replace `catalogProducts` state with the newly fetched, mapped list (existing mapping logic unchanged).

**On failure**:
- MUST NOT clear `catalogProducts` to `[]`.
- MUST leave the previously loaded `catalogProducts` state exactly as it was before the failed attempt.
- MUST call `toastError(...)` (existing `useToast` hook) with a user-facing message indicating the refresh failed.

**MUST NOT**:
- Refetch on every `viewMode` render while already on `"catalog"` (only on the transition *into* it).
- Introduce a polling interval while the tab remains active and untouched.

## Contract 3 — Cross-view data parity (informational, not independently testable)

For a given `objectID`/product, at a given point in time, all three of Products, Quick Add, and the order Product Catalog MUST reflect the same underlying Algolia record — since Contracts 1 and 2 guarantee each view refetches on open/reactivation, and Products already refetches on every interaction, parity follows from Contracts 1 and 2 holding; there is no separate mechanism to implement for this contract.

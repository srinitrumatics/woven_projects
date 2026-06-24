# Research: Post-Order Creation Redirect

**Feature**: 002-post-order-redirect
**Date**: 2026-06-24

## Finding 1: Client-side navigation pattern

**Decision**: Use `useRouter` from `next/navigation` with `router.push('/orders/{orderId}')`.

**Rationale**: This is the established pattern throughout the project. `app/orders/page.tsx` uses exactly `useRouter` + `router.push` for all post-order-creation navigations (lines 266, 350, 477). It produces a smooth SPA transition without a full page reload.

**Alternatives considered**: `window.location.href` (full reload, worse UX) — rejected. `<Link>` (not suited for programmatic navigation triggered by async operation) — rejected.

---

## Finding 2: Warning toast for partial failure (line creation fails after order is created)

**Decision**: Use the `warning` function from `useToast` for the partial-failure case, then still call `router.push`.

**Rationale**: `useToast` already exports `warning` (confirmed in `app/orders/page.tsx:23`). The existing `AddToOrderModal.tsx` only imports `success` from `useToast` — a one-line import expansion adds `warning` and `error: toastError`. The toast persists briefly across route transitions, giving the user context before the order detail page loads.

**Alternatives considered**: Passing error state via query params (e.g., `?lineError=true`) to show a message on the order detail page — rejected as it couples two unrelated pages and adds complexity beyond this feature's scope.

---

## Finding 3: No changes needed to the orders detail page or API routes

**Decision**: Zero server-side changes. This is a pure frontend navigation addition inside `AddToOrderModal.tsx`.

**Rationale**: The order detail page at `/orders/[id]` already fetches fresh data on mount (confirmed in `app/orders/[id]/page.tsx`). When redirected, it will load the order including the newly added line. No new API endpoints, query parameters, or page-level state management is required.

**Alternatives considered**: Adding `?new=true` query param (used in `app/orders/page.tsx:266`) — opted to omit for this flow since the "new=true" param triggers specific UI in the order detail page that may not be appropriate when coming from the product page.

---

## Finding 4: One file changed — AddToOrderModal.tsx

**Decision**: All changes are confined to `app/products/[id]/components/AddToOrderModal.tsx`.

**Changes needed**:
1. Import `useRouter` from `next/navigation`
2. Import `warning` (and optionally `error: toastError`) from `useToast` in addition to `success`
3. Initialize `const router = useRouter()` inside the component
4. In `handleAddToOrder`: replace `onClose()` with `router.push('/orders/${selectedOrderId}')` on success
5. In `handleCreateOrder`: replace `onClose()` with `router.push('/orders/${newOrderId}')` on success; on partial failure (PATCH fails), call `warning(...)` then `router.push('/orders/${newOrderId}')`

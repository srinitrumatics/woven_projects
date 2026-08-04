# Implementation Plan: Products List Add to Order Fix

**Branch**: `108-products-list-add-to-order` | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/108-products-list-add-to-order/spec.md`

## Summary

Wire up the currently-broken "Add to Order" buttons in `app/products/ProductClientPage.tsx`'s Card view and List view so both open the already-existing `AddToOrderModal` (`app/products/[id]/components/AddToOrderModal.tsx`), gated by the `order-create` permission, with quantity defaulted to each product's MOQ — reusing the Product Detail page's proven flow verbatim rather than building anything new.

## Technical Context

**Language/Version**: TypeScript 5, React 19 (Next.js 15 App Router, client component)

**Primary Dependencies**: `app/products/[id]/components/AddToOrderModal.tsx` (existing, reused as-is), `components/PermissionGate` (existing, reused for the `order-create` gate), `components/UserSessionContext` (`useUserSession()`, already imported in `ProductClientPage.tsx`)

**Storage**: N/A — no schema change; reuses the existing Salesforce order/order-line API routes the modal already calls

**Testing**: Manual verification (dev server, both view modes, both permission states) + `npx tsc --noEmit`; no dedicated test suite exists for this UI flow

**Target Platform**: Web (Next.js 15 app, client-side rendered page)

**Project Type**: Web application (Next.js App Router)

**Performance Goals**: N/A — no new network calls beyond what `AddToOrderModal` already makes; the list's own already-loaded Algolia hit data is what feeds the modal

**Constraints**: Must not alter `AddToOrderModal`'s internal logic (draft-order fetch, order/line creation, post-success `router.push`) — only add new call sites. Must not change Card view's existing "click card → navigate to detail" behavior for any click other than on the button itself. Must not add a quantity-stepper UI to the list/card layout.

**Scale/Scope**: One file modified (`app/products/ProductClientPage.tsx`) — both `CardView` and `ListView` components within it, plus new parent-owned modal state in `Content`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Salesforce source of truth)**: N/A — no new data fetching added; reuses `AddToOrderModal`'s existing Salesforce calls unchanged.
- **Principle II (RBAC-first)**: Directly satisfied — this feature *adds* the missing `PermissionGate requiredPermissions={['order-create']}` wrap that today's List/Card buttons lack, bringing them in line with the Detail page's existing gate. PASS.
- **Principle III (Next.js 15 App Router patterns)**: No route/param changes; `ProductClientPage.tsx` remains a client component. PASS.
- **Simplicity/YAGNI**: Reuses the existing modal and permission component verbatim; no new abstraction, no new API route, no quantity-stepper UI added beyond what's strictly needed. PASS.

No violations. Constitution Check passes with no exceptions needed.

## Project Structure

### Documentation (this feature)

```text
specs/108-products-list-add-to-order/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
app/products/ProductClientPage.tsx                    # Only file modified
app/products/[id]/components/AddToOrderModal.tsx       # Existing, imported, unchanged
components/PermissionGate.tsx                           # Existing, imported, unchanged
```

**Structure Decision**: Single-file change within the existing Next.js App Router structure. `Content` (the page's inner component) gains one new piece of state (which product's add-to-order flow is open, plus its quantity) and renders a single shared `<AddToOrderModal>` instance — following the exact pattern already used for `AddProductModal`/`isAddModalOpen`/`productToEdit` in the same file (lines 145, 155, 469-476). `CardView`/`ListView` each gain one new callback prop (`onAddToOrder`), following the same convention as their existing (currently-unused) `onEdit` prop.

## Complexity Tracking

*No violations — table omitted.*

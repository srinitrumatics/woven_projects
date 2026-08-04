# Research: Products List Add to Order Fix

## Decision: Reuse `AddToOrderModal` verbatim, rendered once in `Content`

**Rationale**: Prior investigation confirmed `AddToOrderModal` has no hardcoded dependency on being rendered from the Detail page — its props (`isOpen`, `onClose`, `product`, `quantity`, `moq`, `accountId`, `contactId`) only require `product.id`, `product.name`, `product.price`, all of which already exist on each Algolia hit (`objectID`, `name`, `price`). Rendering one shared modal instance in `Content` (rather than one per card/row) mirrors the file's own existing pattern for `AddProductModal` (`isAddModalOpen`/`productToEdit` state, single render at lines 469-476) — no new pattern introduced.

**Alternatives considered**:
- **Render a modal instance per card/row**: Rejected — wasteful (up to dozens of mounted-but-closed modals during infinite scroll) and inconsistent with the file's own established single-shared-instance convention for `AddProductModal`.
- **Build a new, list-specific add-to-order component**: Rejected — the existing modal already does exactly what's needed with no missing data; duplicating it would violate Simplicity/YAGNI and create two divergent code paths for the same action.

## Decision: Map Algolia's `objectID` to the modal's expected `product.id`, `product.name`, `product.price` at the call site

**Rationale**: The modal reads `product.id`/`product.name`/`product.price` directly (confirmed via full-file read). The list's Algolia hits use `objectID` as their key, plus `p.name`/`p.price` (with `product.unitPrice` as an existing fallback already used elsewhere in the same file for price). The cleanest fix is to build a small plain object at the callback site — `{ id: p.objectID || product.id, name: p.name, price: p.price || product.unitPrice }` — rather than modifying the modal itself, keeping the modal's contract untouched and the fix localized to the one file being changed.

**Alternatives considered**:
- **Change `AddToOrderModal` to accept `objectID` as an alternate key**: Rejected — would touch a shared, already-working component for a naming mismatch that's trivially solved at the call site; violates "don't alter the modal's internals" constraint in plan.md.

## Decision: Default quantity to the product's MOQ; no quantity-stepper UI added to Card/List views

**Rationale**: `ProductInfoCard.tsx` (the Detail page's equivalent entry point) initializes its own `quantity` state to `moqValue = parseInt(product.moq) || 1` before the user ever touches the stepper — i.e., MOQ-as-default is already the app's established starting point, not something unique to having a stepper present. Since the List/Card layouts are already dense (thumbnail, name, price, availability, action button all in a compact card or table row), adding a full quantity stepper to each item is a much larger UI change than "fix the broken button" calls for. The `AddToOrderModal` itself takes `quantity` as a static prop it does not let the user edit internally either — so the Detail page's stepper is the *only* place quantity is currently adjustable pre-modal; matching that exactly would require duplicating the stepper UI in two dense list layouts, which is out of proportion to this bug fix.

**Alternatives considered**:
- **Add a quantity stepper to each card/row**: Rejected — significant layout/scope increase for what the spec frames as a bug fix, not a redesign; deferred as a possible future enhancement if users need to adjust quantity before opening the modal.
- **Default quantity to 1 instead of MOQ**: Rejected — would be inconsistent with the Detail page's own default and could produce an order line below the product's minimum order quantity without the user realizing it.

## Decision: Wrap the button in `PermissionGate requiredPermissions={['order-create']}` in both views

**Rationale**: The Detail page's equivalent button is already gated this way (`ProductInfoCard.tsx`). The List/Card buttons today have no permission check of any kind — purely a disabled-by-stock-only affordance. Adding the same gate closes a real RBAC gap (Constitution Principle II) as a natural side effect of wiring the button up correctly, not a separate scope expansion.

## Decision: Card view — add `preventDefault`/`stopPropagation` on the button's click handler

**Rationale**: The entire card is one `<Link>` (confirmed: `<Link href=... className="flex flex-col h-full ...">` wrapping everything from thumbnail through the action row). Without stopping propagation, any `onClick` added to the inner button would still bubble up and trigger the Link's navigation immediately after (or instead of, depending on timing) opening the modal. `e.preventDefault(); e.stopPropagation();` inside the button's own `onClick` is the standard, minimal fix — no restructuring of the card's DOM/Link nesting is needed.

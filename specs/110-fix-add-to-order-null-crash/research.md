# Phase 0 Research: Fix "Add to Order" Null Product Crash

No `[NEEDS CLARIFICATION]` markers were present in the Technical Context — this is a small,
well-localized bug fix in an already-understood codebase, so research is limited to confirming
the root cause and the correct fix pattern already used elsewhere in the project.

## Decision: Root cause is an unconditionally-rendered dialog reading unguarded product fields

**Rationale**: Traced directly in the codebase:

- `app/products/ProductClientPage.tsx`: `const [addToOrderProduct, setAddToOrderProduct] = useState<{ id: string; name: string; price: number } | null>(null);` — starts `null`, only set via `openAddToOrder(p)` when a user clicks "Add to Order."
- The same file renders `<AddToOrderModal isOpen={!!addToOrderProduct} product={addToOrderProduct} ... />` unconditionally in the returned JSX tree — i.e. the component is always mounted, regardless of `isOpen`.
- `app/products/[id]/components/AddToOrderModal.tsx:239`: `<h3 ...>{product.name}</h3>` reads `product.name` directly with no optional chaining or null check, inside the component's top-level render (not inside any `isOpen`-gated branch).
- `components/ui/Modal.tsx` uses Radix `Dialog.Root open={isOpen}` — Radix controls *visual* open/closed state, but does not stop the parent's `children`/JSX from being evaluated on every render; the `product.name` read happens before Radix has any chance to hide the content.
- Net effect: every render of `ProductClientPage` (including the very first one, since `addToOrderProduct` is `null` on mount) throws `TypeError: can't access property "name", product is null` when `AddToOrderModal` is invoked.

**Alternatives considered**:
- *Only add a null check inside `AddToOrderModal`* (e.g. `product?.name`, or an early return when `product` is falsy): fixes the crash but is the more surgical, lower-risk option since it also protects any future call site that might mount the modal before a product is chosen.
- *Only conditionally render `AddToOrderModal` from the parent* (e.g. `{addToOrderProduct && <AddToOrderModal .../>}`): matches how `isModalOpen`-gated dialogs are sometimes written elsewhere, but leaves the shared component itself unguarded — a latent trap for the next call site.
- **Chosen approach**: do both — guard `AddToOrderModal`'s render against a null `product` (defensive, matches "trust internal guarantees only at boundaries" from Constitution Principle V, since this component's own contract should not assume its caller always supplies a product) AND keep the existing conditional `isOpen` wiring on the parent side as-is (it's already correct; the parent isn't the thing that needs to change structurally). This mirrors the existing, working guard pattern already used on `app/products/[id]/page.tsx:152` (`if (error || !product) return <NotFoundState/>`), which is why the Product Detail path never crashes today.

## Decision: No test framework changes needed

**Rationale**: The repository has no Jest/Vitest/Playwright/RTL setup for UI components (confirmed via `package.json` scripts — only `test:product-sync` and `test:rbac`, both non-UI). Per CLAUDE.md, UI changes are validated by running `npm run dev` and exercising the feature in a browser. This fix follows that same convention; no new test tooling is introduced (Constitution Principle V — no speculative infrastructure beyond phase scope).

**Alternatives considered**: Introducing a component test (e.g., React Testing Library) for this one fix was considered and rejected as out of scope — it would require standing up a new test runner for the whole project, which is a much larger change than this bug fix warrants.

## Decision: Scope stays limited to the two existing call sites

**Rationale**: `AddToOrderModal` is used only from `ProductClientPage.tsx` (Products List) and `ProductInfoCard.tsx` (Product Detail). No other files reference it (`grep -rn "AddToOrderModal"` confirms exactly these two usages plus the component's own definition). The fix does not need to anticipate additional call sites beyond making the shared component itself null-safe.

**Alternatives considered**: N/A — scope is fully determined by existing usage, not a design choice.

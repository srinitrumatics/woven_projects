# Phase 0 Research: Shared Accessible Modal Component

No `[NEEDS CLARIFICATION]` markers remain. This phase documents the direct code investigation that grounded the plan, including one architectural finding that affects the migration of all 8 modals, not just a subset.

## 0. Fresh re-audit corrected 2 stale file paths and found 1 additional modal

A dedicated re-audit (Explore subagent) confirmed the original static audit's core claim (no shared Modal/Dialog exists; zero modals implement `role="dialog"`, `aria-modal`, Escape, or focus trap) but corrected 2 file-path claims that had drifted:
- `AddProductModal.tsx` is at `app/products/components/AddProductModal.tsx`, not `app/products/[id]/components/`.
- `TrackingTimelineModal.tsx` is at `app/shipments/[id]/components/TrackingTimelineModal.tsx`, not `components/`.

It also found an 8th modal-shaped element not named in the original audit: an inline, unnamed "Image Popup Modal" in `app/orders/[id]/components/ProductCatalog.tsx` (~line 283), discovered via a direct grep for `fixed inset-0` overlay patterns rather than trusting the audit's file list.

**Confirmed via full-codebase grep**: zero existing usages of `role="dialog"`, `aria-modal`, `useModal`, or any `Portal` component anywhere in `app/`+`components/`. `components/layouts/Sidebar.tsx`'s mobile nav drawer is the only place with existing Escape-key handling in the whole codebase — confirms it's a solved pattern once, just never generalized, and confirms it's a different UI pattern (persistent drawer, not transient dialog) correctly excluded per FR-011.

## 1. Foundation: `@radix-ui/react-dialog`

**Decision**: Build `components/ui/Modal.tsx` on `@radix-ui/react-dialog` (new dependency — confirmed absent from `package.json`, per explicit user decision over hand-rolling).

**Investigation**: `package.json` confirms React 19 (`"react": "^19.0.0"`), no existing Radix packages, and no dialog/modal library of any kind. `@radix-ui/react-dialog`'s primitives (`Dialog.Root`, `Dialog.Portal`, `Dialog.Overlay`, `Dialog.Content`, `Dialog.Title`, `Dialog.Close`) provide focus trap, Escape-to-close, `role="dialog"`/`aria-modal`, and portal rendering out of the box, unstyled — the app supplies all visual styling (radius, shadow, colors, animation) itself, so this is purely an accessibility/behavior foundation, not a design-system replacement.

**Version compatibility**: must be verified at `npm install` time (React 19 peer-dependency support) — flagged as a first implementation step, not assumed from this research alone.

## 2. Icon and animation choices

**Decision**: Standardize the close button on `lucide-react`'s `X` icon (already installed, used in 9 other files, but currently unused by any of the 8 modals — all 8 hand-roll an inline `<svg>` X path instead). Use `framer-motion` (already installed, used in `app/admin/organizations/page.tsx` and `components/ui/Toast.tsx`, but not currently used by any modal) for the shared component's enter/exit animation, driven by Radix's `open` state.

**Rationale**: Both are already dependencies with zero net-new packages beyond Radix itself; picking `lucide-react` over `@heroicons/react` (also installed, also unused by modals) is an arbitrary-but-final tie-break since neither is currently the modals' convention — `lucide-react` is chosen for its more literal `X` glyph match to the existing inline SVGs.

**Dead code found**: `DeliveryWindowModal.tsx` uses `animate-in fade-in duration-200`/`animate-in zoom-in-95 duration-200` Tailwind utility classes. Confirmed `tailwind.config.ts` has `plugins: []` (no `tailwindcss-animate`) and `globals.css` defines no matching keyframes — these classes are inert today. Removed as part of this modal's migration (FR-009), superseded by the shared component's real `framer-motion`-driven animation.

## 3. Architectural finding: `if (!isOpen) return null` must be removed from every migrated modal, not just the 2 without `isOpen`

**Decision**: As part of migrating every one of the 8 modals (not only Certification/Datasheet), remove each modal's own `if (!isOpen) return null;` (or equivalent unconditional-render) early return. Each modal component must always render its JSX tree and pass `isOpen` straight through to the shared `<Modal isOpen={isOpen} onClose={onClose}>`, letting Radix's `Dialog.Root open={isOpen}` (combined with the shared component's `framer-motion` exit transition) control mounting/unmounting internally.

**Investigation**: All 6 modals that already have an `isOpen` prop gate their entire render with `if (!isOpen) return null;` at the top of the function body — this means the component (and everything inside, including any future exit-animation wrapper) is torn out of the React tree the instant `isOpen` flips to `false`, with zero opportunity for an exit transition to play, regardless of what the shared component does internally. For `CertificationModal`/`DatasheetModal` specifically, the *parent* (`EditProductTabs.tsx`) additionally wraps each in `{isCertModalOpen && <CertificationModal .../>}` / `{isDatasheetModalOpen && <DatasheetModal .../>}` — an even more aggressive unmount-on-close at the parent level, with the same consequence.

**Rationale**: FR-005 requires every modal to share the same real open/close animation. That's only achievable if the shared `<Modal>` component (via Radix + `framer-motion`) is what decides when the DOM nodes actually unmount — not the consuming component or its parent tearing them out first. This applies uniformly to all 8, making the migration's "stop gating render yourself" change a single consistent pattern rather than a special case for the 2 modals without `isOpen`.

**Call site changes required**: `EditProductTabs.tsx`'s `{isCertModalOpen && <CertificationModal .../>}` and `{isDatasheetModalOpen && <DatasheetModal .../>}` wrappers become unconditional `<CertificationModal isOpen={isCertModalOpen} .../>` / `<DatasheetModal isOpen={isDatasheetModalOpen} .../>` (always mounted, visibility controlled by the new `isOpen` prop each component gains and forwards to the shared `Modal`). No other modal's parent call site needs a mounting-strategy change (the other 6 are already always passed a boolean `isOpen`, even though the modal itself currently still self-guards with `if (!isOpen) return null` — that self-guard is what's removed).

## 4. `AddProductModal`'s `inlineMode` — explicitly preserved, not migrated

**Decision**: `AddProductModal.tsx` has a second calling mode (`inlineMode?: boolean`) where its form content renders directly embedded in a page (no overlay, no modal shell at all — used by a page that already has its own header/layout). This mode is **not** touched by this migration — only its non-inline (`inlineMode` falsy) branch, which currently renders its own `fixed inset-0 z-[60] ... bg-black/50` overlay, is replaced with the shared `<Modal>`. The `inlineMode` branch continues to render `formContent` directly with zero shell, exactly as today.

**Rationale**: `inlineMode` is a deliberate, distinct rendering path already correctly separated in the component's own return statement (`return inlineMode ? formContent : (<div className="fixed inset-0 ...">{formContent}</div>)`) — migrating only the modal branch and leaving the inline branch untouched is the minimal, correct change; FR-008 (no change to content/behavior) applies to this distinction too.

## 5. Per-modal current-state summary (from investigation, used for the migration plan)

| Modal | Current radius/shadow/max-w/z-index | `isOpen` today? | Click-outside today? | Notes |
|---|---|---|---|---|
| `AddProductModal.tsx` | `rounded-lg shadow-2xl max-w-5xl` / `z-[60]` | Yes (self-guarded) | No | Has `inlineMode` — only non-inline branch migrates |
| `AddToOrderModal.tsx` | `rounded-2xl shadow-2xl max-w-lg` / `z-50` | Yes (self-guarded) | No | |
| `CertificationModal.tsx` | `rounded-xl shadow-xl max-w-lg` / `z-50` | **No** — gains `isOpen` | No | Parent (`EditProductTabs.tsx`) currently conditionally mounts |
| `DatasheetModal.tsx` | `rounded-xl shadow-xl max-w-lg` / `z-50` | **No** — gains `isOpen` | No | Same parent, same pattern |
| `LocationModal.tsx` | `rounded-xl shadow-2xl max-w-2xl` / `z-[100]` | Yes (self-guarded) | Yes (already works) | 3-mode title (add/edit/view) |
| `DeliveryWindowModal.tsx` | `rounded-2xl shadow-2xl max-w-xl` / `z-50` | Yes (self-guarded) | No | Dead `animate-in` classes removed |
| `TrackingTimelineModal.tsx` | `rounded-xl shadow-2xl max-w-3xl` / `z-[100]` | Yes (self-guarded) | Yes (already works) | Shell/a11y only — mock-data bug out of scope |
| `ProductCatalog.tsx` popup | `rounded-lg shadow-xl max-w-lg` / `z-50` | Local `popupProduct` state (truthy = open) | Yes (already works) | Unnamed, display-only, no footer |

**Standardization**: all 8 converge on one shared radius/shadow/close-button/animation (FR-005); only `max-w-*` (size) continues to vary per modal via a `size` prop on the shared component, matching each modal's existing width.

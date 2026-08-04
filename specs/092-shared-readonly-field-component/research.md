# Research: Shared Read-Only Field Component

All findings below are grounded in a direct read of every affected file (not the original audit text alone) before planning. No `NEEDS CLARIFICATION` markers remain in the spec.

## 1. `ReadOnlyField` component design

**Decision**: Build `components/ui/ReadOnlyField.tsx` rendering `{ label, value, href?, className?, valueClassName? }`. Internally it renders a `<label>` plus either a `<Link>` (when `href` is truthy) or a plain `<div>` (when it isn't) — never an `<input>` element at all. Both branches share one base class string:
```
"w-full h-11 px-3 flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white truncate"
```
The `<Link>` branch adds `text-primary hover:underline`. `className` is applied to the outer wrapper `<div>` (matching the existing convention already used by `DetailInput.tsx`/`InvoiceBillingInfo.tsx`/`QuoteKeyDates.tsx` for grid `col-span`/spacing overrides — confirmed via direct read, not assumed). `valueClassName` is a new, narrowly-scoped optional prop applied to the value box itself, needed for exactly one confirmed case: Proposal's and Quote's "Drop-Ship" field conditionally renders `text-green-600 font-medium` when true (`ShippingInfo.tsx`, `QuoteShippingInfo.tsx`).

**Rationale**: Rendering a `<div>`/`<Link>` instead of an `<input readOnly>` eliminates the entire category of "looks editable" defects at the root — a `<div>` has no native text-cursor, no focus ring, no press-animation to suppress; there is nothing to turn off, because the wrong semantic element is never used in the first place. This directly satisfies FR-004 more robustly than trying to override every visual affordance of a real `<input>` one class at a time (the approach every one of the 7 existing treatments took, inconsistently). Every call site's current `value={x || 'fallback'}` pattern (fallback logic already lives at the call site, confirmed via direct read of `ProductInfo.tsx`, Invoice/Proposal/Quote Line Detail pages, `QuoteKeyDates.tsx`) is preserved untouched — `ReadOnlyField` receives an already-resolved display string and does not reimplement fallback logic itself, satisfying FR-009.

**Alternatives considered**:
- Keep `<input readOnly>` but strip the offending classes (`focus:ring-0`, `active:scale-[0.98]`, `cursor-not-allowed`) — rejected; this is exactly what several of the 7 existing treatments already half-attempted, and they still drifted from each other because there was no single shared source of truth. A `<div>`-based component removes the possibility of drift entirely.
- Wrap the whole field (label + value) in `<Link>` when `href` present, rather than just the value box — rejected; every existing working-link precedent in this codebase (`app/invoices/page.tsx:530`, `app/invoices/[id]/lines/[lineid]/page.tsx:206`) links only the value, not its label, and matching an established pattern is preferable to inventing a new one.

## 2. `ReadOnlyTextArea` component design

**Decision**: Build `components/ui/ReadOnlyTextArea.tsx` rendering `{ value, className? }` as a single `<div>`:
```
`w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white whitespace-pre-wrap ${className}`
```
`className` controls sizing per call site (`h-full` for the 3 top-level Notes/Scope-Summary cards which sit inside a `flex-1`/`flex flex-col` parent; `min-h-[200px]` for the 3 per-Line-Detail-page Notes boxes, matching their current minimum height).

**Rationale**: The 3 top-level Notes/Scope-Summary boxes (`InvoiceNotes.tsx`, `ProposalDetails.tsx` ×2, `QuoteNotes.tsx`) are already near-identical `<textarea disabled/readOnly>` elements — consolidating them is a direct, low-risk migration. The 3 per-Line-Detail-page Notes boxes (Invoice/Proposal/Quote Line Detail pages) are a `<div><p className="truncate">` today, which single-line-clips any multi-line note — this is a real, if minor, latent display defect being resolved as a side effect of consolidating onto `ReadOnlyTextArea`'s `whitespace-pre-wrap` (full text visible, matching how the top-level Notes cards already behave via their `<textarea>`'s natural wrapping/scroll). This is called out explicitly rather than silently changed: it is a styling/overflow-handling normalization, not a business-logic change, and is the more honest behavior of the two.

**Alternatives considered**:
- Preserve the Line Detail Notes boxes' single-line-truncate behavior exactly as-is, only normalizing their border/background classes — rejected; FR-008 requires "identical visual treatment" across all 6 instances (3 top-level + 3 Line Detail), and leaving one truncation-only will directly recreate a distinct 2nd treatment under the same shared-component wrapper, defeating the purpose of consolidation.

## 3. `DetailInput.tsx`'s dead `href` bug — link destination correctness

**Decision**: `ReadOnlyField`'s `href` prop is passed through exactly as each of the 9 already-computed conditional expressions already produce it today (e.g. `accountId ? `/accounts/${accountId}` : undefined` in `InvoiceBillingInfo.tsx:43`) — no new link-resolution logic is introduced; the bug was purely that `DetailInput.tsx` computed `isLink` and imported `Link` but never used either (confirmed via full source read: `href`/`isLink` referenced exactly once each, never touching the render tree).

**Rationale**: Every one of the 9 broken links' destination URLs is already correct and already being computed by the parent components (`InvoiceBillingInfo.tsx`, `InvoiceShippingInfo.tsx`, `InvoiceCardDetail.tsx` — the file is named `InvoiceCardDetail.tsx` but exports a component internally named `InvoiceKeyDates`, an existing naming quirk unrelated to this feature and left untouched). The fix is purely "render the already-correct `href` as a real link," not "figure out what the link should be."

**Alternatives considered**: None — this is a confirmed dead-code-path bug with an unambiguous fix once the component stops discarding its own prop.

## 4. Order Line Detail's `ProductInfo.tsx` — 7th treatment, pulled into scope

**Decision**: Migrate `app/orders/[id]/lines/[lineId]/components/ProductInfo.tsx`'s 9 fields onto `ReadOnlyField`, alongside the Invoice/Proposal/Quote Line Detail "Product Information" cards.

**Rationale**: Confirmed via full source read this is a 7th, independently-drifted treatment (`h-11 px-3` + `cursor-not-allowed` + `rounded-lg`, vs. the Invoice/Proposal/Quote Line Detail treatment's `py-1.5` + `cursor-default` + `rounded`) of the exact same "Product Information" card idiom that exists on 3 other modules' Line Detail pages — the audit's original Invoices-only framing missed this file entirely, but it is unambiguously the same defect and belongs in the same fix.

**Alternatives considered**: Leave Order Line Detail out of scope since the audit didn't name it — rejected; the user's explicit decision was "migrate everything" for this consolidation, and this file is a confirmed instance of the exact same idiom, not a different concern.

## 5. Order Detail's editable forms — confirmed out of scope

**Decision**: `app/orders/[id]/components/BillingInfo.tsx`, `ShippingInfo.tsx`, `OrderNotes.tsx`, `DeliveryOptions.tsx`, `ShipToContact.tsx` are not touched.

**Rationale**: Confirmed via source read these all accept an `isEditing` prop with real `onChange`/`setFormData` handlers — `readOnly`/`disabled` is applied only conditionally, when not in edit mode, on top of genuine two-way-bound form state. This is a different, legitimate pattern (a real edit mode) from the 7 confirmed defect treatments (permanently-read-only fields dressed as editable with zero edit mode ever available) — migrating these would risk breaking real editing functionality for no consistency benefit, since they were never part of the "always fake, never editable" defect this feature targets.

**Alternatives considered**: None — pulling in a working edit-mode component to "consolidate styling" would be scope creep with real regression risk, explicitly rejected by the spec's own Assumptions.

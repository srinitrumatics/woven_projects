# Research: Fix Unwanted Scrollbar in Sub-Tab Headers on Small Screens

## Unknown: Which component renders the affected sub-tab row, and why does a vertical scrollbar appear?

**Decision**: The affected component is `components/ui/SubTabs.tsx` — the shared underline-style sub-tab row used to switch between related record lists on detail pages (e.g., "Proposals (5) | Customer Quotes (2) | Sales Orders (3) | Shipping Manifests | Invoices (3)"). The fix is to explicitly pin `overflow-y-hidden` alongside the existing `overflow-x-auto` on the row container (`components/ui/SubTabs.tsx:14`).

**Rationale**:
- The container is `flex gap-6 ... overflow-x-auto mb-3`, with tab buttons marked `flex-shrink-0 whitespace-nowrap`. Horizontally this is already correct: tabs never wrap, they overflow and the row scrolls.
- Per the CSS Overflow spec, when one axis (`overflow-x`) is set to a value other than `visible`, a `visible` value on the other axis (`overflow-y`, left at its default) is computed as `auto` instead. This container therefore has an *implicit* `overflow-y: auto` that nobody intended.
- The row's height is intrinsic to its content (a text line plus `pb-2`/`border-b-2` for the active underline). On narrow viewports where the tabs no longer fit, a horizontal scrollbar appears. On platforms/browsers that render classic (non-overlay) scrollbars — Windows, most Linux desktops, or macOS set to "always show scrollbars" — that horizontal scrollbar occupies space *inside* the element's content box, nudging the effective content height a few pixels past the box's own computed height. That's enough to trip the implicit `overflow-y: auto`, which then renders a thin vertical scrollbar for that sliver of overflow. Visually this reads as the row splitting into "two lines" with a stray scrollbar between them — matching the reported screenshot.
- Explicitly setting `overflow-y-hidden` removes the implicit auto-vertical-scroll behavior entirely while leaving `overflow-x-auto` untouched, so horizontal scrolling keeps working exactly as before. This is the smallest possible change that directly targets the root cause (an unintended two-axis interaction), rather than a workaround (e.g., forcing a fixed row height) that could clip content in the future if button padding changes.

**Alternatives considered**:
- **Force a fixed `height`/`min-h` on the row**: rejected — it doesn't address the root cause (the implicit `overflow-y: auto`) and risks clipping the active-tab underline (`border-b-2 -mb-px`) if any future tab content is slightly taller.
- **Apply the existing `.no-scrollbar` utility class** (`app/globals.css`, hides the horizontal scrollbar entirely via `::-webkit-scrollbar { display: none }` / `scrollbar-width: none`): rejected as the primary fix — it happens to mask the vertical-scrollbar symptom as a side effect (no visible horizontal scrollbar means no height nudge), but it doesn't fix the underlying implicit `overflow-y: auto`, and it removes the horizontal scroll affordance entirely, which the spec (FR-002) requires to remain available on narrow screens. `overflow-y-hidden` is more precise: it fixes the reported defect without changing the desired horizontal-scroll UX.
- **Rewrite the row with `flex-wrap`**: rejected — this is exactly the "two lines" behavior the spec explicitly disallows (FR-001); tabs must stay on a single line and scroll horizontally instead.

## Unknown: Is the same defect present elsewhere in the shared tab components?

**Decision**: `components/ui/Tabs.tsx` (the separate, pill-style *primary* tab bar — e.g., "My Order (1) | Taxes (1) | Fulfillment (13) | Returns | Files (3)" seen above the sub-tab row in the screenshot) has the identical latent CSS pattern (`overflow-x-auto` without a pinned `overflow-y`). It is out of scope for this fix.

**Rationale**: The reported defect and the screenshot's highlighted artifact are specifically on the underline-style sub-tab row (`SubTabs.tsx`), not the pill-style primary tab bar (`Tabs.tsx`) shown directly above it in the same screenshot, which renders cleanly. The spec's Key Entity and FR-005 scope the fix to "the shared sub-tab header pattern" reused across proposal/order/quote/purchase-order/invoice/supplier-bill detail pages — i.e., `SubTabs.tsx` and its 17+ consuming pages found during investigation. Fixing `Tabs.tsx` as well is a reasonable follow-up but is not required to satisfy this spec and would expand scope beyond what was reported and observed.

**Alternatives considered**: Fixing both components in the same change — rejected for this feature; not requested, not observed as broken in the screenshot, and would broaden the diff beyond the reported defect. Can be filed as a separate small fix if it's later observed to actually manifest visually (it may not, if `Tabs.tsx`'s pill buttons are tall enough that a scrollbar overlay never nudges past the box).

## Unknown: Testing approach for a pure CSS/layout fix

**Decision**: Manual/visual verification across the shared component's consuming pages at multiple narrow viewport widths (e.g., using browser dev tools device toolbar / window resize), in both light and dark mode, on at least one page with more sub-tabs than fit at typical mobile widths. No new automated test infrastructure is introduced.

**Rationale**: This codebase has no existing visual regression or component-level test suite for `components/ui/*` (confirmed no `.test.tsx`/`.spec.tsx` files alongside `SubTabs.tsx`/`Tabs.tsx`). Constitution Principle V (Simplicity & Phase-Driven Scope) directs against introducing new abstractions/infrastructure beyond what the task requires. A one-line CSS class change is best validated the same way the existing `npm run dev` UI is otherwise validated in this project — direct browser check — per the repo's own guidance to test the actual feature in a browser before reporting completion.

**Alternatives considered**: Adding a new visual regression testing tool (e.g., Playwright screenshot diffing) — rejected as disproportionate scope for a one-line CSS fix and not an existing project convention.

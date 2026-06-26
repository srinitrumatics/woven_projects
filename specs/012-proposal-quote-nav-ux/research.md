# Research: Proposal & Customer Quote Navigation UX

## Decision 1: `target="_blank"` Requires `rel="noopener noreferrer"`

**Decision**: Add both `target="_blank"` and `rel="noopener noreferrer"` to the Next.js `<Link>` components for proposals and customer quotes in `FulfillmentTab.tsx`.

**Rationale**: Opening a new tab without `rel="noopener noreferrer"` allows the newly opened page to access the opener tab's `window.opener` object, which is a security risk (tabnapping). All portal links to pages that open in new tabs must include this attribute pair.

**Alternatives considered**: `rel="noopener"` alone (without `noreferrer`) — rejected because `noreferrer` additionally prevents the `Referer` HTTP header from being sent, which is the safer default for internal navigation. Both are already used in the existing codebase (e.g. `QuoteCreditMemoSubTab.tsx` uses `target="_blank"`).

---

## Decision 2: Replace `<button>` with `<span>` for Non-Interactive Breadcrumb Text

**Decision**: Replace the `<button onClick={onBack}>` element in both `ProposalHeader` and `QuoteHeader` with a `<span>` element that has no event handler and no hover styling. The `onBack` prop is removed from both component interfaces.

**Rationale**: A `<button>` implies interactivity; a screen reader announces it as an actionable control. Changing to `<span>` removes the button role entirely, matches the visual treatment of the other plain-text breadcrumb segments, and eliminates the misleading "go back to list" affordance for users who arrived via a new tab.

**Alternatives considered**:
- Keep `<button>` but disable it (`disabled` attribute) — rejected because disabled buttons are still announced by screen readers and add unnecessary noise.
- Use an `aria-disabled` link — rejected as over-engineering for a plain-text label; a `<span>` is the simplest correct element.

---

## Decision 3: Remove `onBack` Prop Entirely (Not Just Unused)

**Decision**: Remove the `onBack` prop from both `ProposalHeaderProps` and `QuoteHeaderProps` interfaces, and remove the corresponding `onBack` usage at the call sites in `proposals/[id]/page.tsx` and `quotes/[id]/page.tsx`.

**Rationale**: An unused prop left in a TypeScript interface creates confusion and causes linters to flag it. Since the breadcrumb button is removed, the prop has no purpose. Cleaning it up keeps the component interfaces accurate.

**Alternatives considered**: Mark `onBack` as optional (`onBack?: () => void`) and leave unused — rejected as unnecessary backwards-compatibility shim (constitution Principle V explicitly forbids this pattern).

---

## Scope Confirmation — Out of Scope

The following `router.push` calls in proposal/quote detail pages are **NOT changed** by this feature:
- `proposals/[id]/page.tsx` line ~1512: footer "Back to Proposals" button
- `quotes/[id]/page.tsx` line ~778: floating action bar "Back to Quotes" button
- `quotes/[id]/page.tsx` line ~663: error state "Back to Quotes" button

These are separate navigation controls that may be addressed in a future feature if needed.

The following Fulfillment tab links are **NOT given new-tab behaviour**:
- Shipping Manifests (`/shipments/{Id}`)
- Invoices (`/invoices/{Id}`)

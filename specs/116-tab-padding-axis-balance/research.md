# Research: Rebalance Tab Content Padding (More Horizontal, Less Vertical)

## Context

The feature spec (`spec.md`) requires rebalancing the uniform `p-6` padding established by feature 115 into a wider-horizontal, shorter-vertical standard, across the same page population 115 already unified. This document re-verifies that enumeration is still accurate, decides the concrete target values, and documents one correction to 115's findings discovered while re-reading the actual JSX nesting.

## Decision: Target `px-6 py-3` (keep 24px horizontal, halve to 12px vertical)

**Decision**: Replace `p-6` with `px-6 py-3` on every wrapper `<div>` enumerated below. Where a pre-existing override exists (`app/shipments/page.tsx`'s content div is `p-6 pb-0`), translate it to `px-6 py-3 pb-0`, preserving the flush-to-table intent.

**Rationale**:
- Satisfies FR-002 ("horizontal MUST be equal to or larger than current") by keeping horizontal at exactly the current 24px rather than introducing a second magnitude decision.
- Satisfies FR-003 ("vertical MUST be visibly smaller than current") — 12px is unambiguously half of 24px, a clearly visible reduction without being so aggressive it crowds the tab bar against the card border.
- `px-6 py-3` is a common, recognizable Tailwind pairing (used elsewhere in card-style UIs) rather than an invented ratio.

**Alternatives considered**:
1. **`px-8 py-3` (increase horizontal beyond 24px, to 32px).** Rejected for the first pass: the spec only requires horizontal to be "equal to or larger," and increasing it further widens every card on every detail page, a larger visual change than requested. Left as a documented option if the user wants the horizontal gap to grow further after seeing `px-6 py-3` in practice.
2. **`px-6 py-4` (16px vertical instead of 12px).** Considered as a gentler reduction. Rejected in favor of `py-3` because 16px is only a third smaller than 24px — a less clearly "decreased" result than half, and `py-3`/`px-6` is a more common Tailwind pairing in practice.

## Re-verification of feature 115's enumeration

Grepped all 18 files from feature 115's `research.md` immediately before planning this feature: every wrapper `<div>` identified there is still exactly `p-6` (or `p-6 pb-0` for the one override), confirming no drift since that feature shipped. The file list, line numbers, and structural notes from `specs/115-align-tab-content-padding/research.md` are reused as-is for the edit-site enumeration; see `plan.md`'s Project Structure section for the consolidated list.

**Excluded, unchanged from 115's reasoning**:
- `app/purchase-orders/[id]/lines/[lineid]/page.tsx`'s nested `py-2` div (line ~665) — still vertical-only spacing on an inner element, not a card-level wrapper; left untouched.
- `app/admin/authorize-locations/[id]/delivery-windows/page.tsx:234`'s outer page wrapper (`p-6`, the whole page's padding) — not a tab-content wrapper, was never in 115's scope, remains out of scope here.

## Correction to feature 115: `LineTaxesTab.tsx` / `LineFulfillmentsTab.tsx` loading-state divs

**Finding**: Feature 115's research described these two files' loading-state `<div className="p-6">` as already matching their loaded-content branch (which has no padding of its own) "once the outer card becomes p-6." Re-reading the actual JSX nesting in `app/proposals/[id]/lines/[lineid]/page.tsx` (lines 793-866) shows this was incomplete: `LineTaxesTab`/`LineFulfillmentsTab` render **inside** an unpadded `<div>` that itself sits inside the outer card (`...p-6` at line 797). So:
- **Loading state**: outer card padding + the component's own `p-6` = padding is applied twice (additive).
- **Loaded state**: outer card padding + 0 (no own padding) = padding applied once.

This was a real, if minor, pre-existing inconsistency that 115 didn't fully catch (comparing class strings in isolation rather than tracing the render tree). It was not highly visible before because both values were the same token (`p-6`), so the *difference* (24px vs 48px effective inset around a transient loading spinner) was easy to miss. Once this feature shrinks the outer card to `py-3` (12px) while these two files' loading divs stay at `p-6` (24px), the mismatch becomes much more visible — the loading spinner would sit in a noticeably taller box than the loaded table.

**Decision**: Remove the `p-6` class from both loading-state divs entirely (not resize to `px-6 py-3`), so the loading spinner inherits solely from the parent card's padding — exactly matching the loaded-content branch's zero-own-padding behavior. This is the correct fix for FR-006 ("loading indicator ... MUST use the same rebalanced spacing as the tab's loaded content"), and a strict improvement over 115's state, not a new requirement invented here.

**Scope check**: Grepped for the same `<div className="p-6">`-wrapped-loading pattern inside other line-detail pages' sub-components (Quotes, Purchase Orders, Supplier Bills, Invoices lines) — none exist; those four object types hand-roll their tab content directly inside their `page.tsx` (no separate `LineXTab.tsx` component layer), so this double-padding pattern is isolated to the two Proposals-line files. No additional files need this correction.

## Loading-state parity for every other page (no change needed)

For every other file in scope, the `loading ? <TableLoadingState/> : <ActualContent/>` ternary already renders inside the same single wrapper div being resized (confirmed during feature 115's implementation) — so both branches automatically inherit the new `px-6 py-3`, with no separate edit required.

## Summary of resolved unknowns

No `NEEDS CLARIFICATION` markers existed in the Technical Context. This research confirms: (1) the target values are `px-6 py-3`, chosen to satisfy both FR-002 and FR-003 with the smallest new magnitude decision; (2) feature 115's file enumeration is unchanged and fully reusable; (3) one additional correction — removing the redundant loading-state `p-6` from two Proposals-line sub-components — is now required by FR-006's parity requirement, an improvement this feature makes over 115's slightly incomplete original fix.

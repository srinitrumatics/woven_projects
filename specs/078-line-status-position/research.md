# Phase 0 Research: Reposition Line Status Indicator

## 1. Current structure on each page (confirmed by direct code inspection)

**Decision**: Treat this as a pure JSX-relocation task — move existing elements, change nothing about what they render.

**Rationale**: Both pages already have a fully working status indicator; only its position is wrong relative to the established convention (Supplier Bills, and — after `077-line-status-parity` — Orders, Proposals, Quotes).

**Invoice Line** (`app/invoices/[id]/lines/[lineid]/page.tsx`):
- Header is a `flex items-center justify-between` row with two children: a left `<div>` (breadcrumb + title) and a right `<div className="flex flex-col items-end gap-2 ...">` containing the "Back to Invoice" button followed by `{product.status && <StatusBadge status={product.status} />}`.
- Below that row is a separate `<div className="flex items-center gap-2 mt-1 ...">` containing only the "Line {lineNumber} of {totalLines}" `<span>`.
- Target: move the `{product.status && <StatusBadge status={product.status} />}` block out of the right-column `<div>` and into the "Line X of Y" row, immediately after that `<span>`.

**Shipment Line** (`app/shipments/[id]/lines/[lineid]/page.tsx`):
- Same shape: right-column `<div className="flex flex-col items-end gap-2 ...">` contains the "Back to Shipment" button followed by a status `<div className="flex items-center pt-6 justify-center bg-[#E5F1E5] text-[#2E7A2E] ..." style={{ padding: '0.125rem 0.5rem', marginTop: '6px' }}>{product.Status__c || "Draft"}</div>`.
- Below that is a separate row with `(Line {lineNumber} of {totalLines})`.
- Target: move the status `<div>` out of the right column and into the "(Line X of Y)" row, immediately after that `<span>`. The `pt-6` (top padding) and `marginTop: '6px'` inline style were compensating for its position stacked under the button; once moved into a `flex items-center` row alongside the line-number span, these should be dropped so it aligns inline rather than sitting low/offset (see §3).

## 2. Should Invoice's or Shipment's status styling be normalized to the generic `StatusBadge` pattern used elsewhere?

**Decision**: No — out of scope, per spec Assumptions. Move only; preserve each page's existing visual treatment exactly.

**Rationale**: 
- Invoice Line's `StatusBadge` (defined locally in the same file, using type `InvoiceStatus`) already uses a distinct, invoice-appropriate vocabulary and color set (Paid, Sent, Overdue, Settled, Partial, Viewed, etc.) that doesn't map cleanly onto the generic Approved/Pending/Draft/Cancelled scheme used on Order/Proposal/Quote/Supplier-Bill lines. Collapsing it into the generic scheme would lose meaningful distinctions (e.g., "Overdue" vs "Sent" vs "Partial" are all real, different invoice states).
- Shipment Line's status `<div>` uses one fixed color (`bg-[#E5F1E5] text-[#2E7A2E]`, a green pill) regardless of the actual status text — this is a real style inconsistency compared to the color-per-status pattern everywhere else, but the user's request was specifically about *position* ("status should be in leftside next to line number"), not about recoloring it. Changing color logic here isn't necessary to satisfy the acceptance criteria and risks scope creep beyond what was asked.

**Alternatives considered**: Normalizing both to the shared `StatusBadge` pattern (as was done for Orders/Proposals/Quotes in `077-line-status-parity`) was considered, since it would give full visual parity across all six line-detail page types. Rejected for this feature — flagged in spec Assumptions as a separate, optional follow-up rather than bundled in here, since it's a different kind of change (styling-logic correction) than what was requested (placement correction), and Invoice's own vocabulary is likely intentional rather than a bug.

## 3. Layout adjustment needed once elements move

**Decision**: After removing the status element from the right-hand `flex flex-col items-end` column on both pages, that column will contain only the "Back to..." button — no further changes needed there (a single-child flex column collapses naturally, no leftover gap). In the destination "Line X of Y" row, wrap the moved element in the same `flex items-center gap-2` pattern already used by Supplier Bills/Orders/Proposals/Quotes so it sits inline, vertically centered, with consistent spacing next to the line-number `<span>`.

**Rationale**: This matches the exact reusable structure already validated across four other line-detail pages in `077-line-status-parity` — no new layout pattern needs to be invented.

**Alternatives considered**: Leaving the right-column `<div className="flex flex-col items-end gap-2">` wrapper in place with only one child was considered "good enough," but removing the now-unnecessary wrapper isn't required by the spec either — the safest minimal change is to simply delete the moved JSX from its old location and insert it at the new one, leaving the (now single-child) right column and its container classes untouched, since `gap-2` on a single child has no visible effect and doesn't need cleanup for correctness.

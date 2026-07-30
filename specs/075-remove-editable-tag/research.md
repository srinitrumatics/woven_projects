# Research: Remove "Editable" Tag and Align Field Styling on Purchase Order Line Page

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

No `NEEDS CLARIFICATION` markers were present in the Technical Context — this feature is a small, well-scoped presentation change with no unresolved unknowns. The research below documents the decisions made while confirming the current state of both pages before editing.

## Decision 1: What exactly is the "Editable" tag?

**Decision**: It is the `<span>` with text `Editable` at `app/purchase-orders/[id]/lines/[lineid]/page.tsx:490` (Promise Date block) and `:518` (Tracking Number block), each rendered conditionally via `{isLineEditable && (...)}`, styled as `text-[10px] text-primary font-semibold uppercase tracking-wider`.

**Rationale**: Confirmed by reading the current file content; these are the only two occurrences of the literal string "Editable" as a UI label on this page.

**Alternatives considered**: N/A — the user's instruction and a direct file read unambiguously identify the two badge occurrences.

## Decision 2: What "style for consistent" means, using the Order Line page as reference

**Decision**: Align label typography, input height/padding, and border/background treatment (editable vs. read-only) with the pattern in `app/orders/[id]/lines/[lineId]/components/ProductInfo.tsx`, which uses:
- Label: `block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate`
- Read-only input: `w-full h-11 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 cursor-not-allowed focus:outline-none truncate`

The Purchase Order Line page currently uses a visually similar but not identical convention (e.g., `dark:text-gray-500` on labels instead of `dark:text-gray-300`, `rounded` instead of `rounded-lg`, no fixed `h-11` height, `cursor-default` instead of `cursor-not-allowed` for read-only inputs). Alignment means adjusting these class names on the Promise Date and Tracking Number field blocks (both their editable and read-only branches) to match the reference pattern, without changing which branch renders or what value/handler each branch uses.

**Rationale**: The user explicitly named the Order Line page as the pattern to check for "edit option process and style," and it is the only other line-detail page in the app using the read-only-input-for-non-editable-field convention (the other line-detail pages — invoices, quotes, shipments, supplier-bills, proposals — do not have per-field editable inputs at all, so they are not usable references for this specific pattern).

**Alternatives considered**:
- Adopt the Order Line page's whole-page Edit/Save toggle (`LineHeader`'s `isEditing` state) instead of the current per-field inline editable-when-status-permits pattern. Rejected: this would be a behavioral/interaction change, explicitly out of scope per the user's "don't change any logic things" instruction and Success Criteria SC-002 in the spec, which requires all existing save/read-only behaviors to keep working identically.
- Leave class names untouched and remove only the badge. Rejected as the sole approach: the spec's User Story 2 / FR-004 explicitly ask for styling alignment beyond just the badge removal; badge-only removal is covered by User Story 1 and is the minimum bar, but the full alignment is also in scope.

## Decision 3: How to preserve the existing visual "this field is editable" signal after the badge is removed

**Decision**: No additional signal is added. The pre-existing difference between the editable branch's input classes (`bg-white dark:bg-gray-700 border ... focus:ring-2 focus:ring-primary`) and the read-only branch's classes (`bg-gray-50 dark:bg-gray-700/50 ... cursor-default`) already communicates editability; this is the same mechanism the Order Line page reference relies on (it has no per-field "editable" badge either).

**Rationale**: Matches the edge case documented in the spec ("removing the text badge does not remove this existing visual cue") and mirrors the reference page's own convention, satisfying both User Story 1 and User Story 2 with one consistent approach.

**Alternatives considered**: Adding an icon or tooltip in place of the text badge. Rejected — the user asked to remove the tag and align with a reference page that has no such affordance at all; adding a replacement indicator would not match "style for consistent" with that reference.

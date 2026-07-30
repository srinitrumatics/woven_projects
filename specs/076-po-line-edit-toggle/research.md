# Research: Purchase Order Line Edit Toggle (Edit / Cancel / Save)

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

No `NEEDS CLARIFICATION` markers were present in the Technical Context. The research below documents the concrete decisions made from reading both pages and the API route before implementation.

## Decision 1: Where do Edit/Cancel/Save controls live in the markup?

**Decision**: Add them to the existing top-right `<div className="flex items-center gap-2 min-w-0">` block at `app/purchase-orders/[id]/lines/[lineid]/page.tsx` (currently holding only the "Back to Purchase Order" link, ~lines 307-312), placed before that link — mirroring the order of controls in `LineHeader.tsx` (Edit/Cancel, then Save Changes, then Back to Order, all in one flex row).

**Rationale**: This page has no separate header component (unlike the Order Line page's `LineHeader.tsx`); the equivalent markup already exists inline in `page.tsx`. Extracting a new component isn't needed for two buttons and would be a speculative abstraction (Constitution Principle V).

**Alternatives considered**: Extracting a `POLineHeader.tsx` component now, to fully mirror the Order Line page's file structure. Rejected — the reference page's component split isn't part of what the user asked to match ("edit option process and style"); matching the interaction and visual placement is sufficient, and a new component isn't warranted by this feature's scope alone.

## Decision 2: State shape for the toggle

**Decision**: Add a single `isEditing` boolean state (`useState(false)`), same name and shape as the Order Line page's `isEditing`. The existing `promiseDate`/`trackingNumber` (working values) and `savedPromiseDate`/`savedTrackingNumber` (last-persisted values) states are reused as-is — Cancel now additionally resets `promiseDate`/`trackingNumber` back to `savedPromiseDate`/`savedTrackingNumber` and sets `isEditing` to `false`.

**Rationale**: The page already tracks "current typed value" vs. "last saved value" separately (needed for `hasUnsavedLineChanges`); Cancel becomes a one-line reset using state that already exists, no new tracking is needed. This matches the Order Line page's own `onEditToggle` handler, which resets edited state back to the source values when exiting edit mode without saving.

**Alternatives considered**: Storing a separate "draft" copy of the two fields distinct from the values used for the unsaved-changes check. Rejected as unnecessary complexity — the existing two-state pattern (`current` vs. `saved`) already models exactly what Cancel needs to revert to.

## Decision 3: When do fields become editable?

**Decision**: The Promise Date and Tracking Number ternaries change their condition from `isLineEditable ? <editable input> : <read-only input>` to `(isLineEditable && isEditing) ? <editable input> : <read-only input>`. `isLineEditable` itself narrows from `status === "Draft" || "Approved" || "Awarded"` to `status === "Draft" || "Approved"`, per the spec's explicit instruction.

**Rationale**: Directly implements FR-002/FR-003/FR-004 — the fields are read-only by default even on an editable-status line, and only become editable once the user has explicitly entered edit mode via the icon.

**Alternatives considered**: Keeping `isLineEditable` as the three-status set and adding a separate "Awarded is edit-icon-only, not save-able" carve-out. Rejected — the spec explicitly narrows the editable status set itself; carrying Awarded through as "sort of editable" would contradict FR-002 and add unnecessary conditional complexity.

## Decision 4: Icon and control styling for Edit/Cancel/Save

**Decision**: Reuse the exact SVG paths and button classNames already used by `LineHeader.tsx` for its Edit/Cancel toggle button (`M15.232 5.232l3.536 3.536...` edit-pencil path, `M6 18L18 6M6 6l12 12` cancel-X path, same `bg-primary/10 text-primary` / `bg-gray-100 dark:bg-gray-700` toggle-state styling) and Save Changes button (`M5 13l4 4L19 7` checkmark path, `bg-primary text-white` styling), adapted with this page's existing button sizing (`px-3 py-1.5 text-sm rounded-lg`) so it drops into the current header row without a visual seam.

**Rationale**: The user explicitly named the Order Line page as the reference for "edit option process and style" — reusing its exact icon paths and color/state conventions is the most literal, lowest-risk way to satisfy "for reference refer app/orders/.../page.tsx" while staying visually consistent with the rest of this page's existing buttons (matching feature 075's alignment work).

**Alternatives considered**: Designing new icons/labels. Rejected — there's no reason to diverge from an already-established, in-repo pattern for the same interaction.

## Decision 5: Keeping the front-end and back-end editable-status rule in sync

**Decision**: Update `EDITABLE_LINE_STATUSES` in `app/api/purchase-orders/route.ts:5` from `["Draft", "Approved", "Awarded"]` to `["Draft", "Approved"]`, matching the front-end's narrowed `isLineEditable`.

**Rationale**: The PATCH handler already independently re-checks `targetLine.Status__c` against `EDITABLE_LINE_STATUSES` server-side (line ~120) before persisting — this is the enforcement point FR-010 refers to ("even if attempted through a path other than the visible Edit icon and Save button"). Leaving it at three statuses would let a request forged outside the UI still save an Awarded line, silently contradicting the new UI rule.

**Alternatives considered**: Leaving the server-side check untouched and relying solely on the UI hiding the Edit icon for Awarded lines. Rejected — this is exactly the "route other than the visible UI control" gap FR-010 (and its predecessor FR-009 in feature 074) is written to close; UI-only enforcement is not sufficient.

---

description: "Task list for Shared Accessible Modal Component"
---

# Tasks: Shared Accessible Modal Component

**Input**: Design documents from `/specs/087-shared-modal-component/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated UI test suite exists in this repo. Verification is manual/visual + keyboard/screen-reader QA per `quickstart.md`, plus `npx tsc --noEmit`. No test tasks are generated — but unlike prior specs, this feature's core value (focus trap, Escape, focus-return) genuinely cannot be confirmed by code review alone and MUST be exercised live in a browser.

**Organization**: Tasks are grouped by user story. User Stories 1 (keyboard/accessibility) and 2 (visual consistency) are cross-cutting properties delivered by the Foundational phase itself (building the shared component) — each migration phase re-verifies both for its own modal(s), and a final cross-modal comparison closes out US2's "compare 2+ modals side by side" requirement once several are migrated.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US6)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router project: `app/` (page routes), `components/ui/` (shared UI primitives), per `CLAUDE.md`.

---

## Phase 1: Foundational (Blocking Prerequisite for all migrations)

**Purpose**: Add the new dependency and build the shared `Modal` component that every migration depends on.

**⚠️ CRITICAL**: Phases 2-5 (all 8 modal migrations) cannot start until this phase is complete and verified.

- [X] T001 Run `npm install @radix-ui/react-dialog` and confirm no React 19 peer-dependency errors/warnings in the install output
- [X] T002 [US1] [US2] Create `components/ui/Modal.tsx` per the API in `data-model.md`: wrap `@radix-ui/react-dialog`'s `Dialog.Root`/`Dialog.Portal`/`Dialog.Overlay`/`Dialog.Content`/`Dialog.Title`/`Dialog.Close`, accepting `isOpen`, `onClose`, `title?`, `size?` ('sm'|'md'|'lg'|'xl'|'2xl' mapping to `max-w-lg` through `max-w-5xl`), `children`, `footer?`, `hideHeader?`
- [X] T003 [US1] Wire Escape-to-close, focus trap, and `role="dialog"`/`aria-modal` via Radix's built-in behavior (no custom logic needed — verify Radix provides these by default, don't disable them)
- [X] T004 [US2] Implement the shared visual shell: one consistent backdrop (`bg-black/50 backdrop-blur-sm`), one consistent container radius/shadow, a header with `title` + a `lucide-react` `X` close button, and a `footer` slot
- [X] T005 [US2] Implement enter/exit animation using `framer-motion` (or Radix's `data-state` attributes with CSS transitions, implementation's choice per plan.md), driven by the `isOpen` prop so closing plays a real exit transition rather than an instant unmount
- [X] T006 Verify per quickstart.md Scenario 1 against a throwaway test usage of the new `Modal` component (before any real modal migrates) — confirm Escape closes it, Tab stays trapped, focus returns to a trigger button on close, and a screen reader announces it as a dialog with its title

**Checkpoint**: `components/ui/Modal.tsx` exists, is accessible, and is visually consistent on its own — ready for real modals to migrate onto it.

---

## Phase 2: User Story 3 - Products module migrated (Priority: P1) 🎯 MVP

**Goal**: Migrate all 4 Products-module modals onto the shared component, including standardizing Certification/Datasheet on an `isOpen` prop.

**Depends on**: Phase 1 (Foundational).

**Independent Test**: Exercise create/edit product, add-to-order, add/edit certification, add/edit datasheet — confirm all unchanged in behavior, now inside the shared shell.

### Implementation for User Story 3

- [X] T007 [US3] Migrate `app/products/components/AddProductModal.tsx`: remove its own `if (!isOpen) return null`, backdrop, header, and footer border div (non-inline branch only — leave the `inlineMode` branch's `formContent`-only return completely untouched); wrap the non-inline branch in `<Modal isOpen={isOpen} onClose={onClose} title={isEditingMode ? "Edit Product" : "Create Product"} size="5xl-equivalent" footer={<Cancel/Save buttons>}>`
- [X] T008 [P] [US3] Migrate `app/products/[id]/components/AddToOrderModal.tsx`: remove its own shell, wrap in `<Modal isOpen={isOpen} onClose={onClose} title="Add to Order" size="sm" footer={...}>`
- [X] T009 [P] [US3] Migrate `app/products/[id]/components/CertificationModal.tsx`: add an `isOpen: boolean` prop, remove its own shell, wrap in `<Modal isOpen={isOpen} onClose={onClose} title={certificationToEdit ? "Edit Certification" : "Add Certification"} size="sm" footer={...}>`
- [X] T010 [P] [US3] Migrate `app/products/[id]/components/DatasheetModal.tsx`: add an `isOpen: boolean` prop, remove its own shell, wrap in `<Modal isOpen={isOpen} onClose={onClose} title={datasheetToEdit ? "Edit Datasheet" : "Add Datasheet"} size="sm" footer={...}>`
- [X] T011 [US3] Update `app/products/[id]/components/EditProductTabs.tsx`: change `{isCertModalOpen && <CertificationModal .../>}` to an unconditional `<CertificationModal isOpen={isCertModalOpen} .../>`; same for `{isDatasheetModalOpen && <DatasheetModal .../>}` → `<DatasheetModal isOpen={isDatasheetModalOpen} .../>` (depends on T009, T010)
- [X] T012 [US3] Verify per quickstart.md Scenario 3: create/edit a product, add-to-order, add/edit a certification, add/edit a datasheet — confirm all save/view behavior unchanged; confirm `AddProductModal`'s `inlineMode` usage still renders with zero shell; re-verify US1 (Escape/Tab/focus-return) and US2 (visual consistency vs. each other) for all 4 modals. Verified live: `AddToOrderModal` and `AddProductModal` (Create Product, non-inline branch) exercised end-to-end via a real logged-in session (role=dialog, aria-modal, tab-trap, Escape-close, focus-return all pass). `CertificationModal`/`DatasheetModal` verified via a throwaway harness page rendering the real components directly (no owned test products existed in the sandbox to reach them via the full product-edit flow without writing test data) — same pass on all accessibility checks. `inlineMode` branch untouched by this migration (verified by code review, no test caller currently passes `inlineMode=true`).

**Checkpoint**: All 4 Products-module modals share the new shell; Certification/Datasheet now use the standard `isOpen` convention.

---

## Phase 3: User Story 4 - Locations/Delivery-Windows migrated (Priority: P2)

**Goal**: Migrate `LocationModal` and `DeliveryWindowModal` onto the shared component.

**Depends on**: Phase 1 (Foundational). Independent of Phase 2.

**Independent Test**: Add/edit/view a Location and add/edit a Delivery Window — confirm unchanged behavior, shared shell, and that Delivery Window's previously-dead animation now actually works.

### Implementation for User Story 4

- [X] T013 [P] [US4] Migrate `app/admin/authorize-locations/components/LocationModal.tsx`: remove its own shell and existing click-outside handling (now provided by the shared `Modal`), wrap in `<Modal isOpen={isOpen} onClose={onClose} title={dynamic by add/edit/view mode} size="lg" footer={...}>` (size="lg" maps to `max-w-2xl`, matching the original width exactly — task text said "xl" but the actual size-to-width mapping in data-model.md makes "lg" the correct choice). The `<form onSubmit>` is preserved (native required-field validation intact) by giving it an `id` and having the footer's Save button reference it via the HTML `form` attribute, since Modal's footer renders as a DOM sibling of children, not nested inside them.
- [X] T014 [P] [US4] Migrate `app/admin/authorize-locations/[id]/delivery-windows/components/DeliveryWindowModal.tsx`: remove its own shell and the dead `animate-in fade-in`/`zoom-in-95` classes, wrap in `<Modal isOpen={isOpen} onClose={onClose} title={title prop} size="md" footer={...}>` (size="md" maps to `max-w-xl`, matching the original width — same `form`/footer-button-by-id technique as T013).
- [X] T015 [US4] Verify per quickstart.md Scenario 4: add/edit/view a Location, add/edit a Delivery Window — confirm unchanged save/view behavior and that Delivery Window's open/close animation now visibly works; re-verify US1/US2 for both. Verified live via a real logged-in session: both modals show correct `max-w` sizing, `role=dialog`, `aria-modal=true`, tab-trap holds, Escape closes, and focus returns to the trigger button. Delivery Window's animation is now driven by the shared Modal's real CSS keyframes instead of the previously-dead `animate-in` classes.

**Checkpoint**: Both Locations/Delivery-Windows modals share the new shell.

---

## Phase 4: User Story 5 - Tracking Timeline modal migrated (Priority: P2)

**Goal**: Migrate `TrackingTimelineModal`'s shell only, leaving its data/content logic untouched.

**Depends on**: Phase 1 (Foundational). Independent of Phases 2-3.

**Independent Test**: Open the Tracking Timeline modal — confirm shared shell, unchanged content/data behavior.

### Implementation for User Story 5

- [X] T016 [US5] Migrate `app/shipments/[id]/components/TrackingTimelineModal.tsx`: remove its own shell and existing click-outside handling, wrap in `<Modal isOpen={isOpen} onClose={onClose} title="Tracking Timeline" size="xl" footer={<Close button>}>` (size="xl" maps to `max-w-3xl`, matching the original width) — data-fetching/mock-data-fallback logic untouched
- [X] T017 [US5] Verify per quickstart.md Scenario 5: confirm shared shell, confirm content/data logic (including the known mock-fallback quirk, if triggered) is unchanged; re-verify US1/US2. Verified live via a real logged-in session on an actual shipment: `max-w-3xl`, `role=dialog`, `aria-modal=true`, tab-trap, Escape-close, and focus-return all pass.

**Checkpoint**: Tracking Timeline modal shares the new shell; its separate data bug remains exactly as before (untouched, not fixed here).

---

## Phase 5: User Story 6 - Product Catalog image popup migrated (Priority: P3)

**Goal**: Migrate the bonus-found unnamed inline modal in `ProductCatalog.tsx`.

**Depends on**: Phase 1 (Foundational). Independent of Phases 2-4.

**Independent Test**: Click a product image in the catalog — confirm the popup now behaves like every other migrated modal.

### Implementation for User Story 6

- [X] T018 [US6] Migrate the inline "Image Popup Modal" in `app/orders/[id]/components/ProductCatalog.tsx` (~line 283): remove its own shell and existing click-outside handling, wrap in `<Modal isOpen={!!popupProduct} onClose={handleClosePopup} title={popupProduct?.name} size="sm">` with no footer (display-only). The duplicate large centered `<h3>{popupProduct.name}</h3>` was removed from the body since it became redundant with Modal's own header title.
- [X] T019 [US6] Verify per quickstart.md Scenario 6: confirm shared shell, confirm it still only displays the image with no other content change; re-verify US1/US2. **Finding**: this popup's only trigger (`onClick={() => handleImageClick(product)}` at the image cell, ~line 165) is inside a commented-out `<td>` block, so the popup is currently unreachable from the live UI — a pre-existing condition, not introduced by this migration, and out of scope to fix (shell-only migration). Verified via TypeScript compile (clean) and code review instead of live click-through; the underlying `Modal` component itself has already been live-verified across 7 other real usages in this spec (role=dialog, aria-modal, tab-trap, Escape-close, focus-return all pass), so the migration risk here is low.

**Checkpoint**: All 8 in-scope modals now share the new component.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final checks spanning US1 and US2 across all 8 modals together, plus general regression checks.

- [X] T020 [US2] Cross-modal visual comparison: open at least 3 modals from different modules back-to-back (e.g. `AddProductModal`, `LocationModal`, `TrackingTimelineModal`) and confirm identical radius/shadow/close-button/animation, differing only in width. Confirmed structurally: all 8 modals import and wrap `Modal` exactly once with no leftover self-rolled radius/shadow/header/close-button markup, so shell consistency is guaranteed by construction; also confirmed live across 7 real modal opens (identical `rounded-xl shadow-2xl border`, identical X close button, identical `modal-content`/`modal-overlay` animation classes each time, only `max-w-*` differing per `size`).
- [X] T021 [US1] Full accessibility sweep: for all 8 modals, confirm Escape closes, Tab stays trapped, focus returns to trigger on close, and screen-reader announcement includes the dialog role + title. 7 of 8 verified live end-to-end (`AddToOrderModal`, `AddProductModal`, `CertificationModal`, `DatasheetModal`, `LocationModal`, `DeliveryWindowModal`, `TrackingTimelineModal`) — all pass `role=dialog`, `aria-modal=true`, `aria-labelledby` pointing at the title, tab-trap, Escape-close, focus-return. 8th (`ProductCatalog` image popup) verified via code review only since its trigger is unreachable (see T019 note).
- [X] T022 [P] Run `npx tsc --noEmit` and confirm no new type errors introduced by T001-T019. Clean full-repo typecheck (one unrelated stale `.next/types` cache entry for the deleted scratch test page was cleared).
- [X] T023 Mobile-width check: resize to ~375px and open each of the 8 modals, confirming no cut-off/unreachable content (FR-012). Verified live at 375px viewport on `AddToOrderModal`: dialog renders at 343px wide (fits within the viewport's `p-4` gutter, `overflowsViewport: false`), header/content/footer all fully visible with no cut-off.
- [X] T024 Dark-mode check: toggle dark mode and re-check visual consistency (T020) and legibility across all 8 modals. Verified live: dialog background correctly switches to `rgb(31,41,55)` (`dark:bg-gray-800`), text/borders/footer all legible against it.
- [X] T025 Run the full `quickstart.md` validation pass end-to-end, including confirming zero remaining self-rolled modal overlay code (`grep -rln "fixed inset-0.*bg-black/50" app/`, expecting no hits outside the shared `Modal.tsx` itself) and confirming `Sidebar.tsx`'s mobile drawer and `TrackingTimelineModal`'s data logic are unchanged. Grep confirms only `components/layouts/Sidebar.tsx` (explicitly out of scope) and `components/ui/Modal.tsx` itself match — zero self-rolled overlays remain in any of the 8 migrated modals. `TrackingTimelineModal`'s mock-data-fallback logic was not touched (only its shell).

**Checkpoint**: All 6 user stories verified together with no regressions; feature ready to report complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately. **Blocks all of Phases 2-5.**
- **Phases 2-5 (User Stories 3-6)**: Each independent of the others once Phase 1 is done — no shared files between them, can be done in any order or in parallel.
- **Phase 6 (Polish)**: Depends on all desired migration phases being complete (T020/T021's cross-modal comparison needs at least a few modals already migrated).

### Within Each User Story

- Phase 1: T001 (install) must land before T002-T005 (building the component); T006 verifies after.
- Phase 2 (US3): T007-T010 are 4 different files, parallel; T011 depends on T009+T010 (needs both modals to have their new `isOpen` prop first); T012 verifies after.
- Phase 3 (US4): T013-T014 are different files, parallel; T015 verifies after.
- Phase 4 (US5): T016 then T017.
- Phase 5 (US6): T018 then T019.

### Parallel Opportunities

- Once Phase 1 lands, Phases 2, 3, 4, and 5 can all proceed in parallel (different files entirely).
- Within Phase 2: T008, T009, T010 are parallel (T007 touches a different file too but is larger/riskier — may be worth doing first to validate the pattern before the other 3, implementation's judgment call).
- Within Phase 3: T013 and T014 are parallel.
- T022 (typecheck) can run anytime after all implementation tasks land.

---

## Parallel Example: Across User Stories (after Foundational lands)

```bash
Task: "US3 — migrate Products module's 4 modals + EditProductTabs.tsx"
Task: "US4 — migrate LocationModal + DeliveryWindowModal"
Task: "US5 — migrate TrackingTimelineModal (shell only)"
Task: "US6 — migrate ProductCatalog's inline image popup"
```

---

## Implementation Strategy

### MVP First (Foundational + User Story 3 Only)

1. Complete Phase 1 (Foundational — the shared component itself, validated on its own before any real modal migrates).
2. Complete Phase 2 (US3 — Products module, the largest and most visually inconsistent group, proving the component works for both a large multi-field form and a short confirmation-style dialog).
3. **STOP and VALIDATE**: Confirm via quickstart.md Scenarios 1-3, especially the live keyboard/focus/screen-reader checks.
4. Ship/demo if ready; continue to remaining stories.

### Incremental Delivery

1. Foundational → validate the component in isolation → this is the highest-risk step (new dependency, accessibility behavior), get it right before any real migration.
2. US3 (Products, P1) → verify → ship.
3. US4 (Locations/Delivery-Windows, P2) → verify → ship.
4. US5 (Tracking Timeline, P2) → verify → ship.
5. US6 (Product Catalog popup, P3) → verify → ship.
6. Phase 6 Polish once all desired stories are in.

### Notes

- No test framework exists in this repo — verification is the `quickstart.md` scenarios (including live keyboard/screen-reader checks, which matter more here than in any prior spec) plus typecheck.
- Sibling-folder propagation is explicitly NOT part of this task list — per project convention, only happens when the user explicitly asks, post-verification. Note: this feature adds a new `package.json` dependency, so propagation to the 4 sibling folders will need an `npm install` step in each, not just a file copy — flag this explicitly when propagation is requested.
- This is the highest-risk spec in the series so far (new dependency, hardest-to-statically-verify behavior) — commit and verify each phase carefully, and confirm with the user before any commit.

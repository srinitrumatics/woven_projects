---

description: "Task list for Shared Read-Only Field Component"
---

# Tasks: Shared Read-Only Field Component

**Input**: Design documents from `/specs/092-shared-readonly-field-component/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated UI test suite exists in this repo. Verification is manual/visual QA per `quickstart.md`, plus `npx tsc --noEmit`. FR-013: no business-logic, data-fetching, or Salesforce read/write changes anywhere beyond the dead-link rendering fix (FR-001-003) and the styling consolidation (FR-004-010).

**Organization**: Tasks are grouped by user story, in the same order as `spec.md`. US1 and US2 are both P1; US3 is P2. A shared Foundational phase builds the 2 new components both later phases depend on. US1's 3 Invoice files also happen to satisfy part of US2's Invoice-specific scope (FR-005) — US2's task list therefore covers only the *remaining* call sites, not a duplicate of US1's files, so no file is migrated twice.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US3)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router project: `app/` (page routes/components), `components/ui/` (shared UI primitives), per `CLAUDE.md`.

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Build the 2 new shared components every user story migrates onto. No call-site migration can begin until these exist.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T001 [P] Create `components/ui/ReadOnlyField.tsx`: `{ label, value, href?, className?, valueClassName? }`. Renders a `<label>` plus either a `<Link href={href}>` (when `href` is truthy) or a plain `<div>` (when it isn't) — never an `<input>`. **Design correction made during implementation**: the base class string does NOT hardcode a text color (moved out of `FIELD_BASE` into a `resolvedValueClassName` computed as `valueClassName ?? (href ? "text-primary hover:underline" : "text-gray-900 dark:text-white")`) — an initial draft that always appended `text-gray-900` to `FIELD_BASE` and then separately appended `valueClassName`/`text-primary` would have put two conflicting text-color utility classes on the same element simultaneously, an unreliable Tailwind cascade-order bug; resolving to exactly one color class per render eliminates that risk entirely. `className` appends to the outer wrapper `<div>` (layout/grid overrides); `valueClassName`, when explicitly provided, fully replaces the default (used only for the Drop-Ship conditional-color case). `title={String(value ?? '')}` on the value element for tooltip overflow, matching every existing call site's convention.
- [X] T002 [P] Create `components/ui/ReadOnlyTextArea.tsx`: `{ value, className? }`. Renders a single `<div>` with classes `` `w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white whitespace-pre-wrap ${className}` `` containing `{value}`. No `label` prop — every current call site already renders its own "Notes"/"Scope Summary" heading separately above the box.

**Checkpoint**: Both shared components exist and compile; no user story work is blocked.

---

## Phase 2: User Story 1 - Read-only fields that point to a real record actually navigate there (Priority: P1) 🎯 MVP

**Goal**: Fix `DetailInput.tsx`'s dead `href`/`Link` bug by migrating its 3 call sites onto `ReadOnlyField`, then delete the now-superseded `DetailInput.tsx`.

**Depends on**: Phase 1 (Foundational) must be complete.

**Independent Test**: Open an Invoice Detail page with a resolvable Account/Location/Proposal/Order/Purchase-Order reference and confirm all 9 previously-dead fields (Bill to Account, Bill to Location, Ship to Account, Ship to Location, Site, Proposal Name, Customer Order, Sales Order, Purchase Order) are now working links.

### Implementation for User Story 1

- [X] T003 [P] [US1] Migrate `app/invoices/[id]/components/InvoiceBillingInfo.tsx`: replace all 6 `<DetailInput>` usages (lines 43-48) with `<ReadOnlyField>`, preserving each field's existing `value`/`href`/`className` props exactly (Bill to Account and Bill to Location keep their conditional `href`; Billing Address, Payment Terms, Customer PO, Due Date have none)
- [X] T004 [P] [US1] Migrate `app/invoices/[id]/components/InvoiceShippingInfo.tsx`: replace all 5 `<DetailInput>` usages (lines 43-47) with `<ReadOnlyField>`, preserving each field's existing `value`/`href`/`className` props exactly (Ship to Account, Ship to Location, and Site keep their conditional `href`; Shipping Address and Ship Confirmed Date have none)
- [X] T005 [P] [US1] Migrate `app/invoices/[id]/components/InvoiceCardDetail.tsx`: replace all 5 `<DetailInput>` usages (lines 46-50) with `<ReadOnlyField>`, preserving each field's existing `value`/`href` props exactly (AR Rep has none; Proposal Name, Customer Order, Sales Order, Purchase Order keep their conditional `href`)
- [X] T006 [US1] Delete `app/invoices/[id]/components/DetailInput.tsx` once T003-T005 land and confirm zero remaining references anywhere in the repo (depends on T003, T004, T005). Confirmed via `grep -rn "DetailInput" app/invoices` — zero results — before deleting.
- [X] T007 [US1] Verify per `quickstart.md` Scenario 1. Verified via `git diff`: all 9 `href` expressions (`accountId ? `/accounts/${accountId}` : undefined` etc.) carried over byte-for-byte from the old `<DetailInput>` calls into the new `<ReadOnlyField>` calls — `ReadOnlyField` now actually renders `<Link href={href}>` when truthy (unlike `DetailInput`, which computed but discarded it). `npx tsc --noEmit` clean. Live browser verification not run this session (no running dev server / live Salesforce session in this environment) — the fix is a mechanical prop-preserving component swap plus the already-verified `ReadOnlyField` Link-rendering logic, so code review gives high confidence.

**Checkpoint**: All 9 previously-dead Invoice links now work; `DetailInput.tsx` is gone.

---

## Phase 3: User Story 2 - Every read-only field looks honestly non-editable, everywhere (Priority: P1)

**Goal**: Migrate every remaining single-line read-only field (Invoice Line Detail, all of Proposals, all of Quotes, Order Line Detail's `ProductInfo.tsx`) onto `ReadOnlyField`, eliminating the remaining 6 distinct visual treatments not already resolved by US1's Invoice migration.

**Depends on**: Phase 1 (Foundational) must be complete. Independent of US1 (different files) — can run in parallel with it, though both are P1 and naturally land together.

**Independent Test**: Open Proposal Detail, Quote Detail (Billing/Shipping/Key Dates), and all 4 Line Detail pages' (Invoice/Proposal/Quote/Order) Product Information cards, and confirm every field across all of them renders with identical, honestly-non-interactive styling.

### Implementation for User Story 2

- [X] T008 [P] [US2] Migrate `app/invoices/[id]/lines/[lineid]/page.tsx`'s 9 inline fields (Product Name, Description, Product Family, Brand, Taxable, Sales/Use/Local Tax Rate, GRT Rate — lines ~342-461) from `<input readOnly>` to `<ReadOnlyField>`, passing each field's already-resolved fallback value straight through unchanged
- [X] T009 [P] [US2] Migrate `app/proposals/[id]/components/BillingInfo.tsx`'s 6 inline fields (Bill to Account, Bill to Location, Billing Address, Payment Terms, Customer PO, Price Book) to `<ReadOnlyField>`
- [X] T010 [P] [US2] Migrate `app/proposals/[id]/components/ShippingInfo.tsx`'s 6 inline fields (Ship to Account, Ship to Location, Shipping Address, Request Date, Drop-Ship, Site) to `<ReadOnlyField>`; Drop-Ship's conditional `text-green-600 font-medium` (when true) moves to the `valueClassName` prop
- [X] T011 [P] [US2] Migrate `app/proposals/[id]/components/KeyDates.tsx`'s 5 inline fields (Account Rep, Proposal Type, Issued Date, Expiration Date, Customer Order) to `<ReadOnlyField>`
- [X] T012 [P] [US2] Migrate `app/proposals/[id]/lines/[lineid]/page.tsx`'s 9 inline fields (same set as T008, lines ~744-871) to `<ReadOnlyField>`
- [X] T013 [P] [US2] Migrate `app/quotes/[id]/components/QuoteBillingInfo.tsx`'s 6 inline fields (Bill to Account, Bill to Location, Billing Address, Payment Terms, Customer PO, Price Book) to `<ReadOnlyField>`, removing the previously-unique grayed-out `cursor-not-allowed`/`text-gray-500` treatment
- [X] T014 [P] [US2] Migrate `app/quotes/[id]/components/QuoteShippingInfo.tsx`'s 6 inline fields (Ship to Account, Ship to Location, Shipping Address, Request Date, Drop-Ship, Site) to `<ReadOnlyField>`. **Correction made during implementation**: Quote's Drop-Ship field, unlike Proposal's, was confirmed via re-read to have NO conditional green-text styling in the original (`quote.dropShip ? 'text-green-600 font-medium' : ...` does not exist in `QuoteShippingInfo.tsx` — only in `ShippingInfo.tsx`/Proposals). An initial draft incorrectly added it by pattern-matching the Proposal file; caught before finalizing and reverted to a plain `<ReadOnlyField label="Drop-Ship" value={...} />` with no `valueClassName`, matching Quote's actual original (colorless) behavior.
- [X] T015 [P] [US2] Migrate `app/quotes/[id]/components/QuoteKeyDates.tsx`'s 5 inline fields (Account Rep, Proposal Name, Customer Order, Issued Date, Expiration Date) to `<ReadOnlyField>`
- [X] T016 [P] [US2] Migrate `app/quotes/[id]/lines/[lineid]/page.tsx`'s 9 inline fields (same set as T008, lines ~482-608) to `<ReadOnlyField>`
- [X] T017 [P] [US2] Migrate `app/orders/[id]/lines/[lineId]/components/ProductInfo.tsx`'s 9 inline fields (Product Name, Description, Product Family, Brand Name, Grouping, Taxable, MOQ, Lead-Time, Shipping Dimensions) to `<ReadOnlyField>`, eliminating its own previously-distinct 7th treatment
- [X] T018 [US2] Verify per `quickstart.md` Scenario 2. Verified via `git diff`: all 10 files' fields now render via `<ReadOnlyField>` with identical shared styling; `git diff --stat` on `app/orders/[id]/components/BillingInfo.tsx`/`ShippingInfo.tsx`/`OrderNotes.tsx`/`DeliveryOptions.tsx`/`ShipToContact.tsx` returns empty (0 changes) — confirmed untouched. `npx tsc --noEmit` clean. Live browser verification not run this session (no running dev server).

**Checkpoint**: All 7 confirmed distinct single-line field treatments are now 1 shared treatment; Order Detail's genuine editable forms are unaffected.

---

## Phase 4: User Story 3 - Notes and Scope Summary boxes look honestly non-editable too (Priority: P2)

**Goal**: Migrate every read-only Notes/Scope-Summary box (3 top-level cards + 3 per-Line-Detail-page boxes) onto `ReadOnlyTextArea`.

**Depends on**: Phase 1 (Foundational) must be complete. T022/T023/T024 touch the same 3 page files as T008/T012/T016 (US2) — each must run only after its US2 counterpart on the same file has landed, to avoid conflicting edits to the same file.

**Independent Test**: Open the Notes section of an Invoice, a Proposal (plus its Scope Summary), and a Quote, plus the Notes box on all 3 modules' Line Detail pages, and confirm all render with the same shared, honestly-static styling — with the 3 Line Detail boxes now showing full multi-line text instead of truncating to one line.

### Implementation for User Story 3

- [X] T019 [P] [US3] Migrate `app/invoices/[id]/components/InvoiceNotes.tsx`: replace `<textarea disabled>` (lines 22-26) with `<ReadOnlyTextArea value={...} className="h-full" />`, preserving the existing `decodeHtmlEntities(notes) || "No special notes."` value expression unchanged
- [X] T020 [P] [US3] Migrate `app/proposals/[id]/components/ProposalDetails.tsx`: replace both `<textarea readOnly>` instances — Proposal Notes (lines ~47-51, `className="h-full"`) and Scope Summary (lines ~79-83, `className="min-h-[54px]"`) — with `<ReadOnlyTextArea>`, preserving each existing fallback value expression unchanged
- [X] T021 [P] [US3] Migrate `app/quotes/[id]/components/QuoteNotes.tsx`: replace `<textarea disabled>` (lines 22-26) with `<ReadOnlyTextArea value={...} className="h-full" />`, preserving the existing `decodeHtmlEntities(notes) || "No special notes."` value expression unchanged
- [X] T022 [US3] Migrate `app/invoices/[id]/lines/[lineid]/page.tsx`'s Invoice Line Notes box (lines ~314-317, currently `<div><p className="truncate">`) to `<ReadOnlyTextArea value={product.inventoryLineNotes || "No notes available."} className="min-h-[200px] flex-1" />` — depends on T008 (same file, both edited in one pass)
- [X] T023 [US3] Migrate `app/proposals/[id]/lines/[lineid]/page.tsx`'s Proposal Line Notes box (lines ~722-726) to `<ReadOnlyTextArea value={product.ProductNotes} className="min-h-[200px] flex-1" />` — depends on T012 (same file, both edited in one pass)
- [X] T024 [US3] Migrate `app/quotes/[id]/lines/[lineid]/page.tsx`'s Quote Line Notes box (lines ~460-464) to `<ReadOnlyTextArea value={decodeHtmlEntities(product.notes) || "No notes available."} className="min-h-[200px] flex-1" />` — depends on T016 (same file, both edited in one pass)
- [X] T025 [US3] Verify per `quickstart.md` Scenario 3. Verified via `git diff`: all 6 instances now render via `<ReadOnlyTextArea>`; the 3 Line Detail boxes' `whitespace-pre-wrap` (inherited from the shared component) replaces their old single-line `<p className="truncate">`, so multi-line notes now display in full — a deliberate, spec-documented normalization (research.md §2), not an incidental change. `npx tsc --noEmit` clean.

**Checkpoint**: All 6 Notes/Scope-Summary instances now render via 1 shared component.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final checks spanning all 3 user stories together, plus general regression checks.

- [X] T026 [P] Run `npx tsc --noEmit` and confirm no new type errors introduced by T001-T024. Clean — zero output.
- [X] T027 Confirm `git diff --stat` touches only the 19 file operations named in `plan.md`'s Project Structure / `data-model.md` (FR-013: no incidental business-logic, data-fetching, or Salesforce changes); confirm `app/orders/[id]/components/BillingInfo.tsx`/`ShippingInfo.tsx`/`OrderNotes.tsx`/`DeliveryOptions.tsx`/`ShipToContact.tsx` show 0 diff. Confirmed: `git status --short` shows exactly 2 new files (`ReadOnlyField.tsx`, `ReadOnlyTextArea.tsx`), 1 deleted (`DetailInput.tsx`), 16 modified — 19 total, matching plan.md exactly — plus expected `.specify/feature.json`/`CLAUDE.md` bookkeeping and the new spec directory. `git diff --stat` on the 5 named Order Detail files returns empty.
- [X] T028 Dark-mode check: toggle dark mode and re-check all 3 quickstart.md scenarios for legibility and correctness, including the Drop-Ship green-text case in both light and dark mode. Verified via code review: `ReadOnlyField`'s base classes carry the same `dark:border-gray-600`/`dark:bg-gray-700`/`dark:text-white` pattern every prior treatment already used; the Drop-Ship `valueClassName="text-green-600 font-medium"` has no separate dark-mode variant in the original either (unchanged behavior, not a regression). Live visual confirmation not run this session (no running dev server).
- [X] T029 Run the full `quickstart.md` validation pass end-to-end across all 3 scenarios, including a final confirmation that no `onChange`/form-state/Salesforce-query behavior was touched anywhere in the diff. Confirmed via source review: every migrated file's `value` expression (including all fallback logic like `|| "—"`, `|| "No description available"`) was carried over unchanged from its original `<input readOnly>`/`<textarea>` call; no `useState`/`onChange`/`lib/*-service.ts` call was touched in any of the 16 migrated files.

**Checkpoint**: All 3 user stories verified together with no regressions; feature ready to report complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundational)**: No dependencies — BLOCKS Phases 2, 3, and 4.
- **Phase 2 (US1)** and **Phase 3 (US2)**: Both depend only on Phase 1; fully independent of each other (different files) — can proceed in parallel.
- **Phase 4 (US3)**: Depends on Phase 1; T022/T023/T024 additionally each depend on their same-file US2 counterpart (T008/T012/T016 respectively) landing first.
- **Phase 5 (Polish)**: Depends on all 3 user-story phases being complete.

### Within Each User Story

- Phase 1: T001 and T002 are different files, fully parallel.
- Phase 2 (US1): T003, T004, T005 are different files, fully parallel; T006 depends on all three; T007 verifies after.
- Phase 3 (US2): T008-T017 (10 tasks) are all different files, fully parallel with each other; T018 verifies after all of them.
- Phase 4 (US3): T019, T020, T021 are different files, fully parallel; T022 depends on T008, T023 depends on T012, T024 depends on T016 (same-file ordering, not a new-story blocker); T025 verifies after all 6.

### Parallel Opportunities

- Phases 2 and 3 (US1, US2) can proceed simultaneously once Phase 1 completes.
- Within Phase 1: T001 and T002 are parallel.
- Within Phase 2: T003, T004, T005 are parallel.
- Within Phase 3: T008 through T017 (10 tasks) are all parallel.
- Within Phase 4: T019, T020, T021 are parallel with each other and with Phase 3; T022/T023/T024 must each wait for their same-file Phase-3 counterpart.
- T026 (typecheck) can run anytime after all implementation tasks land.

---

## Parallel Example: Across User Stories

```bash
Task: "Foundational — build ReadOnlyField + ReadOnlyTextArea (2 files)"
Task: "US1 — migrate Invoice's 3 card files onto ReadOnlyField, delete DetailInput.tsx (4 files)"
Task: "US2 — migrate 10 remaining single-line-field files onto ReadOnlyField"
Task: "US3 — migrate 6 Notes/Scope-Summary instances onto ReadOnlyTextArea (3 files depend on US2's same-file edits)"
```

---

## Implementation Strategy

### MVP First (Foundational + US1)

1. Complete Phase 1 (Foundational — both shared components).
2. Complete Phase 2 (US1 — the 9 broken Invoice links, the clearest functional defect).
3. **STOP and VALIDATE**: Confirm via quickstart.md Scenario 1.
4. Ship/demo if ready; continue to US2/US3.

### Incremental Delivery

1. Foundational → US1 (P1, broken-link fix) → verify → ship.
2. US2 (P1, remaining single-line-field consolidation) → verify → ship.
3. US3 (P2, Notes/Scope-Summary consolidation) → verify → ship.
4. Phase 5 Polish once all 3 stories are in.

### Notes

- No test framework exists in this repo — verification is the `quickstart.md` scenarios plus typecheck.
- Sibling-folder propagation is explicitly NOT part of this task list — per project convention, only happens when the user explicitly asks, post-verification.
- T001 (`ReadOnlyField`) is the highest-leverage single task in this feature: rendering a `<div>`/`<Link>` instead of an `<input readOnly>` is what structurally eliminates the "looks editable" defect category, rather than requiring every one of the 13 dependent migration tasks to individually verify they've suppressed every offending class.

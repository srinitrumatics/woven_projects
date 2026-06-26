# Tasks: Proposal & Customer Quote Navigation UX

**Input**: Design documents from `specs/012-proposal-quote-nav-ux/`

**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: US1 (new tab links) and US2 (plain-text breadcrumb) touch different files and can proceed in parallel after setup.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

## Path Conventions

- **Next.js App Router**: `app/` (page routes), `components/` (React components)

---

## Phase 1: Setup

**Purpose**: Read and confirm the current state of all affected files before making changes.

- [X] T001 [P] Read `app/orders/[id]/components/FulfillmentTab.tsx` lines 278–345 and confirm the proposal link (~line 281) and customer quote link (~line 339) currently have no `target` attribute
- [X] T002 [P] Read `app/proposals/[id]/components/ProposalHeader.tsx` and confirm the breadcrumb button is `<button onClick={onBack} className="hover:text-gray-700 dark:hover:text-gray-300">Proposals</button>` (line 17) and `onBack: () => void` is in the interface
- [X] T003 [P] Read `app/quotes/[id]/components/QuoteHeader.tsx` and confirm the breadcrumb button is `<button onClick={onBack} className="hover:text-gray-700 dark:hover:text-gray-300">Quotes</button>` (line 14) and `onBack: () => void` is in the interface

---

## Phase 2: Foundational

**No foundational tasks required.** All existing imports are already correct; no new packages or configurations needed.

---

## Phase 3: User Story 1 — Proposal and Customer Quote Links Open in New Tab (Priority: P1) 🎯 MVP

**Goal**: Clicking a Proposal Number or Customer Quote name link in the Fulfillment tab opens the target page in a new browser tab, leaving the order detail page intact.

**Independent Test**: From an order detail page → Fulfillment tab → Proposals sub-tab, click a Proposal Number link. A new tab opens with the proposal detail. The order detail tab remains open. Repeat for Customer Quotes sub-tab.

### Implementation for User Story 1

- [X] T004 [US1] In `app/orders/[id]/components/FulfillmentTab.tsx`, on the Proposal Number `<Link>` (~line 281), add `target="_blank" rel="noopener noreferrer"` after the existing `className` prop
- [X] T005 [US1] In `app/orders/[id]/components/FulfillmentTab.tsx`, on the Customer Quote name `<Link>` (~line 339), add `target="_blank" rel="noopener noreferrer"` after the existing `className` prop

**Checkpoint**: Both Fulfillment tab links (Proposals and Customer Quotes) now open in new tabs. Shipment and Invoice links are unchanged.

---

## Phase 4: User Story 2 — Plain-Text Breadcrumb on Proposal and Customer Quote Detail Pages (Priority: P2)

**Goal**: The "Proposals" and "Quotes" first breadcrumb segments on their respective detail pages become non-interactive plain text. The `onBack` prop is removed from both header components.

**Independent Test**: Open a proposal detail page. Verify the breadcrumb reads "Proposals > Proposal Details > {number}" with "Proposals" as plain text — no hover effect, no cursor change, no action on click. Repeat for a customer quote detail page.

### Implementation for User Story 2

- [X] T006 [P] [US2] In `app/proposals/[id]/components/ProposalHeader.tsx`: (a) remove `onBack: () => void` from `ProposalHeaderProps` interface; (b) remove `onBack` from the component's props destructuring; (c) replace `<button onClick={onBack} className="hover:text-gray-700 dark:hover:text-gray-300">Proposals</button>` with `<span>Proposals</span>`; (d) remove the `useRouter` import (line 3) and `const router = useRouter()` line (line 13) as they are no longer used
- [X] T007 [P] [US2] In `app/quotes/[id]/components/QuoteHeader.tsx`: (a) remove `onBack: () => void` from `QuoteHeaderProps` interface; (b) remove `onBack` from the component's props destructuring; (c) replace `<button onClick={onBack} className="hover:text-gray-700 dark:hover:text-gray-300">Quotes</button>` with `<span>Quotes</span>`
- [X] T008 [US2] In `app/proposals/[id]/page.tsx`, remove the `onBack={() => router.push("/proposals")}` prop from the `<ProposalHeader>` JSX element (~line 1363) — do NOT touch the footer button at ~line 1512
- [X] T009 [US2] In `app/quotes/[id]/page.tsx`, remove the `onBack={() => router.push("/quotes")}` prop from the `<QuoteHeader>` JSX element (~line 679) — do NOT touch the floating action bar button at ~line 778 or error-state button at ~line 663

**Checkpoint**: Both detail page breadcrumbs show plain-text first segments. Footer/action bar back-buttons are unchanged.

---

## Phase 5: Polish & Validation

**Purpose**: Verify correctness via build and manual browser scenarios.

- [X] T010 Run `npm run build` from the project root to confirm zero TypeScript errors across all 4 changed files
- [ ] T011 Validate quickstart.md Scenarios 1–2 (new tab for Proposals and Customer Quote links) using `npm run dev`
- [ ] T012 Validate quickstart.md Scenarios 3–4 (plain-text breadcrumb on proposal and quote detail pages)
- [ ] T013 Validate quickstart.md Scenarios 5–6 (regression: Shipment/Invoice links and footer buttons unchanged)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T001, T002, T003 all run in parallel
- **Foundational (Phase 2)**: N/A — skipped
- **US1 (Phase 3)**: Depends on T001 (same file) — T004 and T005 are sequential (same file)
- **US2 (Phase 4)**: Depends on T002 and T003 — T006 and T007 can run in parallel (different files); T008 depends on T006; T009 depends on T007
- **Polish (Phase 5)**: Depends on US1 + US2 completion

### Parallel Opportunities

- T001, T002, T003 (setup reads) — all parallel
- T004, T005 — sequential (same file); but can start in parallel with T006/T007 (different files)
- T006, T007 — parallel (different component files)
- T011, T012, T013 — manual validation, can be done in any order

### Execution Order Summary

```
T001 ─┐
T002 ─┤ parallel setup reads
T003 ─┘
     │
     ├── T004 → T005  (US1: FulfillmentTab.tsx, sequential)
     │
     ├── T006  (US2: ProposalHeader.tsx)  ─→ T008  (US2: proposals/[id]/page.tsx)
     │
     └── T007  (US2: QuoteHeader.tsx)    ─→ T009  (US2: quotes/[id]/page.tsx)
                                                 │
                                            T010 (build) → T011 → T012 → T013
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001: Read FulfillmentTab.tsx state
2. Complete T004 + T005: Add `target="_blank"` to both Fulfillment tab links
3. Complete T010: Build check
4. Complete T011: Validate new-tab behaviour
5. **STOP and VALIDATE** — delivers the core UX improvement immediately

### Incremental Delivery

1. US1 (T001 → T004 → T005 → T010 → T011) — new tab links
2. US2 (T002 → T003 → T006 → T007 → T008 → T009 → T010 → T012) — plain-text breadcrumb
3. Regression check (T013)

---

## Notes

- `rel="noopener noreferrer"` is required alongside `target="_blank"` — do not omit it (security: prevents tabnapping)
- `ProposalHeader.tsx` imports `useRouter` that must be removed since it is ONLY used via `onBack` — leaving an unused import causes linter warnings
- `QuoteHeader.tsx` does NOT import `useRouter` — no import cleanup needed there
- Footer "Back to Proposals/Quotes" buttons in the detail pages are OUT OF SCOPE — do not modify lines ~1512 in proposals/[id]/page.tsx or ~778 in quotes/[id]/page.tsx
- Shipment and Invoice links in FulfillmentTab.tsx are OUT OF SCOPE for new-tab behaviour

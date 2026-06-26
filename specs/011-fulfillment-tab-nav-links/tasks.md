# Tasks: Fulfillment Tab Navigation Links — Proposals & Customer Quotes

**Input**: Design documents from `specs/011-fulfillment-tab-nav-links/`

**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story. Both stories touch the same file (`FulfillmentTab.tsx`) so they run sequentially. No parallel opportunities within stories, but the implementation is minimal (two variable edits).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

## Path Conventions

- **Next.js App Router**: `app/` (page routes), `components/` (React components), `lib/` (services/utilities)

---

## Phase 1: Setup

**Purpose**: Verify the current state of the target file before making changes.

- [X] T001 Read `app/orders/[id]/components/FulfillmentTab.tsx` lines 113–130 and confirm `canLinkProposals = isSuperAdmin` and `canLinkQuotes = isSuperAdmin` are the current values (all imports — `Link`, `useUserSession`, `usePermissions` — already present)

---

## Phase 2: Foundational

**No foundational tasks required.** All prerequisites already exist in the target file:
- `Link` is already imported from `next/link`
- `useUserSession` and `usePermissions` hooks already imported and called
- `accountType` variable already derived from `selectedAccount?.Account_Record_Type__c`

---

## Phase 3: User Story 1 — Proposals Link for Customer/NSO/Hybrid (Priority: P1) 🎯 MVP

**Goal**: Expand `canLinkProposals` so that Customer, NSO, and Hybrid account types (in addition to Super Admin) see clickable Proposal Number links in the Proposals sub-tab of the Fulfillment tab.

**Independent Test**: Open an order as a Customer/NSO/Hybrid user → Fulfillment tab → Proposals sub-tab. Verify Proposal Number cells are clickable links navigating to `/proposals/{Id}`.

### Implementation for User Story 1

- [X] T002 [US1] In `app/orders/[id]/components/FulfillmentTab.tsx` line 125, change `const canLinkProposals = isSuperAdmin;` to `const canLinkProposals = isSuperAdmin || accountType === 'Customer' || accountType === 'NSO' || accountType === 'Hybrid';`

**Checkpoint**: After T002, a Customer/NSO/Hybrid user should see Proposal Number links in the Fulfillment → Proposals sub-tab. Super Admin behaviour is unchanged.

---

## Phase 4: User Story 2 — Customer Quotes Link for Customer/NSO/Hybrid (Priority: P2)

**Goal**: Expand `canLinkQuotes` so that Customer, NSO, and Hybrid account types (in addition to Super Admin) see clickable Customer Quote name links in the Customer Quotes sub-tab of the Fulfillment tab.

**Independent Test**: Open an order as a Customer/NSO/Hybrid user → Fulfillment tab → Customer Quotes sub-tab. Verify Customer Quote name cells are clickable links navigating to `/quotes/{Id}`.

### Implementation for User Story 2

- [X] T003 [US2] In `app/orders/[id]/components/FulfillmentTab.tsx` line 126, change `const canLinkQuotes = isSuperAdmin;` to `const canLinkQuotes = isSuperAdmin || accountType === 'Customer' || accountType === 'NSO' || accountType === 'Hybrid';`

**Checkpoint**: After T003, a Customer/NSO/Hybrid user should see Customer Quote name links in the Fulfillment → Customer Quotes sub-tab. Super Admin behaviour is unchanged.

---

## Phase 5: Polish & Validation

**Purpose**: Verify correctness and run manual browser scenarios.

- [X] T004 Run `npm run build` from the project root to confirm zero TypeScript errors after the two variable changes in `app/orders/[id]/components/FulfillmentTab.tsx`
- [ ] T005 Validate quickstart.md Scenarios 1–3 (Proposals link: Customer, NSO, Hybrid accounts) using `npm run dev`
- [ ] T006 Validate quickstart.md Scenarios 4–6 (Customer Quotes link: Customer, NSO, Hybrid accounts)
- [ ] T007 Validate quickstart.md Scenario 7 (Super Admin still sees both links — regression)
- [ ] T008 Validate quickstart.md Scenario 8 (Partner/Manufacturer accounts see no links — deny-by-default)
- [ ] T009 Validate quickstart.md Scenarios 9–10 (missing Id edge case + Shipments/Invoices unchanged)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: N/A — skipped; no new infrastructure needed
- **US1 (Phase 3)**: Depends on Phase 1 read — sequential with US2 (same file)
- **US2 (Phase 4)**: Depends on Phase 3 completion (same file)
- **Polish (Phase 5)**: Depends on US1 + US2 completion

### Within Each User Story

T002 and T003 are edits to adjacent lines in the same file. They MUST run sequentially (not parallel) to avoid file-write conflicts.

### Parallel Opportunities

None within implementation — single-file changes. T005–T009 (manual browser validation) can be done in any order independently.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001: Read and verify current state
2. Complete T002: Expand `canLinkProposals`
3. Complete T004: Build check
4. Complete T005: Validate Proposals link as Customer/NSO/Hybrid
5. **STOP and VALIDATE** — US1 delivers immediate value; deploy or demo if approved

### Incremental Delivery

1. T001 → T002 → T004 → T005 → US1 done (Proposals links for all permitted users)
2. T003 → T004 → T006 → US2 done (Customer Quotes links for all permitted users)
3. T007 → T009 → regression confirmed

---

## Notes

- Both changes are in `app/orders/[id]/components/FulfillmentTab.tsx` at lines 125–126 only
- No new imports, API calls, database changes, or service files needed
- `NSO` must be the raw string (not the mapped category `'Customer'`) — confirmed in research.md
- The Shipments/Invoices `canLink*` variables (lines 127–128) MUST NOT be changed by this feature
- T005–T009 require manual browser validation with appropriate test accounts

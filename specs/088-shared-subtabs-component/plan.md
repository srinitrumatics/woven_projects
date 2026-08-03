# Implementation Plan: Shared Underline SubTabs Component

**Branch**: `wovn_mathu` (no dedicated feature branch — no `before_specify`/`before_plan` git hook configured, consistent with `079`–`087`) | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/088-shared-subtabs-component/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build `components/ui/SubTabs.tsx`, a new sibling to the existing pill-style `components/ui/Tabs.tsx`, mirroring its exact `TabItem`/`tabs`/`activeKey`/`onChange` prop shape but rendering the underline visual style (`border-b-2 border-primary text-primary` active / `border-transparent` inactive). Migrate 18 hand-rolled nested sub-tab bars across Orders, Proposals (order- and line-level), Purchase Orders (order- and line-level), Quotes (order- and line-level), Supplier Bills, and Invoices onto it — fixing 2 confirmed real bugs along the way (an invalid `dark:hover:white` class in `QuoteLineReturnsTab.tsx`, and zero dark-mode support on 3 files: `POReturnsTab.tsx` ×2, `SupplierBillPaymentsTab.tsx`). Separately, replace 3 sites that hand-roll a drifting duplicate of the existing `Tabs.tsx` (Order Detail's view-mode tabs, Quote Line Detail's top tabs, PO Line Detail's "Related Items" tabs) with a direct import of it.

A fresh re-investigation (via a dedicated Explore sub-agent) corrected the original audit's own claim of "six modules" — a naive grep for the literal substring `border-b-2 border-primary` matched only loading-spinner markup (`animate-spin ... border-b-2 border-primary`), since real sub-tab bars put `border-b-2` in a static class string and `border-primary` inside a separate ternary branch. The real pattern search (co-occurrence of `border-transparent` and `border-b-2`) found 18 genuine instances — three times the audit's estimate — plus confirmed the 3 pill-tab-duplicate sites with exact line numbers and exact className drift for each.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: None new — built from the same Tailwind/React primitives already used by `components/ui/Tabs.tsx`

**Storage**: N/A — presentational/component-architecture only; no schema, query, or data-fetching changes

**Testing**: Manual/visual QA per `quickstart.md`, consistent with `077`–`087` (no automated UI test suite exists) — this feature is pure visual/markup consolidation with no new interaction model (unlike `087`'s Modal work, there's no focus-trap/ARIA behavior to verify), so verification is primarily side-by-side visual comparison across all migrated sites plus a `tsc --noEmit` pass

**Target Platform**: Web (desktop + responsive), light and dark mode

**Project Type**: Web application (Next.js App Router, single project)

**Performance Goals**: N/A — no new dependency, no new network calls; a small presentational component replacing existing inline markup

**Constraints**:
- FR-003/FR-009: migrating a sub-tab bar or pill-tab site to the shared component MUST NOT change any existing tab-switching behavior or content — every migration is a pure shell swap.
- FR-007: the 11 `QuoteLine*` files confirmed to be content-panels-only (no nav-bar UI) MUST NOT be touched.
- FR-008: loading-spinner markup containing the literal substring `border-b-2 border-primary` MUST NOT be touched — it is not a tab bar.
- Some of the 18 in-scope files already compute their button set from a local array (e.g. `QuoteLineReturnsTab.tsx`'s existing `tabs.map(...)`) while others hardcode each `<button>` individually (e.g. `FulfillmentTab.tsx`'s 5 separate buttons, `OrderClientPage.tsx`'s 6 separate buttons) — migrating the latter requires first collecting their buttons into a `tabs` array before handing it to the shared component; this is a mechanical restructuring, not a behavior change (research.md documents which files are which).
- Several files compute a tab's visible label with an inline conditional count suffix (e.g. `` `Proposals ${proposals.length > 0 ? `(${proposals.length})` : ''}` ``) — the shared components (`Tabs.tsx` already, `SubTabs.tsx` to match) render this via a dedicated `count` field, so migration must convert each inline count expression into a `count` value on that tab's `TabItem` rather than baking it into the label string.

**Scale/Scope**: 1 new shared component (`components/ui/SubTabs.tsx`), 0 new dependencies, 18 sub-tab-bar files migrated, 3 pill-tab-duplicate sites fixed to import the existing `Tabs.tsx`. No sibling-folder propagation in this feature's scope (separate, user-gated step per established convention).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth**: PASS (not applicable). No data-layer changes; every page's existing fetch/filter/count logic is preserved as-is.
- **II. RBAC-First Feature Design**: PASS (not applicable). No new capability, route, or permission surface — purely a shared UI shell. (One in-scope file, `app/quotes/[id]/lines/[lineid]/page.tsx`, already contains role-based tab-filtering logic for Customer/NSO accounts — this logic is preserved unchanged; it produces the filtered `tabs` array that gets handed to the shared component, same as today.)
- **III. Next.js 15 App Router Patterns**: PASS. No route, `params`, or auth-system changes.
- **IV. Multi-Tenant Isolation**: PASS (not applicable). No data scoping involved.
- **V. Simplicity & Phase-Driven Scope**: PASS, no exceptions. Unlike `087` (which added `@radix-ui/react-dialog`), this feature introduces zero new dependencies — the shared component is built from the exact same primitives (`className` ternaries, Tailwind tokens) already used by the sibling `Tabs.tsx`. It is a net reduction in bespoke code: 18 hand-rolled implementations collapse into 1, and 3 duplicate reimplementations of an existing component are deleted in favor of the real import.

No violations. Complexity Tracking table is empty — nothing to justify.

## Project Structure

### Documentation (this feature)

```text
specs/088-shared-subtabs-component/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — this feature's only "contract" is the new `SubTabs` component's prop interface, fully captured in `data-model.md`.

### Source Code (repository root)

Existing Next.js App Router web application (`app/`, `components/`) per `CLAUDE.md`.

```text
components/ui/
└── SubTabs.tsx                                                                      # NEW — underline-style sibling to Tabs.tsx, same TabItem/tabs/activeKey/onChange shape

app/
├── orders/[id]/components/FulfillmentTab.tsx                                        # migrate (5 hardcoded buttons -> tabs array)
├── orders/[id]/components/ReturnsTab.tsx                                            # migrate
├── proposals/[id]/components/FulfillmentsTab.tsx                                    # migrate
├── proposals/[id]/components/PurchasesTab.tsx                                       # migrate
├── proposals/[id]/components/ReturnsTab.tsx                                         # migrate
├── proposals/[id]/lines/[lineid]/components/LineFulfillmentsTab.tsx                 # migrate
├── proposals/[id]/lines/[lineid]/components/LinePurchasesTab.tsx                    # migrate
├── proposals/[id]/lines/[lineid]/components/LineReturnsTab.tsx                      # migrate
├── purchase-orders/[id]/components/POReturnsTab.tsx                                 # migrate + gains dark-mode support
├── purchase-orders/[id]/lines/[lineid]/components/POReturnsTab.tsx                  # migrate + gains dark-mode support
├── quotes/[id]/components/QuoteFulfillmentTab.tsx                                   # migrate
├── quotes/[id]/components/QuotePurchasesTab.tsx                                     # migrate
├── quotes/[id]/components/QuoteReturnsTab.tsx                                       # migrate
├── quotes/[id]/lines/[lineid]/components/QuoteLineFulfillmentsTab.tsx               # migrate (already tabs-array-driven)
├── quotes/[id]/lines/[lineid]/components/QuoteLinePurchasesTab.tsx                  # migrate (already tabs-array-driven)
├── quotes/[id]/lines/[lineid]/components/QuoteLineReturnsTab.tsx                    # migrate (already tabs-array-driven) + fixes dark:hover:white typo
├── supplier-bills/[id]/components/SupplierBillPaymentsTab.tsx                       # migrate + gains dark-mode support
├── invoices/[id]/components/InvoicePayments.tsx                                     # migrate
├── orders/[id]/OrderClientPage.tsx                                                  # fix: replace 6 hardcoded pill buttons with <Tabs> import (~line 1791-1846)
├── quotes/[id]/lines/[lineid]/page.tsx                                              # fix: replace hand-rolled pill tabs with <Tabs> import (~line 660-685, already tabs-array-driven)
└── purchase-orders/[id]/lines/[lineid]/page.tsx                                     # fix: replace hand-rolled pill tabs with <Tabs> import (~line 648-665)
```

**Structure Decision**: Single Next.js project. 1 new shared component, 0 new dependencies, 18 existing sub-tab-bar files each get a targeted shell replacement (not a rewrite of their content/logic), 3 files get their duplicate pill-tab markup replaced by an existing import.

## Complexity Tracking

*No violations — table intentionally empty.*

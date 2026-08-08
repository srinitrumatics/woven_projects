# Implementation Plan: Fix Unwanted Scrollbar in Sub-Tab Headers on Small Screens

**Branch**: `117-subtab-header-scrollbar` | **Date**: 2026-08-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/117-subtab-header-scrollbar/spec.md`

## Summary

On narrow viewports, the shared sub-tab header row (`components/ui/SubTabs.tsx`) sometimes shows a stray vertical scrollbar that makes the row look like it split into two lines. Root cause (confirmed in `research.md`): the row sets `overflow-x-auto` but leaves `overflow-y` at its default, which the CSS spec computes as an implicit `overflow-y: auto` — a classic (non-overlay) horizontal scrollbar can then nudge the content past the row's own height and trip that implicit vertical auto-scroll. The fix is a one-line CSS change — pin `overflow-y-hidden` alongside the existing `overflow-x-auto` on the row container — applied once in the shared component so every one of its 17+ consuming pages (proposals, orders, quotes, purchase orders, invoices, supplier bills, and their line-detail sub-pages) is corrected simultaneously.

## Technical Context

**Language/Version**: TypeScript, Next.js 15 (App Router), React (client component)

**Primary Dependencies**: Tailwind CSS (utility classes only — no new dependency)

**Storage**: N/A — no data model change (see `data-model.md`)

**Testing**: Manual/visual verification per `quickstart.md` (no existing automated test suite covers `components/ui/*`; consistent with Constitution Principle V — no new test infrastructure introduced for a one-line CSS fix)

**Target Platform**: Web (all supported desktop and mobile browsers/screen sizes), light and dark mode

**Project Type**: Web application (Next.js App Router) — single shared UI component change

**Performance Goals**: N/A — purely visual/layout fix, no runtime performance implications

**Constraints**: Must not change tab click behavior, tab order, or the set of tabs shown (see spec Assumptions); must preserve horizontal-scroll affordance (FR-002) while eliminating the vertical scrollbar (FR-003)

**Scale/Scope**: One shared component (`components/ui/SubTabs.tsx`); no changes needed in any of its 17+ consuming page files, since they all import the shared component rather than duplicating its markup

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth** — N/A. No data reads/writes involved; this is a presentational CSS fix.
- **II. RBAC-First Feature Design** — N/A. No new functionality is exposed; existing permission gating around the pages that render `SubTabs` is untouched.
- **III. Next.js 15 App Router Patterns** — No route or param handling is touched. `SubTabs.tsx` remains a `"use client"` component; no changes to its structure or exports.
- **IV. Multi-Tenant Isolation** — N/A. No data queries involved.
- **V. Simplicity & Phase-Driven Scope** — **Satisfied by design**: the fix is the smallest change that addresses the confirmed root cause (one Tailwind class added to one shared component), with no new abstractions, no new test infrastructure, and no scope creep into the separately-styled primary tab bar (`components/ui/Tabs.tsx`), which was not reported or observed as broken (see `research.md`).

**Result**: PASS — no violations, no complexity to track.

## Project Structure

### Documentation (this feature)

```text
specs/117-subtab-header-scrollbar/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command) — N/A, documented
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory is generated for this feature: it changes no API route, no external interface, and no props/contract of the affected component (`SubTabs.tsx`'s `SubTabsProps` is unchanged) — only its internal Tailwind class list.

### Source Code (repository root)

```text
components/
└── ui/
    ├── SubTabs.tsx       # MODIFIED — add overflow-y-hidden to the row container (line 14)
    └── Tabs.tsx          # UNCHANGED — separate primary tab bar; same latent pattern noted in
                           #             research.md but out of scope (not reported/observed as broken)

app/
├── invoices/[id]/components/InvoicePayments.tsx                              # consumer, unchanged
├── orders/[id]/components/ReturnsTab.tsx                                     # consumer, unchanged
├── orders/[id]/components/FulfillmentTab.tsx                                 # consumer, unchanged
├── proposals/[id]/components/FulfillmentsTab.tsx                             # consumer, unchanged
├── proposals/[id]/components/ReturnsTab.tsx                                  # consumer, unchanged
├── proposals/[id]/components/PurchasesTab.tsx                                # consumer, unchanged
├── proposals/[id]/lines/[lineid]/components/LineFulfillmentsTab.tsx          # consumer, unchanged
├── proposals/[id]/lines/[lineid]/components/LinePurchasesTab.tsx             # consumer, unchanged
├── proposals/[id]/lines/[lineid]/components/LineReturnsTab.tsx               # consumer, unchanged
├── purchase-orders/[id]/components/POReturnsTab.tsx                         # consumer, unchanged
├── purchase-orders/[id]/lines/[lineid]/components/POReturnsTab.tsx          # consumer, unchanged
├── quotes/[id]/components/QuoteFulfillmentTab.tsx                            # consumer, unchanged
├── quotes/[id]/components/QuotePurchasesTab.tsx                              # consumer, unchanged
├── quotes/[id]/components/QuoteReturnsTab.tsx                                # consumer, unchanged
├── quotes/[id]/lines/[lineid]/components/QuoteLineFulfillmentsTab.tsx        # consumer, unchanged
├── quotes/[id]/lines/[lineid]/components/QuoteLineReturnsTab.tsx             # consumer, unchanged
├── quotes/[id]/lines/[lineid]/components/QuoteLinePurchasesTab.tsx           # consumer, unchanged
└── supplier-bills/[id]/components/SupplierBillPaymentsTab.tsx                # consumer, unchanged
```

**Structure Decision**: Single shared UI component (`components/ui/SubTabs.tsx`) is modified in place. All 17+ consuming pages import this component rather than duplicating its markup, so the fix propagates to every affected page (spec FR-005) without touching any consumer file. This matches the project's existing "shared component" convention (per `CLAUDE.md`'s Design System section and prior features like `088-shared-subtabs-component`).

## Complexity Tracking

*No Constitution Check violations — table intentionally omitted.*

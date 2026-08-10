# Implementation Plan: Scrollable Tab Header Rows on Order Details Page

**Branch**: `wovn_mathu` | **Date**: 2026-08-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/122-order-tabs-scroll/spec.md`

## Summary

The order details page's top-level section tab row (Add Products/My Order/Taxes/Fulfillment/Returns/Files) shares a flex row with a search box (`app/orders/[id]/OrderClientPage.tsx:1768-1811`). The shared `Tabs` component (`components/ui/Tabs.tsx:19`) already implements `overflow-x-auto` internally, but the order page's call site (`OrderClientPage.tsx:1810`) passes `flex-shrink-0`, which prevents the browser from ever shrinking that flex child below its natural content width — so at viewport widths where the search box (`lg:min-w-[300px]` floor) plus all six tab buttons don't jointly fit, the Tabs div simply overflows the row and gets visually clipped by the ancestor's `overflow-hidden` (line 1767) instead of scrolling internally. It also uniquely passes `no-scrollbar` (defined in `app/globals.css:98-109`), which hides any scroll affordance even once scrolling is possible — no other `<Tabs>` consumer in the codebase does this. The fix is a three-token className change at the single call site: drop `flex-shrink-0` and `no-scrollbar`, add `min-w-0` (to defeat the browser's implicit `min-width: auto` floor on flex items, which otherwise blocks shrinking even without `flex-shrink-0`). The sub-tab row inside Fulfillment (`components/ui/SubTabs.tsx:14`) already scrolls correctly and needs no change.

## Technical Context

**Language/Version**: TypeScript, Next.js 15 (React client component)

**Primary Dependencies**: None new — Tailwind CSS utility class change only, reusing `Tabs`' existing `overflow-x-auto`

**Storage**: N/A

**Testing**: Manual/visual verification per `quickstart.md` (no existing automated test suite covers responsive tab-row layout, consistent with Constitution Principle V)

**Target Platform**: Web, specifically the `lg` breakpoint (≥1024px, Tailwind default) and up, where the row is `flex-row` and the search box and tabs compete for horizontal space (below `lg` the row is `flex-col` and each item already gets its own full-width row, which already works)

**Project Type**: Web application (Next.js App Router) — single call-site className change

**Performance Goals**: N/A — no rendering logic change, purely a spacing/overflow className

**Constraints**: Must not change the search box's size/behavior (spec FR-004); must not alter the row's appearance when everything already fits (spec FR-003); must not touch `components/ui/Tabs.tsx`, `components/ui/SubTabs.tsx`, or `FulfillmentTab.tsx`, since all three already work correctly for every other consumer

**Scale/Scope**: 1 file, 1 className string (`app/orders/[id]/OrderClientPage.tsx:1810`). No changes to shared components, no other pages affected (confirmed via repo-wide search: no other `<Tabs>` consumer passes `flex-shrink-0` or `no-scrollbar`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth** — N/A. Purely a CSS layout/overflow fix; no data reads/writes involved.
- **II. RBAC-First Feature Design** — N/A. No new functionality exposed; existing permission gating around the order page is untouched.
- **III. Next.js 15 App Router Patterns** — No route or param handling touched. `OrderClientPage` remains the same client component with the same props/state — only one className string changes.
- **IV. Multi-Tenant Isolation** — N/A. No data queries or org-scoping logic involved.
- **V. Simplicity & Phase-Driven Scope** — **Satisfied by design**: the fix is the smallest possible change (one className edit at the one call site that diverges from every other correctly-working `<Tabs>` usage) — no new component, no new prop, no change to the shared `Tabs`/`SubTabs` components that already implement the correct pattern for every other page.

**Result**: PASS — no violations, no complexity to track.

## Project Structure

### Documentation (this feature)

```text
specs/122-order-tabs-scroll/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output — N/A, documented
├── quickstart.md        # Phase 1 output
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify command)
└── tasks.md             # Phase 2 output (/speckit-tasks command — NOT created by /speckit-plan)
```

No `contracts/` directory: this feature changes no API route, no external interface, and no component prop/contract — only an existing Tailwind className string on one already-rendered `<Tabs>` element.

### Source Code (repository root)

```text
app/orders/[id]/
└── OrderClientPage.tsx    # MODIFY: line 1810 — className on the top-level <Tabs> call site
                           #         from "no-scrollbar pb-0.5 flex-shrink-0 lg:w-auto"
                           #         to    "pb-0.5 min-w-0 lg:w-auto"
                           #         (drops flex-shrink-0 and no-scrollbar, adds min-w-0)
```

**Structure Decision**: No new files, no new components, no changes to `components/ui/Tabs.tsx` or `components/ui/SubTabs.tsx` — both already implement the correct scroll-on-overflow pattern used by every other page's tab row. This is a single className edit at the one call site that diverges from that pattern.

## Complexity Tracking

*No Constitution Check violations — table intentionally omitted.*

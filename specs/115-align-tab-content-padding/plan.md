# Implementation Plan: Align Tab Content Padding to p-6

**Branch**: `wovn_mathu` | **Date**: 2026-08-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/115-align-tab-content-padding/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

There is no shared `TabContent`/`TabPanel` component in this codebase — `components/ui/Tabs.tsx` and `components/ui/SubTabs.tsx` render only the tab-button row. Every object detail page, line-item detail page, and a handful of list pages hand-roll their own wrapper `<div>`(s) around the tab bar and/or the content shown below it, and the padding on those wrappers is inconsistent: `p-2` (Proposals/Shipments detail content), `p-3` (tab-bar wrappers on Quotes/Purchase Orders/Supplier Bills/Products, and Orders' content div), and `p-4` (Invoices' tab-bar wrapper, all line-detail cards, both admin pages, and Inventory/Shipments list pages). The fix is a direct, per-file Tailwind class edit — replacing the padding token on each identified wrapper `<div>` with `p-6` — with no new component and no behavior change. Because there is no shared component to fix once, this plan enumerates every file/line found by research and treats each as its own task.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Next.js 15 (App Router)

**Primary Dependencies**: Tailwind CSS utility classes only. No new dependencies. `components/ui/Tabs.tsx` and `components/ui/SubTabs.tsx` are read but not modified (they don't own the padding being changed).

**Storage**: N/A — no data, query, or Salesforce field is touched.

**Testing**: Manual visual verification per `quickstart.md` (no automated visual-regression suite exists in this repo); `npx tsc --noEmit` as a static sanity check (className string edits cannot break types, but this confirms no stray syntax errors from the edits).

**Target Platform**: Web (existing Next.js 15 client-rendered pages), all breakpoints already supported by these pages, including the app's smallest supported width where table/tab overflow is already handled by existing `overflow-x-auto` wrappers.

**Project Type**: Web application (single Next.js project).

**Performance Goals**: N/A — Tailwind class changes carry no runtime cost.

**Constraints**: Must not change tab behavior, tab content, data, or component structure — only the padding value on already-identified wrapper `<div>`s. Must not touch the admin portal's separate auth/layout system beyond the two specific padding classes identified (per constitution Principle III, the two auth systems must remain isolated — this feature does not touch auth code, only shared visual spacing on admin list pages already in scope per the spec).

**Scale/Scope**: 20 files identified by research (see `research.md` for the full enumerated list): 8 object detail pages (16 wrapper divs: bar + content each), 5 line-item detail pages (6 wrapper divs, one page has a nested inner content div too), 1 shipments line-detail sub-component (2 wrapper divs), 2 admin list pages, 2 additional list pages surfaced by the broader grep (Inventory, Shipments list — each with 1-2 wrapper divs). Total individual class edits: ~27.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth** — N/A. No data fetching or service-layer code is touched; this only changes the Tailwind padding class on existing wrapper elements.
- **II. RBAC-First Feature Design** — N/A. No new functionality is exposed; existing permission gates on every affected page are untouched.
- **III. Next.js 15 App Router Patterns** — Pass. No new routes; existing `page.tsx`/component files are edited in place. The admin portal's two affected files (`app/admin/authorize-locations/page.tsx`, `app/admin/authorize-locations/[id]/delivery-windows/page.tsx`) only get a padding-class edit — the isolation between main-portal auth and admin-portal auth is not touched.
- **IV. Multi-Tenant Isolation** — N/A. No query scoping changes; the same already-rendered per-org data is displayed, only its surrounding whitespace changes.
- **V. Simplicity & Phase-Driven Scope** — Pass. No new shared `TabContent` abstraction is introduced even though one would reduce future duplication — the spec's scope is a direct visual-consistency fix across existing files, and building a new shared component now would exceed what was asked and add a refactor risk this feature doesn't need. (Noted as a legitimate future idea, not part of this feature — see research.md Alternatives.)

**Result**: No violations. No entries required in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/115-align-tab-content-padding/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `data-model.md` or `contracts/` are generated — this feature introduces no entities, persisted fields, or interface contracts (a pure Tailwind class edit across existing files).

### Source Code (repository root)

```text
app/
├── quotes/[id]/page.tsx                                    # MODIFY: bar p-3→p-6, content p-4→p-6
├── purchase-orders/[id]/page.tsx                           # MODIFY: bar p-3→p-6, content p-4→p-6
├── supplier-bills/[id]/page.tsx                            # MODIFY: bar p-3→p-6, content p-4→p-6
├── invoices/[id]/page.tsx                                  # MODIFY: bar p-3→p-6, content p-4→p-6
├── products/[id]/page.tsx                                  # MODIFY: bar p-3→p-6, content p-4→p-6
├── orders/[id]/OrderClientPage.tsx                         # MODIFY: content p-3→p-6 (verify no separate bar div during edit)
├── proposals/[id]/page.tsx                                 # MODIFY: bar p-4→p-6, content p-2→p-6 (the page from the screenshot)
├── shipments/[id]/page.tsx                                 # MODIFY: bar p-4→p-6, content p-2→p-6
├── proposals/[id]/lines/[lineid]/page.tsx                  # MODIFY: combined card p-4→p-6
├── quotes/[id]/lines/[lineid]/page.tsx                     # MODIFY: combined card p-4→p-6
├── purchase-orders/[id]/lines/[lineid]/page.tsx            # MODIFY: combined card p-4→p-6 (leave nested py-2 div untouched — different element, see research.md)
├── supplier-bills/[id]/lines/[lineid]/page.tsx             # MODIFY: outer card p-4→p-6, inner content p-4→p-6
├── invoices/[id]/lines/[lineid]/page.tsx                   # MODIFY: combined card p-4→p-6
├── shipments/[id]/lines/[lineid]/components/BottomTabs.tsx # MODIFY: bar p-3→p-6, content p-4→p-6
├── admin/authorize-locations/page.tsx                      # MODIFY: single card p-4→p-6
├── admin/authorize-locations/[id]/delivery-windows/page.tsx # MODIFY: single card p-4→p-6
├── inventory/page.tsx                                      # MODIFY: single card p-4→p-6
└── shipments/page.tsx                                      # MODIFY: bar p-4→p-6, content "p-4 pb-0"→"p-6 pb-0" (keep pb-0 override)

app/proposals/[id]/lines/[lineid]/components/
├── LineTaxesTab.tsx           # VERIFY ONLY — loading branch already p-6; loaded branch has no padding (inherits from parent card), no edit needed
└── LineFulfillmentsTab.tsx    # VERIFY ONLY — same as above

components/ui/
├── Tabs.tsx      # UNCHANGED — does not own padding being changed
└── SubTabs.tsx   # UNCHANGED — does not own padding being changed
```

**Structure Decision**: Single Next.js project, no new files or shared components. Every change is a targeted Tailwind class edit on an existing wrapper `<div>` in an existing file, per the Simplicity principle and because there is no single shared component whose fix would cascade — the duplication is the reason this plan enumerates ~27 individual edits across 18 files instead of one component change.

## Complexity Tracking

*No violations — table not needed.*

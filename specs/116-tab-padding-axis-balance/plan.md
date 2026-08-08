# Implementation Plan: Rebalance Tab Content Padding (More Horizontal, Less Vertical)

**Branch**: `wovn_mathu` | **Date**: 2026-08-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/116-tab-padding-axis-balance/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Feature 115 normalized every tab-bar and tab-content wrapper `<div>` across the web app to a uniform `p-6` (24px on all four sides). This feature re-balances that same, already-uniform set of wrappers: horizontal padding (`px`) stays at or grows beyond the current 24px, while vertical padding (`py`) shrinks, so every affected page reads as spacious side-to-side and compact top-to-bottom instead of evenly padded. A verification pass confirmed all 18 files from 115 still carry exactly `p-6` (untouched since that feature shipped), so this plan reuses that enumeration directly instead of re-discovering it. The concrete target is `px-6 py-3` (keep the current 24px horizontal, halve the vertical to 12px) — chosen as the simplest change that satisfies both FR-002 (horizontal ≥ current) and FR-003 (vertical visibly smaller) without introducing a new magnitude judgment call beyond the direction the request already specified.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Next.js 15 (App Router)

**Primary Dependencies**: Tailwind CSS utility classes only. No new dependencies. `components/ui/Tabs.tsx` and `components/ui/SubTabs.tsx` are unchanged (they don't own the padding being adjusted, per feature 115's research).

**Storage**: N/A — no data, query, or Salesforce field is touched.

**Testing**: Manual visual verification per `quickstart.md` (no automated visual-regression suite exists in this repo); `npx tsc --noEmit` as a static sanity check.

**Target Platform**: Web (existing Next.js 15 client-rendered pages), all breakpoints already supported by these pages.

**Project Type**: Web application (single Next.js project).

**Performance Goals**: N/A — Tailwind class changes carry no runtime cost.

**Constraints**: Must not change tab behavior, tab content, table column widths, or component structure — only the `p-6` → `px-6 py-3` token swap on the exact wrapper `<div>`s enumerated in feature 115's `research.md`. Must preserve the one pre-existing asymmetric override found in that set (`app/shipments/page.tsx`'s content div uses `p-6 pb-0` to sit flush against its table) by translating it to `px-6 py-3 pb-0`, keeping the flush-bottom intent.

**Scale/Scope**: Same 18 files / ~15 wrapper `<div>`s as feature 115 (the `py-2` inner div in the Purchase Order line page and the two `LineXTab.tsx` loading-state divs remain out of scope for the same reasons documented in that feature's research — see this feature's `research.md` for the re-verified list).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth** — N/A. No data fetching or service-layer code is touched.
- **II. RBAC-First Feature Design** — N/A. No new functionality is exposed; existing permission gates are untouched.
- **III. Next.js 15 App Router Patterns** — Pass. No new routes; existing files are edited in place, including the two admin-portal files (padding-class edit only, no auth-system change).
- **IV. Multi-Tenant Isolation** — N/A. No query scoping changes.
- **V. Simplicity & Phase-Driven Scope** — Pass. Reuses feature 115's exact file/line enumeration rather than re-discovering scope; no new shared component introduced.

**Result**: No violations. No entries required in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/116-tab-padding-axis-balance/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `data-model.md` or `contracts/` are generated — this feature introduces no entities, persisted fields, or interface contracts.

### Source Code (repository root)

```text
app/
├── proposals/[id]/page.tsx                                 # MODIFY: p-6→px-6 py-3 (bar + content, lines ~1418, ~1440 — the reference screenshot page)
├── quotes/[id]/page.tsx                                    # MODIFY: p-6→px-6 py-3 (bar + content, lines ~714, ~734)
├── purchase-orders/[id]/page.tsx                           # MODIFY: p-6→px-6 py-3 (bar + content, lines ~256, ~271)
├── supplier-bills/[id]/page.tsx                            # MODIFY: p-6→px-6 py-3 (bar + content, lines ~331, ~343)
├── invoices/[id]/page.tsx                                  # MODIFY: p-6→px-6 py-3 (bar + content, lines ~390, ~403)
├── products/[id]/page.tsx                                  # MODIFY: p-6→px-6 py-3 (bar + content, lines ~240, ~248)
├── orders/[id]/OrderClientPage.tsx                         # MODIFY: p-6→px-6 py-3 (content only, line ~1815; no separate bar div, confirmed in 115)
├── shipments/[id]/page.tsx                                 # MODIFY: p-6→px-6 py-3 (bar + content, lines ~187, ~196)
├── proposals/[id]/lines/[lineid]/page.tsx                  # MODIFY: p-6→px-6 py-3 (combined card, line ~797)
├── quotes/[id]/lines/[lineid]/page.tsx                     # MODIFY: p-6→px-6 py-3 (combined card, line ~534)
├── purchase-orders/[id]/lines/[lineid]/page.tsx            # MODIFY: p-6→px-6 py-3 (combined card, line ~651); leave nested py-2 div untouched
├── supplier-bills/[id]/lines/[lineid]/page.tsx             # MODIFY: p-6→px-6 py-3 (outer card line ~370, inner content line ~392)
├── invoices/[id]/lines/[lineid]/page.tsx                   # MODIFY: p-6→px-6 py-3 (combined card, line ~390)
├── shipments/[id]/lines/[lineid]/components/BottomTabs.tsx # MODIFY: p-6→px-6 py-3 (bar + content, lines ~87, ~98)
├── admin/authorize-locations/page.tsx                      # MODIFY: p-6→px-6 py-3 (single card, line ~255)
├── admin/authorize-locations/[id]/delivery-windows/page.tsx # MODIFY: p-6→px-6 py-3 (single card, line ~262 — NOT the outer page wrapper at line ~234, which is untouched, out-of-scope page padding)
├── inventory/page.tsx                                      # MODIFY: p-6→px-6 py-3 (single card, line ~560)
└── shipments/page.tsx                                      # MODIFY: bar p-6→px-6 py-3 (line ~429), content "p-6 pb-0"→"px-6 py-3 pb-0" (line ~457, keep pb-0 override)

app/proposals/[id]/lines/[lineid]/components/
├── LineTaxesTab.tsx           # MODIFY: remove the redundant `p-6` from the loading-state div (line ~32) — it is nested INSIDE the already-padded outer card, so it currently double-pads the spinner (outer p-6 + own p-6) versus the loaded branch's zero own padding; removing it makes loading and loaded states inherit identically from the parent card, correctly satisfying FR-006 (a latent inconsistency inherited from feature 115 that this feature's rebalance makes worth fixing — see research.md)
└── LineFulfillmentsTab.tsx    # MODIFY: same fix as LineTaxesTab.tsx (loading div at line ~136)

components/ui/
├── Tabs.tsx      # UNCHANGED — does not own padding being changed
└── SubTabs.tsx   # UNCHANGED — does not own padding being changed
```

**Structure Decision**: Single Next.js project, no new files or shared components. Every change is a targeted Tailwind class edit reusing feature 115's exact file list, per the Simplicity principle. One correction versus 115: re-reading the actual JSX nesting (not just the two isolated divs) found that `LineTaxesTab.tsx`/`LineFulfillmentsTab.tsx`'s loading-state divs are nested INSIDE the outer card already fixed at `app/proposals/[id]/lines/[lineid]/page.tsx:797`, so their own `p-6` was always additive on top of the outer card's padding — a latent double-padding bug feature 115's research missed (it compared class strings, not actual rendered nesting). This feature removes those two redundant `p-6` classes entirely rather than resizing them, so loading and loaded states inherit identically from the parent card — see `research.md`.

## Complexity Tracking

*No violations — table not needed.*

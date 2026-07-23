# Implementation Plan: Consistent, MOQ-Enforced Quantity Input Boxes

**Branch**: `wovn_mathu` | **Date**: 2026-07-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/059-qty-input-consistency/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Unify the visual style and MOQ-enforcement behavior of the three quantity input boxes in the
portal — `app/orders/[id]/components/MyOrderTable.tsx`, `app/orders/[id]/components/ProductCatalog.tsx`,
and `app/configure/ConfigureOrderClientPage.tsx` — onto one canonical `className`, one canonical
default-to-MOQ/floor-at-MOQ-on-blur behavior, and one canonical digit-only `type="text"` input
pattern. The first two already share nearly the same style and already default new lines to MOQ;
they only need floor-on-blur added and their `className`s merged to a single canonical string. The
Configure Order page's input requires more: its quantity currently means "count of MOQ-sized
cases" (`type="number"`, defaults to 1, floors at 1, steps by 1), which per the resolved
clarification must be redefined to mean the same "actual order units" as the other two boxes
(defaults to MOQ, floors at MOQ, steps by MOQ, `type="text"` with the same digit-only regex). That
redefinition requires three follow-on corrections on that page alone: its total-price formulas
(currently multiply by MOQ an extra, now-wrong time), its "Total Qty" column (becomes an exact
duplicate of the redefined quantity and must be removed), and its own independent order-creation
submission to Salesforce (`handleCreateOrder`, which currently sends raw units as `Order_Qty__c`
with no `MOQ__c` at all — must instead send `units ÷ MOQ` plus `MOQ__c`, matching the convention
already established for the Order Detail page's submission flow in feature 057). No new API
routes, Salesforce schema changes, or shared components — all changes are client-side edits to
these three existing files.

## Technical Context

**Language/Version**: TypeScript 5 / React 18 (Next.js 15 App Router, client components — all three files are `"use client"`)

**Primary Dependencies**: Next.js 15, React, Tailwind CSS — no new dependencies required

**Storage**: N/A for style/behavior changes. The Configure Order page's quantity redefinition affects what's written to its `gth-configured-draft` localStorage draft (existing generic JSON round-trip, no code change needed there) and to Salesforce via its existing `/api/salesforce/orders` POST/PATCH calls (payload field values change, not the API contract itself)

**Testing**: No automated component/unit test runner exists in this repo; verification is manual via `npm run dev` and exercising all three surfaces in a browser per `quickstart.md`

**Target Platform**: Web browser (desktop-first, existing responsive Tailwind layout), served by the Next.js app

**Project Type**: Web application (single Next.js project — no frontend/backend split; this feature touches three existing files)

**Performance Goals**: Quantity edits must update the line, extended price, and order totals within a single React render (no perceptible lag), consistent with existing behavior on all three surfaces

**Constraints**: Must not change the `/api/salesforce/orders` route or its Apex REST contract — only the JSON body's field values, computed client-side before the existing `fetch(...)` calls already present in each surface's submission code; must not regress the already-correct "MOQ default + step" behavior already shipped on the Order Detail page's two tabs; must not reintroduce the case-count model anywhere once the Configure Order page is converted

**Scale/Scope**: Three existing files, no new routes, services, DB tables, or Salesforce schema changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|-----------|-------|--------|
| I. Salesforce as Single Source of Truth | All reads/writes continue through existing `/api/salesforce/orders` calls in `app/orders/[id]/page.tsx` and `app/configure/ConfigureOrderClientPage.tsx`; this feature only changes which client-computed values are placed into the existing payload fields (`Order_Qty__c`, `MOQ__c`) — no raw queries added, no new SF write paths. | PASS |
| II. RBAC-First Feature Design | Both pages are already behind the main-portal session middleware; no new capability or permission surface is introduced — only correcting/harmonizing an existing, already-reachable input control. | PASS |
| III. Next.js 15 App Router Patterns | No new routes, no dynamic route param handling changes; all three components remain client components under their existing pages. | PASS |
| IV. Multi-Tenant Isolation | No new queries; all fixes operate on data already scoped to the session's `SF_ACCOUNT_ID`/`SF_CONTACT_ID`, unchanged by this feature. | PASS |
| V. Simplicity & Phase-Driven Scope | Fixes are targeted value/formula/style corrections to existing inline JSX and existing helper functions (`resolveMoq`, `safeOrderQty`, `bumpQty`, `commitOrderQty`, `handleCreateOrder`) — no new shared component is introduced (per research.md Decision 1), no speculative generalization beyond what the three touched files need. | PASS |

No violations — Complexity Tracking table is not needed.

**Post-Phase 1 re-check**: `research.md`, `data-model.md`, `contracts/quantity-input-contract.md`, and
`quickstart.md` confirm the design stays within the three existing files, adds no new API
routes/DB tables/permission checks/shared components, and keeps every fix traceable to a specific,
already-identified line range. All five gates above still PASS after design — no re-evaluation
changes are needed.

## Project Structure

### Documentation (this feature)

```text
specs/059-qty-input-consistency/
├── plan.md                              # This file (/speckit-plan command output)
├── research.md                          # Phase 0 output (/speckit-plan command)
├── data-model.md                        # Phase 1 output (/speckit-plan command)
├── quickstart.md                        # Phase 1 output (/speckit-plan command)
├── contracts/
│   └── quantity-input-contract.md       # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md                  # /speckit-specify output
└── tasks.md                             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

This is the existing single Next.js 15 App Router project (no frontend/backend split). This
feature modifies three existing files; no new files, routes, or directories are created.

```text
app/
├── orders/
│   └── [id]/
│       ├── page.tsx                          # unchanged (handlers already support the needed floor logic via existing props)
│       └── components/
│           ├── MyOrderTable.tsx              # MODIFIED — canonical className; add onBlur MOQ-floor
│           └── ProductCatalog.tsx             # MODIFIED — canonical className; add onBlur MOQ-floor
└── configure/
    └── ConfigureOrderClientPage.tsx           # MODIFIED — input type/className/default/step/floor;
                                                #   totals formula; remove Total Qty column;
                                                #   handleCreateOrder's Order_Qty__c/MOQ__c mapping
```

**Structure Decision**: Single-project Next.js App Router structure (per `CLAUDE.md` /
Constitution). All logic for this feature lives inline in the three existing files — no shared
`QtyInput` component is extracted, consistent with the precedent already established by feature 053
(this exact question was raised and rejected there for the same reason: the existing
implementations are simple enough that sharing a component would add more indirection than it
removes) — see `research.md` Decision 1.

## Complexity Tracking

*No violations — this section is not applicable. Constitution Check above passed with no
exceptions required.*

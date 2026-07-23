# Implementation Plan: Order Detail Page — MOQ, Field Mapping & Contact Corrections

**Branch**: `wovn_mathu` | **Date**: 2026-07-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/057-order-detail-moq-corrections/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Correct six related defects on the Order Detail page (`app/orders/[id]/page.tsx` and its
components), all client-side: (1) the order-line payload sent to Salesforce on save/submit/clone
must compute `Order_Qty__c` as `Total Order Qty ÷ MOQ` instead of the raw total, and must always
include `MOQ__c`; (2) reloading a saved order must reverse that conversion (`Total Order Qty =
Order_Qty__c × MOQ__c`) so displayed quantities round-trip correctly; (3) the My Order table's
quantity stepper must match the Add Products (catalog) stepper's step/floor/default behavior
(both already step by MOQ today — this closes the remaining default-quantity gap on first load);
(4) the "Avail" chip must stop hardcoding `999` for reloaded order lines and instead map to the
product's real available-to-sell value; (5) "Brand" must read from the product's real Salesforce
brand field instead of a field name that is never populated; (6) the Ship to Contact section's
duplicate "Select Contact" dropdown + read-only "Contact Name" field must consolidate into one
dropdown; (7) the Recall confirmation must use the page's existing `confirmToast` pattern instead
of `window.confirm`. No new API routes, no Salesforce schema changes, no DB migrations — the
Apex REST endpoint (`/services/apexrest/gtherp/orders`) already forwards whatever `orderLines`
shape the client sends without transformation, so all six fixes are contained to the client
mapping/UI code in `app/orders/[id]/page.tsx` and its `components/` subfolder.

## Technical Context

**Language/Version**: TypeScript 5 / React 18 (Next.js 15 App Router, client component — `"use client"`)

**Primary Dependencies**: Next.js 15, React, Tailwind CSS, existing `useUserSession`/`useToast` hooks — no new dependencies required

**Storage**: N/A for this feature — order line quantity/MOQ/brand/avail live in in-memory `orderProducts` state, sourced from and submitted to Salesforce via the existing `/api/salesforce/orders` route; no PostgreSQL schema change

**Testing**: No automated component/unit test runner exists in this repo (only ad hoc `tsx` scripts for RBAC/product-sync via `test:rbac`/`test:product-sync`); validation is manual, via `npm run dev` and exercising the Order Detail page in a browser per `quickstart.md`

**Target Platform**: Web browser (desktop-first, existing responsive Tailwind layout), served by the Next.js app

**Project Type**: Web application (single Next.js project — no frontend/backend split; this feature touches `app/orders/[id]/page.tsx` and `app/orders/[id]/components/{MyOrderTable,ProductCatalog,ShipToContact}.tsx`)

**Performance Goals**: Quantity/derived-field changes must update the line, extended price, and order totals within a single React render (no perceptible lag), consistent with existing behavior for order lists of the sizes already supported by this page (tens of lines)

**Constraints**: Must not change the `/api/salesforce/orders` route or the `gtherp/orders` Apex REST contract itself — only the JSON body's field values, computed client-side before the existing `fetch(...PATCH...)` calls in `handleSubmitOrder`/`handleClone`; must not regress the already-correct "no availability ceiling on increase" behavior established for the sibling Configure Order page (feature 053); must not change the `ShipToContact` component's phone/email auto-populate behavior, only remove the duplicate name field

**Scale/Scope**: Single page and three of its existing child components; no new routes, services, DB tables, or Salesforce schema changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|-----------|-------|--------|
| I. Salesforce as Single Source of Truth | All reads/writes continue through the existing `/api/salesforce/orders` route → `lib/salesforce-service.ts` / `lib/product-salesforce-service.ts`. This feature changes only which fields of the already-fetched/already-sent JSON are read and computed client-side (Order Qty formula, MOQ/Brand/Avail field-name fallbacks) — no raw queries added to pages, no new SF write paths. | PASS |
| II. RBAC-First Feature Design | Order Detail page is already behind the main-portal session middleware; no new capability or permission surface is introduced — only correcting values within a page the user can already reach and edit. No new `PermissionGate` or server-side permission check required. | PASS |
| III. Next.js 15 App Router Patterns | No new routes; `[id]/page.tsx` already correctly unwraps its dynamic `params` via `use(params)` (unchanged by this feature). No changes to either auth system. | PASS |
| IV. Multi-Tenant Isolation | No new queries; all fixes operate on data already scoped to the session's `SF_ACCOUNT_ID`/`SF_CONTACT_ID`, unchanged by this feature. | PASS |
| V. Simplicity & Phase-Driven Scope | Fixes are small, targeted value/mapping corrections and one UI consolidation (removing a duplicate field), matching existing file/component structure. No new abstractions, no feature flags, no speculative generalization beyond the three touched components. | PASS |

No violations — Complexity Tracking table is not needed.

**Post-Phase 1 re-check**: `research.md`, `data-model.md`, `contracts/order-line-payload.md`, and
`quickstart.md` confirm the design stays within the existing page and three existing components,
adds no new API routes/DB tables/permission checks, and keeps every fix scoped to its own
line/field. All five gates above still PASS after design — no re-evaluation changes are needed.

## Project Structure

### Documentation (this feature)

```text
specs/057-order-detail-moq-corrections/
├── plan.md                          # This file (/speckit-plan command output)
├── research.md                      # Phase 0 output (/speckit-plan command)
├── data-model.md                    # Phase 1 output (/speckit-plan command)
├── quickstart.md                    # Phase 1 output (/speckit-plan command)
├── contracts/
│   └── order-line-payload.md        # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md              # /speckit-specify output
└── tasks.md                         # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

This is the existing single Next.js 15 App Router project (no frontend/backend split). This
feature modifies one page and three of its existing child components; no new files, routes, or
directories are created.

```text
app/
└── orders/
    └── [id]/
        ├── page.tsx                          # MODIFIED — Order Qty ÷ MOQ conversion on
        │                                      #   submit/clone (handleSubmitOrder, handleClone);
        │                                      #   reverse conversion + Avail/Brand field-name
        │                                      #   fallbacks when loading saved order lines
        │                                      #   (fetchOrder's line-mapping block); Recall
        │                                      #   confirmation switched from window.confirm to
        │                                      #   confirmToast
        └── components/
            ├── MyOrderTable.tsx               # MODIFIED — quantity stepper default/parity fix
            ├── ProductCatalog.tsx              # REFERENCE ONLY — existing stepper is the parity
            │                                    #   target for MyOrderTable.tsx; not modified
            │                                    #   unless parity review finds a divergence
            └── ShipToContact.tsx               # MODIFIED — remove duplicate "Contact Name"
                                                 #   field; "Select Contact" dropdown remains
                                                 #   the single control
```

**Structure Decision**: Single-project Next.js App Router structure (per `CLAUDE.md` /
Constitution). All logic for this feature lives in the existing Order Detail page and its
existing component files — no shared component is extracted (see `research.md` Decision 1),
consistent with the precedent already established for the sibling Configure Order MOQ feature
(053).

## Complexity Tracking

*No violations — this section is not applicable. Constitution Check above passed with no
exceptions required.*

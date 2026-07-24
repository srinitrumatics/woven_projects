# Implementation Plan: Order Detail — Draft-Only Editing & Product Information Card Fields

**Branch**: `wovn_mathu` | **Date**: 2026-07-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/061-order-edit-lock-product-card/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Two independent, client-side corrections to the Order Detail (`app/orders/[id]/page.tsx`) and
Order Line Detail (`app/orders/[id]/lines/[lineId]/page.tsx`) pages: (1) editing is currently
possible on both pages regardless of the Customer Order's status — the Edit button on
`OrderHeader.tsx` is hidden only for "Approved", and on `LineHeader.tsx` only for
"Approved"/"Delivered"/"Canceled" — so a "Submitted" order (and any other non-excluded status)
remains fully editable today. Both conditions change to a single `orderStatus === "Draft"`
allow-rule, plus a `useEffect` on the Order Detail page that force-exits edit mode if the order's
status changes away from Draft while the user is still editing (covers the ~5-second window
between a Submit action and the page's own reload). Because every editable field/control on both
pages already funnels through one shared `isEditing` boolean sourced from these two Edit buttons,
no other component needs a status check added. (2) The Order Line Detail page's "Product
Information" card (`components/ProductInfo.tsx`) is rewritten to show Product Name, Description,
Product Family, Brand Name, Grouping, Taxable, MOQ, Lead-Time (Wks), and Shipping Dimensions,
replacing its current field set (Manufacturer DBA, Manufacturer, Site, Inventory Account,
Available to Sell); this requires adding `brand`, `leadTimeWks`, and `shippingDimensions` to the
page's existing order-line mapping (MOQ and Grouping are already mapped but not yet passed to this
card). No new API routes, no Salesforce schema changes, no DB migrations, and no visual/layout
changes beyond the field list itself.

## Technical Context

**Language/Version**: TypeScript 5 / React 18 (Next.js 15 App Router, client components —
`"use client"`)

**Primary Dependencies**: Next.js 15, React, Tailwind CSS — no new dependencies required

**Storage**: N/A for this feature — order/order-line status and product fields live in the
existing client-side state (`orderStatus`, `isEditing`, `orderProducts`/`orderLines`) sourced from
and submitted to Salesforce via the existing `/api/salesforce/orders` route; no PostgreSQL schema
change

**Testing**: No automated component/unit test runner exists in this repo; validation is manual,
via `npm run dev` and exercising both pages in a browser per `quickstart.md`

**Target Platform**: Web browser (desktop-first, existing responsive Tailwind layout), served by
the Next.js app

**Project Type**: Web application (single Next.js project — no frontend/backend split; this
feature touches `app/orders/[id]/page.tsx`, `app/orders/[id]/components/OrderHeader.tsx`,
`app/orders/[id]/lines/[lineId]/page.tsx`, `app/orders/[id]/lines/[lineId]/components/LineHeader.tsx`,
and `app/orders/[id]/lines/[lineId]/components/ProductInfo.tsx`)

**Performance Goals**: Status/edit-mode transitions must apply within a single React render (no
perceptible lag), consistent with existing `isEditing`-driven re-renders on both pages

**Constraints**: Must not change the `/api/salesforce/orders` route or its Apex REST contract;
must not change the visual layout, styling, or positioning of either page or the Product
Information card — only the edit-lock condition and the card's field list; must not touch any of
the ~10 child components that already consume `isEditing` as a prop (`MyOrderTable`,
`ProductCatalog`, `BillingInfo`, `ShippingInfo`, `OrderNotes`, `ShipToContact`, `DeliveryOptions`,
`OrderTotal`, `FilesTab`, `OrderDetailsTable`, `OrderLineNotes`) since the centralized gate already
covers them (research.md Decision 1)

**Scale/Scope**: Five existing files across two pages; no new routes, services, DB tables, or
Salesforce schema changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|-----------|-------|--------|
| I. Salesforce as Single Source of Truth | All reads/writes continue through the existing `/api/salesforce/orders` route → `lib/salesforce-service.ts`. This feature changes only client-side gating logic (when `isEditing` can become `true`) and which already-fetched fields are read/displayed — no raw queries added to pages, no new SF write paths. | PASS |
| II. RBAC-First Feature Design | Both pages are already behind the main-portal session middleware and existing `order-create`/edit permission gates where applicable; this feature adds a status-based restriction on top of existing permission checks, it does not loosen or bypass any permission check. | PASS |
| III. Next.js 15 App Router Patterns | No new routes; both pages already correctly unwrap their dynamic `params` via `use(params)` (unchanged by this feature). No changes to either auth system. | PASS |
| IV. Multi-Tenant Isolation | No new queries; all fixes operate on data already scoped to the session's account/contact, unchanged by this feature. | PASS |
| V. Simplicity & Phase-Driven Scope | The edit lock is fixed at its two root gates (`OrderHeader.tsx`, `LineHeader.tsx`) rather than duplicated into every consumer component (research.md Decision 1) — the simplest change that satisfies the requirement. The Product Information card fields are a straightforward field-list replacement reusing existing mapping conventions from sibling pages (Decisions 3-5), no new abstractions introduced. | PASS |

No violations — Complexity Tracking table is not needed.

**Post-Phase 1 re-check**: `research.md`, `data-model.md`, `contracts/edit-lock-and-product-info.md`,
and `quickstart.md` confirm the design stays within five existing files across two pages, adds no
new API routes/DB tables/permission checks, and does not touch any of the child components that
already key off the shared `isEditing` flag. All five gates above still PASS after design.

## Project Structure

### Documentation (this feature)

```text
specs/061-order-edit-lock-product-card/
├── plan.md                                  # This file (/speckit-plan command output)
├── research.md                              # Phase 0 output (/speckit-plan command)
├── data-model.md                            # Phase 1 output (/speckit-plan command)
├── quickstart.md                            # Phase 1 output (/speckit-plan command)
├── contracts/
│   └── edit-lock-and-product-info.md        # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md                      # /speckit-specify output
└── tasks.md                                 # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

This is the existing single Next.js 15 App Router project (no frontend/backend split). This
feature modifies five existing files across two pages; no new files, routes, or directories are
created.

```text
app/
└── orders/
    └── [id]/
        ├── page.tsx                              # MODIFIED — add a useEffect that force-exits
        │                                          #   edit mode when orderStatus changes away
        │                                          #   from "Draft" (research.md Decision 2)
        ├── components/
        │   └── OrderHeader.tsx                    # MODIFIED — Edit button visibility condition
        │                                          #   changes from `orderStatus !== "Approved"`
        │                                          #   to `orderStatus === "Draft"`
        └── lines/
            └── [lineId]/
                ├── page.tsx                        # MODIFIED — add `brand`, `leadTimeWks`,
                │                                    #   `shippingDimensions` to the order-line
                │                                    #   mapping; pass `moq`/`grouping` through to
                │                                    #   ProductInfo (already mapped, not yet used)
                └── components/
                    ├── LineHeader.tsx               # MODIFIED — Edit button visibility condition
                    │                                #   changes from excluding
                    │                                #   Approved/Delivered/Canceled to
                    │                                #   `orderStatus === "Draft"`
                    └── ProductInfo.tsx               # MODIFIED — field list replaced: Product
                                                       #   Name, Description, Product Family, Brand
                                                       #   Name, Grouping, Taxable, MOQ, Lead-Time
                                                       #   (Wks), Shipping Dimensions
```

**Structure Decision**: Single-project Next.js App Router structure (per `CLAUDE.md` /
Constitution). All logic for this feature lives in the existing Order Detail and Order Line
Detail pages and their existing header/product-info components — no shared component is
extracted, no new abstraction introduced, consistent with the precedent already established for
the sibling Order Detail MOQ/Brand feature (057) and Product Details corrections feature (060).

## Complexity Tracking

*No violations — this section is not applicable. Constitution Check above passed with no
exceptions required.*

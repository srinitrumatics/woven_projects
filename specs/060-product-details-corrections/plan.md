# Implementation Plan: Product Details Page — Pricing, Brand & Order Qty Corrections

**Branch**: `wovn_mathu` | **Date**: 2026-07-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/060-product-details-corrections/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Correct five related defects/labels on the buyer-facing Product Details page
(`app/products/[id]/components/ProductInfoCard.tsx` and `AddToOrderModal.tsx`), all client-side:
(1) the "Add to Order" submit payload must compute `Order_Qty__c` as `Total Order Qty ÷ MOQ`
instead of sending the raw quantity, matching the convention already fixed on the Order Detail
and Configure Order pages (features 057/053); (2) the quantity label/control renames from "Order
Qty" to "Total Order Qty" and gains a hard floor so "Add to Order" is disabled at zero; (3) the
"Manufacturer" field renames to "Brand Name" and widens its data source to the same
`gtherp__Brand_Name__c`-first fallback chain already used elsewhere in the app (order lines,
product sync); (4) the pricing block's "Unit Selling Price" label renames to "Unit Price" (no
underlying field change) and the struck-through "List Price" (`product.originalPrice`) value is
removed from this page entirely; (5) the "Add to Order" button moves into the same row as the
Total Order Qty stepper instead of sitting in a separate row below it. No new API routes, no
Salesforce schema changes, no DB migrations — the existing `/api/salesforce/orders` PATCH route
already forwards whatever `orderLines` shape the client sends, so all five fixes are contained to
`app/products/[id]/components/ProductInfoCard.tsx`, `AddToOrderModal.tsx`, and the field-mapping
function in `lib/products-service.ts`.

## Technical Context

**Language/Version**: TypeScript 5 / React 18 (Next.js 15 App Router, client components —
`"use client"`)

**Primary Dependencies**: Next.js 15, React, Tailwind CSS, existing `useUserSession`/`useToast`
hooks, `formatCurrency`/`formatNumber` from `lib/utils/formatting` — no new dependencies required

**Storage**: N/A for this feature — product pricing/brand/MOQ live in the client-side `product`
object returned by `getProductDetails`/`mapSalesforceProductToLocal` (`lib/products-service.ts`);
order-line quantity is submitted to Salesforce via the existing `/api/salesforce/orders` PATCH
route; no PostgreSQL schema change

**Testing**: No automated component/unit test runner exists in this repo (only ad hoc `tsx`
scripts for RBAC/product-sync via `test:rbac`); validation is manual, via `npm run dev` and
exercising the Product Details page in a browser per `quickstart.md`

**Target Platform**: Web browser (desktop-first, existing responsive Tailwind layout), served by
the Next.js app

**Project Type**: Web application (single Next.js project — no frontend/backend split; this
feature touches `app/products/[id]/components/ProductInfoCard.tsx`,
`app/products/[id]/components/AddToOrderModal.tsx`, and `lib/products-service.ts`)

**Performance Goals**: Quantity changes and the resulting submit payload must update within a
single React render (no perceptible lag), consistent with existing stepper behavior on this and
sibling pages

**Constraints**: Must not change the `/api/salesforce/orders` route or its Apex REST contract —
only the JSON body's field values, computed client-side before the existing `fetch(...PATCH...)`
call in `AddToOrderModal`'s `handleAddToOrder`/`handleCreateOrder`; must not regress the existing
draft-order selection/creation flow in `AddToOrderModal`; must not touch the separate partner/
manufacturer "Edit Product" form (`EditProductTabs.tsx`) or the public catalog list page's own
"List Price" column (`ProductClientPage.tsx`), both explicitly out of scope per the spec's
Assumptions

**Scale/Scope**: Two existing components and one existing service mapping function; no new
routes, services, DB tables, or Salesforce schema changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|-----------|-------|--------|
| I. Salesforce as Single Source of Truth | All reads/writes continue through the existing `/api/salesforce/product-details` and `/api/salesforce/orders` routes → `lib/product-salesforce-service.ts` / `lib/salesforce-service.ts`. This feature changes only which fields of the already-fetched/already-sent JSON are read and computed client-side (Brand fallback chain, Order Qty ÷ MOQ formula) — no raw queries added to pages, no new SF write paths. | PASS |
| II. RBAC-First Feature Design | "Add to Order" is already gated by `PermissionGate requiredPermissions={['order-create']}` in `ProductInfoCard.tsx`; this feature does not add a new capability or permission surface, only corrects values and labels within an already-gated action. No new `PermissionGate` or server-side permission check required. | PASS |
| III. Next.js 15 App Router Patterns | No new routes; `app/products/[id]/page.tsx` already correctly unwraps its dynamic params (unchanged by this feature). No changes to either auth system. | PASS |
| IV. Multi-Tenant Isolation | No new queries; all fixes operate on data already scoped to the session's selected account/contact, unchanged by this feature. | PASS |
| V. Simplicity & Phase-Driven Scope | Fixes are small, targeted value/label corrections and one UI reflow (moving a button into an existing row), matching existing file/component structure. No new abstractions, no feature flags, no speculative generalization beyond the two touched components and one service function. | PASS |

No violations — Complexity Tracking table is not needed.

**Post-Phase 1 re-check**: `research.md`, `data-model.md`, `contracts/add-to-order-payload.md`, and
`quickstart.md` confirm the design stays within the existing components and service function,
adds no new API routes/DB tables/permission checks, and keeps every fix scoped to its own
label/value. All five gates above still PASS after design — no re-evaluation changes are needed.

## Project Structure

### Documentation (this feature)

```text
specs/060-product-details-corrections/
├── plan.md                          # This file (/speckit-plan command output)
├── research.md                      # Phase 0 output (/speckit-plan command)
├── data-model.md                    # Phase 1 output (/speckit-plan command)
├── quickstart.md                    # Phase 1 output (/speckit-plan command)
├── contracts/
│   └── add-to-order-payload.md      # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md              # /speckit-specify output
└── tasks.md                         # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

This is the existing single Next.js 15 App Router project (no frontend/backend split). This
feature modifies two existing components and one existing service file; no new files, routes, or
directories are created.

```text
app/
└── products/
    └── [id]/
        └── components/
            ├── ProductInfoCard.tsx    # MODIFIED — "Order Qty" → "Total Order Qty" label/floor-
            │                          #   at-zero + disabled "Add to Order" at zero; "Manufacturer"
            │                          #   → "Brand Name" label; "Unit Selling Price" → "Unit
            │                          #   Price" label; List Price (originalPrice) strikethrough
            │                          #   block removed; "Add to Order" button moved into the
            │                          #   Total Order Qty row
            └── AddToOrderModal.tsx    # MODIFIED — Order_Qty__c computed as quantity ÷ product.moq
                                       #   in both handleAddToOrder and handleCreateOrder payloads

lib/
└── products-service.ts               # MODIFIED — mapSalesforceProductToLocal's `manufacturer`
                                       #   field renamed/re-sourced to `brand` via a widened
                                       #   gtherp__Brand_Name__c-first fallback chain
```

**Structure Decision**: Single-project Next.js App Router structure (per `CLAUDE.md` /
Constitution). All logic for this feature lives in the existing Product Details page's
components and its existing service mapping function — no shared component is extracted (see
`research.md` Decision 1), consistent with the precedent already established for the sibling
Order Detail MOQ/Brand feature (057).

## Complexity Tracking

*No violations — this section is not applicable. Constitution Check above passed with no
exceptions required.*

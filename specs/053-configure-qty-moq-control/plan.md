# Implementation Plan: Configure Order Quantity Control by MOQ

**Branch**: `wovn_mathu` | **Date**: 2026-07-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/053-configure-qty-moq-control/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Replace the read-only Qty cell in the Configure Order lines table (`app/configure/page.tsx`) with increase/decrease controls that step each product line's quantity by that product's MOQ (`MOQ__c` / `moq`, defaulting to 1 when missing/invalid), enforce a floor at MOQ, normalize any non-MOQ-aligned quantity (e.g. from an old saved draft) on the next step, and leave the existing order-creation payload untouched since it already reads `l.qty` per line. Purely a client-side change to state/derived-value logic and table markup — no new API routes, no Salesforce schema changes, no DB migrations.

## Technical Context

**Language/Version**: TypeScript 5 / React 18 (Next.js 15 App Router, client component — `"use client"`)

**Primary Dependencies**: Next.js 15, React, Tailwind CSS, existing `useUserSession`/`useToast` hooks — no new dependencies required

**Storage**: N/A for this feature — quantity lives in in-memory `lines` state and the existing `gth-configured-draft` `localStorage` draft; no PostgreSQL or Salesforce schema change

**Testing**: No automated component/unit test runner exists in this repo (only ad hoc `tsx` scripts for RBAC/product-sync via `test:rbac`/`test:product-sync`); validation is manual, via `npm run dev` and exercising the Configure Order page in a browser per `quickstart.md`

**Target Platform**: Web browser (desktop-first, existing responsive Tailwind layout), served by the Next.js app

**Project Type**: Web application (single Next.js project — no frontend/backend split; this feature touches only `app/configure/page.tsx`)

**Performance Goals**: Quantity step must update the line, extended price, and order totals within a single React render (no perceptible lag) for order lists of the sizes already supported by this page (tens of lines)

**Constraints**: Must not change the order-lines payload shape sent to `/api/salesforce/orders` (PATCH) — `Order_Qty__c` already derives from `l.qty`, so the increase/decrease controls only need to keep `l.qty` correct; must not affect group rows or drag-and-drop reordering already implemented on this page

**Scale/Scope**: Single page, single component file (`app/configure/page.tsx`); no new routes, services, or DB tables

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|-----------|-------|--------|
| I. Salesforce as Single Source of Truth | Feature reads MOQ/quantity from data already fetched via `lib/salesforce-service.ts` through `/api/salesforce/orders?action=products`; no new SF writes; order submission still goes through the existing `handleCreateOrder` → `/api/salesforce/orders` PATCH flow, unchanged. | PASS |
| II. RBAC-First Feature Design | Configure Order page is already behind Salesforce session middleware (`middleware.ts` protects `/configure` — confirmed in `isProtectedRoutePath`'s protected-routes list). This feature adds no new capability requiring a distinct permission — it only makes an existing per-line field (quantity) editable within a page the user can already reach. No new `PermissionGate` or server-side permission check is required. | PASS |
| III. Next.js 15 App Router Patterns | No new routes, no dynamic route params involved; `app/configure/page.tsx` remains a client component under `app/configure/layout.tsx` (`Sidebar` wrapper). No changes to either auth system. | PASS |
| IV. Multi-Tenant Isolation | No new queries; product/account/contact IDs used for quantity logic are the same `SF_ACCOUNT_ID`/`SF_CONTACT_ID` already scoped per session — untouched by this feature. | PASS |
| V. Simplicity & Phase-Driven Scope | Scope stays within Phase 1 (Client). No speculative abstraction: quantity stepping is implemented as small pure helper functions plus inline UI controls, matching the existing single-file page style. No feature flags. | PASS |

No violations — Complexity Tracking table is not needed.

**Post-Phase 1 re-check**: `research.md`, `data-model.md`, `contracts/quantity-stepping.md`,
and `quickstart.md` confirm the design stays within one existing file, adds no new API
routes/DB tables/permission checks, and keeps quantity edits scoped per-line. All five gates
above still PASS after design — no re-evaluation changes are needed.

## Project Structure

### Documentation (this feature)

```text
specs/053-configure-qty-moq-control/
├── plan.md                          # This file (/speckit-plan command output)
├── research.md                      # Phase 0 output (/speckit-plan command)
├── data-model.md                    # Phase 1 output (/speckit-plan command)
├── quickstart.md                    # Phase 1 output (/speckit-plan command)
├── contracts/
│   └── quantity-stepping.md         # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md              # /speckit-specify output
└── tasks.md                         # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

This is the existing single Next.js 15 App Router project (no frontend/backend split). This
feature modifies exactly one existing file; no new files, routes, or directories are created.

```text
app/
└── configure/
    ├── layout.tsx        # unchanged (Sidebar wrapper)
    ├── configure.css     # unchanged
    └── page.tsx          # MODIFIED — add resolveMoq/normalizeQty/stepQty helpers and
                           # replace the read-only Qty <input> in the product-row <tr> with
                           # increase/decrease controls (see contracts/quantity-stepping.md)
```

**Structure Decision**: Single-project Next.js App Router structure (per `CLAUDE.md` /
Constitution). All logic for this feature lives inline in `app/configure/page.tsx`,
consistent with the two existing (unmodified) precedent implementations in
`app/orders/[id]/lines/[lineId]/components/OrderDetailsTable.tsx` and
`app/orders/[id]/components/ProductCatalog.tsx` — see `research.md` Decision 1 for why no
shared component is extracted in this feature.

## Complexity Tracking

*No violations — this section is not applicable. Constitution Check above passed with no
exceptions required.*

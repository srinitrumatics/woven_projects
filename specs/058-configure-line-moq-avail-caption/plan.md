# Implementation Plan: Configure Order Lines — MOQ/Available-to-Sell Caption Under Order Qty

**Branch**: `wovn_mathu` | **Date**: 2026-07-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/058-configure-line-moq-avail-caption/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a "MOQ: {value} / Avail: {value}" caption directly beneath the Order Qty stepper in the
Configure Order page's order lines table (`app/configure/ConfigureOrderClientPage.tsx`), matching
the exact text/format already used in the Order Detail page's My Order table
(`app/orders/[id]/components/MyOrderTable.tsx:178`). The MOQ half is trivial — `resolveMoq(l)` is
already computed per line for the existing dedicated "MOQ" column. The Avail half requires one
small, real fix: an `avail` value is already fetched per product (`fetchProductDetails` returns
`avail`, and both line-creation call sites compute an `enriched.avail`), but neither call site's
final line-object literal actually keeps that field — it's silently dropped when the line is
constructed. This plan closes that gap so `avail` survives onto the line (and therefore into the
existing localStorage draft, via its existing generic JSON round-trip) and can be displayed. No new
API routes, Salesforce fields, or type changes — this is a client-side-only UI addition confined to
one existing file.

## Technical Context

**Language/Version**: TypeScript 5 / React 18 (Next.js 15 App Router, client component — `"use client"`)

**Primary Dependencies**: Next.js 15, React, Tailwind CSS — no new dependencies required

**Storage**: N/A — `avail` becomes part of the existing in-memory `lines` state and, by extension, the existing `gth-configured-draft` localStorage draft (which already generically JSON-round-trips whatever fields exist on each line); no PostgreSQL or Salesforce schema change

**Testing**: No automated component/unit test runner exists in this repo (see prior features' Technical Context); verification is manual via `npm run dev` and exercising the Configure Order page in a browser per `quickstart.md`

**Target Platform**: Web browser (desktop-first, existing responsive Tailwind layout), served by the Next.js app

**Project Type**: Web application (single Next.js project — no frontend/backend split; this feature touches only `app/configure/ConfigureOrderClientPage.tsx`)

**Performance Goals**: The caption renders from data already held in component state/props (no new fetch, no new render pass beyond the existing per-line render) — no measurable performance impact for order lists of the sizes already supported by this page

**Constraints**: Must not change the existing dedicated "MOQ" or "Total Qty" columns, the existing Order Qty stepper behavior (step/floor from feature 053), or the existing "Browse Catalog" panel's own avail-chip formatting (`{avail} avail` / `Unlimited` / `0 avail`) — the new caption uses the Order Detail page's plainer format instead, per spec Assumptions

**Scale/Scope**: Single page, single component file (`app/configure/ConfigureOrderClientPage.tsx`); no new routes, services, DB tables, or Salesforce schema changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|-----------|-------|--------|
| I. Salesforce as Single Source of Truth | `avail` is already sourced from Salesforce via the existing `fetchProductDetails` call (`/api/salesforce/product-details`, itself backed by `lib/salesforce-service.ts`); this feature only stops that already-fetched value from being dropped when the line object is built — no new query, no new service, no raw query added to the page. | PASS |
| II. RBAC-First Feature Design | Configure Order page is already behind Salesforce session middleware. This feature adds no new capability or permission surface — it only makes an already-fetched, already-displayed-elsewhere value (the catalog panel's avail chip) additionally visible on the order line itself. No new `PermissionGate` or server-side permission check required. | PASS |
| III. Next.js 15 App Router Patterns | No new routes, no dynamic route params involved; `ConfigureOrderClientPage.tsx` remains a client component rendered from the existing `app/configure/page.tsx` server wrapper. No changes to either auth system. | PASS |
| IV. Multi-Tenant Isolation | No new queries; `avail` flows from the same per-request `SF_ACCOUNT_ID`/`SF_CONTACT_ID`-scoped `fetchProductDetails` call already used for MOQ/sell price — untouched by this feature. | PASS |
| V. Simplicity & Phase-Driven Scope | The fix is the smallest possible change: add one field to two existing object literals, and add one caption `<div>` to existing JSX. No new abstractions, no shared helper, no feature flag. | PASS |

No violations — Complexity Tracking table is not needed.

**Post-Phase 1 re-check**: `research.md`, `data-model.md`, `contracts/moq-avail-caption.md`, and
`quickstart.md` confirm the design stays within the one existing file, adds no new API
routes/DB tables/permission checks/type files, and keeps the change to two small, well-understood
edits (carry `avail` onto the line; render the caption). All five gates above still PASS after
design — no re-evaluation changes are needed.

## Project Structure

### Documentation (this feature)

```text
specs/058-configure-line-moq-avail-caption/
├── plan.md                          # This file (/speckit-plan command output)
├── research.md                      # Phase 0 output (/speckit-plan command)
├── data-model.md                    # Phase 1 output (/speckit-plan command)
├── quickstart.md                    # Phase 1 output (/speckit-plan command)
├── contracts/
│   └── moq-avail-caption.md         # Phase 1 output (/speckit-plan command)
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
    ├── page.tsx                     # unchanged (thin server wrapper)
    └── ConfigureOrderClientPage.tsx  # MODIFIED — carry `avail` onto the line object in
                                      # makeLine()/addProductFromCatalogAt(), and render the
                                      # new "MOQ: {value} / Avail: {value}" caption beneath the
                                      # existing Order Qty stepper (see contracts/moq-avail-caption.md)
```

**Structure Decision**: Single-project Next.js App Router structure (per `CLAUDE.md` /
Constitution). All logic for this feature lives inline in
`app/configure/ConfigureOrderClientPage.tsx`, consistent with this page's existing single-file
style and with the precedent set by feature 053 (the page's own prior MOQ-stepper feature), which
also kept all logic inline rather than extracting a shared component — see `research.md` Decision 1.

## Complexity Tracking

*No violations — this section is not applicable. Constitution Check above passed with no
exceptions required.*

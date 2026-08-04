# Implementation Plan: Fix "Add to Order" Null Product Crash

**Branch**: `110-fix-add-to-order-null-crash` | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/110-fix-add-to-order-null-crash/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

The Products List page (`app/products/ProductClientPage.tsx`) unconditionally mounts the shared `AddToOrderModal` component (`app/products/[id]/components/AddToOrderModal.tsx`) and passes it `product={addToOrderProduct}`, where `addToOrderProduct` defaults to `null` until a user clicks "Add to Order." `AddToOrderModal` reads `product.name` (and other product fields) directly in JSX with no null guard, so the component throws `TypeError: can't access property "name", product is null` the moment it renders — which is on every page load, before the dialog is ever opened. The fix is to stop unconditionally evaluating product fields when no product is selected: either render `AddToOrderModal` only when a product is present, or guard the dialog's internal renders against a null/undefined `product`. The Product Detail page's usage (`ProductInfoCard.tsx`) is unaffected since its parent already guarantees `product` is non-null before rendering.

## Technical Context

**Language/Version**: TypeScript 5, React 19

**Primary Dependencies**: Next.js 15 (App Router, client components), Radix UI (`@radix-ui/react-dialog`, wrapped by `components/ui/Modal.tsx`)

**Storage**: N/A — this is a pure client-side rendering fix; no database or Salesforce data changes

**Testing**: No automated test suite exists for UI components in this repo (`npm run test:product-sync` and `npm run test:rbac` cover unrelated domains). Verification is manual: run `npm run dev` and exercise the flows in a browser per project convention (CLAUDE.md "UI or frontend changes" guidance).

**Target Platform**: Web (Next.js client components, evergreen browsers, light/dark mode)

**Project Type**: Web application (single Next.js app, no separate frontend/backend split)

**Performance Goals**: N/A — no measurable performance change; fix is a rendering-order/null-guard correction

**Constraints**: Must not change the visible behavior or appearance of the dialog when a product IS selected (FR-006); must not regress the Product Detail page's existing working usage of the same component

**Scale/Scope**: Two call sites of one shared component (`app/products/ProductClientPage.tsx` and `app/products/[id]/components/ProductInfoCard.tsx`); no new files, no new routes, no schema changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Salesforce as Single Source of Truth** — N/A. No business data is read or written differently; this fix only changes when/whether already-fetched product data is rendered.
- **II. RBAC-First Feature Design** — N/A. No permission surface changes; the existing `PermissionGate` around the "Add to Order" button in `ProductInfoCard.tsx` and equivalent gating on the Products List page are untouched.
- **III. Next.js 15 App Router Patterns** — Satisfied. No route params are touched; the fix stays within existing client components.
- **IV. Multi-Tenant Isolation** — N/A. No org-scoped queries or data access are involved.
- **V. Simplicity & Phase-Driven Scope** — Satisfied. The fix is the smallest change that removes the null dereference (conditional render or a guard clause) — no new abstractions, no speculative generalization beyond the one shared component.

No violations. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/110-fix-add-to-order-null-crash/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — this fix has no external API, CLI, or service contract; it is a
purely internal UI rendering correction.

### Source Code (repository root)

```text
app/
├── products/
│   ├── ProductClientPage.tsx                 # Products List page — call site that
│   │                                          # currently always mounts AddToOrderModal
│   │                                          # with a potentially-null product
│   └── [id]/
│       ├── page.tsx                          # Product Detail page — already guards
│       │                                      # `!product` before rendering ProductInfoCard
│       └── components/
│           ├── AddToOrderModal.tsx           # Shared dialog — root cause: reads
│           │                                  # `product.name` (and other fields) with no
│           │                                  # null guard
│           └── ProductInfoCard.tsx           # Product Detail's call site — unaffected,
│                                              # product is always non-null here
```

**Structure Decision**: Single Next.js application (App Router), per CLAUDE.md and the
constitution's fixed technology stack. This is a targeted fix inside the existing `app/products`
feature area — no new directories, routes, or services are introduced.

## Complexity Tracking

*No constitution violations — this section is not applicable.*

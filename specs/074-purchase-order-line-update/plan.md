# Implementation Plan: Save Tracking Number and Promise Date on Purchase Order Line

**Branch**: `074-purchase-order-line-update` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/074-purchase-order-line-update/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

The Purchase Order Line detail page already renders Tracking Number and Promise Date as editable inputs when the line's status is Draft, Approved, or Awarded, but nothing persists the edit — it's discarded on navigation or refresh. This feature adds a save action that PATCHes only these two fields back to Salesforce via the existing `gtherp/purchaseorderlines` Apex REST resource, scoped to the single line being viewed and to the currently selected account/contact, and reflects the saved values (or a clear failure) back into the page without a manual refresh.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 15 (App Router), React 19 client components

**Primary Dependencies**: Next.js 15 route handlers; existing `lib/salesforce-service.ts` (`getSalesforceSession`, `fetchWithLogging`); existing `lib/purchase-order-service.ts`; existing `components/UserSessionContext` (`useUserSession`) for account/contact scoping

**Storage**: N/A — Salesforce remains the sole system of record (Constitution Principle I); no PostgreSQL write. The write path is a Salesforce Apex REST resource (`/services/apexrest/gtherp/purchaseorderlines`, PATCH), not a SOQL query.

**Testing**: No automated test framework covers this page today (the repo's only structured test entry point, `npm run test:rbac`, is scoped to RBAC and does not exercise domain pages). Validation is via the `quickstart.md` manual scenario, consistent with how sibling PATCH features (e.g., product details) are validated in this repo today.

**Target Platform**: Web browser, desktop-first responsive layout (existing `w1025:` breakpoint already used on this page)

**Project Type**: Web application — single Next.js app; no separate frontend/backend split. Existing `app/purchase-orders/[id]/lines/[lineid]/page.tsx` (client component) + `app/api/purchase-orders/route.ts` (route handler) + `lib/purchase-order-service.ts` (Salesforce client) layering is reused, not restructured.

**Performance Goals**: Save completes and the page reflects the new value(s) within normal interactive latency (~1–2s), consistent with the existing product-details PATCH flow (`lib/product-salesforce-service.ts` → `patchProductTabInSalesforce`) already in production.

**Constraints**: The PATCH payload MUST include only the edited field(s) among `Tracking_Number__c` / `Promise_Date__c` for the targeted line (per FR-003, FR-005 — no other field is touched); the save MUST only be reachable when `line.status` is Draft, Approved, or Awarded (per FR-002, FR-009), matching the rule already enforced for read-only rendering on this page today.

**Scale/Scope**: Single purchase order line updated per save action; no batch/multi-line update in scope.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Salesforce as Single Source of Truth | PASS | New `patchPurchaseOrderLineInSalesforce()` in `lib/purchase-order-service.ts` calls the existing `gtherp/purchaseorderlines` Apex REST resource via `getSalesforceSession()`/`fetchWithLogging()` — no raw SOQL outside a service file, no business-object write to PostgreSQL. |
| II. RBAC-First Feature Design | PASS (documented deviation — see Complexity Tracking) | No PO-line-scoped permission exists today, and the two closest sibling PATCH routes (`app/api/salesforce/orders/route.ts` PATCH, `app/api/salesforce/product-details/route.ts` PATCH) ship with zero permission checks. This feature matches that existing precedent rather than introducing one-off, inconsistent gating for a single endpoint. |
| III. Next.js 15 App Router Patterns | PASS | `page.tsx` already unwraps `params` via `use()`; the new write path adds a `PATCH` export to the existing `app/api/purchase-orders/route.ts` file, following the same file/route convention already used by every other domain (`app/api/salesforce/orders/route.ts`, `app/api/salesforce/product-details/route.ts`). |
| IV. Multi-Tenant Isolation | PASS | The save request carries `accountId`/`contactId` sourced from `useUserSession()` (`selectedAccount`, `user.contact`) — the same session-derived values already used for every other fetch on this page — never a client-editable org identifier. |
| V. Simplicity & Phase-Driven Scope | PASS | Scope is exactly the two fields named in the spec; no generic "line editor" abstraction, no new permission framework, no batch-update capability — matches Phase 1 (Client Priority) scope. |

**Post-Design Re-check** (after Phase 1 `data-model.md`/`contracts/`/`quickstart.md`): No new violations introduced. The contract in `contracts/patch-purchase-order-line.md` confirms the write stays within the single-line, two-field, no-new-permission scope assessed above; all five principles remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/074-purchase-order-line-update/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/
├── purchase-orders/
│   ├── types.ts                                  # existing — trackingNumber/promiseDate already typed on PurchaseOrderLine; no change expected
│   └── [id]/lines/[lineid]/
│       └── page.tsx                              # MODIFY — add save handler + save control for the two existing editable inputs
└── api/
    └── purchase-orders/
        └── route.ts                              # MODIFY — add PATCH export, following the existing GET export's pattern in this same file

lib/
└── purchase-order-service.ts                      # MODIFY — add patchPurchaseOrderLineInSalesforce(), mirroring lib/product-salesforce-service.ts's patchProductTabInSalesforce()
```

**Structure Decision**: Single Next.js application, no new top-level structure. This feature extends three existing files along the same page → route handler → Salesforce-service layering already used by every other domain in this app (e.g., the product-details PATCH flow: `app/products/**` → `app/api/salesforce/product-details/route.ts` → `lib/product-salesforce-service.ts`). No new directories, no new service files, no new API routes are introduced.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| No RBAC permission gate on the new save action (Principle II) | Matches the existing, established pattern: neither sibling Salesforce PATCH route in this repo (`app/api/salesforce/orders/route.ts` PATCH, `app/api/salesforce/product-details/route.ts` PATCH) has any permission or auth check today — editability is already governed purely by domain state (here, `line.status`), same as this feature. | Introducing a brand-new `po-line-update` permission scoped to only this one endpoint was rejected: it would enforce inconsistent security across functionally identical write endpoints, is not requested by the spec, and — per Principle V (no speculative abstractions) — a systemic RBAC gap across all Salesforce write routes is a separate, cross-cutting initiative, not something one narrowly-scoped feature should solve in isolation. |

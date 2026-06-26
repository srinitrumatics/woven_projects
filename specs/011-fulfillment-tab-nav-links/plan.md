# Implementation Plan: Fulfillment Tab Navigation Links — Proposals & Customer Quotes

**Branch**: `011-fulfillment-tab-nav-links` | **Date**: 2026-06-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/011-fulfillment-tab-nav-links/spec.md`

## Summary

Expand the clickable-link access in the Order Detail Fulfillment tab so that Customer, NSO, and Hybrid account types (in addition to the existing Super Admin) can navigate directly to proposal and customer quote detail pages. This is a single-file change to `app/orders/[id]/components/FulfillmentTab.tsx` — two boolean variables (`canLinkProposals` and `canLinkQuotes`) are widened from `isSuperAdmin`-only to include the three additional account types.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: Next.js `Link` component (already imported), `useUserSession` hook, `usePermissions` hook — all already present in the file

**Storage**: N/A — no database or API changes needed; fulfillment data already includes `Id` fields for all entities

**Testing**: Manual browser validation per `quickstart.md` scenarios

**Target Platform**: Web browser (same-origin Next.js client component)

**Project Type**: Web application (Next.js client component patch)

**Performance Goals**: No impact — change is conditional rendering only

**Constraints**: Must not break the existing Super Admin, Shipments, or Invoices link logic; must not trigger parent-row click handlers

**Scale/Scope**: Single file, two variable changes, zero new dependencies

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Salesforce as Source of Truth | ✅ PASS | No new Salesforce queries; `Id` already returned by existing fulfillment API |
| II. RBAC-First Feature Design | ✅ PASS | Permission check uses authenticated session (`useUserSession`, `usePermissions`); no client-supplied param can be spoofed |
| III. Next.js 15 App Router Patterns | ✅ PASS | Existing client component; `Link` already imported; no new route params |
| IV. Multi-Tenant Isolation | ✅ PASS | Account type derived from authenticated session; no cross-org data exposed |
| V. Simplicity & Phase-Driven Scope | ✅ PASS | Two-line change; no abstraction added; no half-finished work |

No violations. Complexity Tracking table not required.

## Project Structure

### Documentation (this feature)

```text
specs/011-fulfillment-tab-nav-links/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

*No data-model.md or contracts/ needed — this feature involves no new entities, no new API endpoints, and no external interface contracts.*

### Source Code (single file change)

```text
app/orders/[id]/components/
└── FulfillmentTab.tsx   # Lines 125–126: expand canLinkProposals and canLinkQuotes
```

**Structure Decision**: Minimal patch to existing client component. No new files, no new directories.

## Key Research Findings

(Resolved inline — see research.md)

1. **NSO string value**: Confirmed `'NSO'` is the exact `Account_Record_Type__c` string used throughout the codebase (`lib/permissions.ts:9`, `app/proposals/page.tsx:170`, `app/orders/[id]/components/ReturnsTab.tsx:92`).

2. **Page accessibility for Customer/NSO/Hybrid**: Middleware (`middleware.ts`) protects routes by session cookie only, not by account type. `/proposals/{id}` and `/quotes/{id}` are accessible to any authenticated user. The sidebar hides the nav links (`visibleFor: [""]` means Super Admin only), but the pages themselves work when navigated to directly. This is the existing pattern for `isRestricted` within proposal/quote pages (hides vendor tabs from Customer/NSO but doesn't block page access).

3. **Current implementation state**: Feature 010 set `canLinkProposals = isSuperAdmin` and `canLinkQuotes = isSuperAdmin`. Shipments/Invoices were already opened to Customer/Hybrid in feature 010. This feature completes the pattern by opening proposals/quotes to Customer, NSO, and Hybrid as well.

4. **NSO not in category expansion needed**: `getCategoryFromAccountType` maps `NSO → 'Customer'`. The sidebar check uses `typeCategory` (the mapped value), but `FulfillmentTab.tsx` uses raw `accountType` (the Salesforce field value). The raw string comparison `accountType === 'NSO'` is the correct pattern, consistent with how ReturnsTab and other components handle NSO.

# Implementation Plan: Customer Quote Details Page — Lines, Fulfillment, Returns Corrections

**Branch**: `033-customer-quote-details-corrections` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/033-customer-quote-details-corrections/spec.md`

## Summary

Correct column order, labels, and hyperlinks across seven tables on the Customer Quote Details page: the Customer Quote Lines tab, the Fulfillment tab's three sub-tabs (Sales Orders, Shipping Manifests, Invoices), and the Returns tab's two sub-tabs (RMAs, Credit Memos). Direct code inspection confirmed six genuine defects: a dead "Brand" field that always renders blank because the data mapping never populates it; "Sales Order #" with no hyperlink target; a hardcoded `isRestricted = ''` on the RMAs table that silently disables an access restriction correctly enforced on every sibling table; an unconditional, ungated Customer Order link on the Credit Memos table that produces a broken `/orders/undefined` link when no order is linked and bypasses the same restriction; a blank pagination `itemName` on RMAs; and a swapped Tracking Number/Tracking Status column order on both the Shipping Manifests and RMAs tables. Beyond these defects, most of the requested corrections are missing columns (chiefly Proposal #/Proposal Name, absent from five of the six Fulfillment/Returns sub-tables) and default-sort corrections (all seven tables currently sort by the wrong field and/or the wrong direction relative to the requested ascending-by-own-record-identifier convention already established by feature 031). All changes are frontend edits to the six existing sub-tab components plus their shared parent tab components (`QuoteFulfillmentTab.tsx`, `QuoteReturnsTab.tsx`) and `app/quotes/[id]/page.tsx` (Quote Lines sort state and field mapping); no new routes, no schema changes.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: Tailwind CSS, `Link` (Next.js), `SortableHeader`, `Pagination`, `useResizableColumns`, `useUserSession`, `formatCurrency()`/`formatDate()`/`formatNumber()`/`displayCell()` — all existing in the codebase, same primitives used by every prior table-correction feature (016-032)

**Storage**: N/A — read-only Salesforce data via `/api/salesforce/quotes?...&action={quotelines|fulfillment|returns}` (proxied through `lib/quote-service.ts` to a Salesforce Apex REST endpoint); all field-mapping for these seven tables happens client-side inside `app/quotes/[id]/page.tsx` (`fetchTabData`, lines ~261-524), not in an API route or the sub-tab components themselves

**Testing**: Visual/functional — run `npm run dev`, open a customer quote's detail page, and verify all seven tables' column order, labels, hyperlinks, gating, sort, and pagination per `quickstart.md`, testing both a restricted and a non-restricted account type for the RMAs/Credit Memos fixes

**Target Platform**: Browser (Next.js SSR + client components)

**Performance Goals**: No degradation — column reordering, new field mappings, and corrected sort keys/directions add negligible overhead; no new network calls

**Constraints**: No new API routes; no new SF Apex changes; no DB schema changes. Several new columns carry residual live-org field-availability risk (Proposal linkage on five sub-tables, Box Length/Width on Shipping Manifests, Purchase Order # on Invoices, Grouping/Proposed Product on Quote Lines) — all degrade gracefully to "-"/plain text if the underlying field is unavailable, consistent with how feature 031 handled equivalent risk.

**Scale/Scope**: 9 files touched (6 sub-tab components + `QuoteFulfillmentTab.tsx` + `QuoteReturnsTab.tsx` + `app/quotes/[id]/page.tsx`), 1 shared types file (`app/quotes/types.ts`), 7 tables, ~15+13+22+18+23+13 = ~104 total column definitions across the six sub-tables today, growing to match each table's FR-defined target count

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | Reads continue to flow through the existing `/api/salesforce/quotes` endpoint; no new DB writes; new field references (Proposal, Box Length/Width, Purchase Order #, Grouping, Proposed Product) read from the same raw record shape already returned by the API, mapped client-side per the existing pattern |
| II — RBAC-First | ✅ PASS | No permission structure changed; the RMAs and Credit Memos gating fixes (FR-029, FR-036) extend the exact `isManufacturer`/`isRestricted` mechanism already correctly implemented on the Sales Orders, Shipping Manifests, and Invoices sub-tables on this same page — a bug fix to match existing sibling behavior, not new gating logic |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes; modifying existing client components only; no changes to `page.tsx`'s `params` handling |
| IV — Multi-Tenant Isolation | ✅ PASS | No org-scoped query logic changed |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | Targeted corrections to seven existing tables; reuses the exact `SortableHeader`/`Pagination`/`useResizableColumns`/`useUserSession`/`isManufacturer`/`isRestricted` primitives already proven elsewhere on this same page and portal-wide — no new abstractions, no new routes, no prop-drilling introduced |

No violations. No Complexity Tracking entry required.

**Post-design re-check** (after Phase 0/1 research): All column/label/hyperlink changes are UI-only edits to six sibling sub-tab components, none of which are consumed by any other page. The two gating fixes (RMAs, Credit Memos) bring those tables in line with an already-proven pattern used by the other four tables on the same page — no new shared state, no new risk surface. All five principles remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/033-customer-quote-details-corrections/
├── plan.md              # This file
├── research.md          # Phase 0 output — current-state audit of all seven tables
├── data-model.md        # Phase 1 output — field-mapping catalogues and column-order deltas per table
└── quickstart.md        # Phase 1 output — validation scenarios (including restricted/non-restricted account-type gating)

(no contracts/ — this feature exposes no new API routes or external interfaces)
```

### Source Code (files in scope)

```text
app/quotes/[id]/page.tsx                                  # Quote Lines sort-state default (FR-004), fetchTabData mapping additions
                                                            # (Proposed Product, Grouping, Brand Name fix, Proposal #/Name for 5 sub-tables,
                                                            # Purchase Order # for Invoices, Box Length/Width for Shipping Manifests)
app/quotes/types.ts                                        # Interface additions/removals across QuoteLine, QuoteSalesOrder,
                                                            # QuoteShippingManifest, QuoteInvoice, QuoteRMA, QuoteCreditMemo
app/quotes/[id]/components/
├── QuoteLinesTab.tsx                                      # Column order/labels/hyperlinks (US1)
├── QuoteFulfillmentTab.tsx                                # Sort-state defaults for Sales Orders/Shipping Manifests/Invoices (FR-004);
│                                                           # widths config additions
├── QuoteSalesOrdersSubTab.tsx                             # Column order/labels/hyperlinks (US2)
├── QuoteShippingManifestsSubTab.tsx                       # Column order/labels/hyperlinks (US3)
├── QuoteInvoicesSubTab.tsx                                # Column order/labels/hyperlinks (US4)
├── QuoteReturnsTab.tsx                                    # Sort-state defaults for RMAs/Credit Memos (FR-004); widths config additions
├── QuoteRMASubTab.tsx                                     # Column order/labels/hyperlinks + isRestricted fix (US5)
└── QuoteCreditMemoSubTab.tsx                              # Column order/labels/hyperlinks + Customer Order link fix (US6)
```

**Structure Decision**: Single Next.js App Router project (existing structure, no new files) — same minimal-scope pattern as features 016-032, here touching seven sibling tables sharing one parent page's data-fetch/mapping logic (`page.tsx`) and two intermediate tab containers that own each sub-table's sort state and column widths.

## Complexity Tracking

No constitution violations — table not required.

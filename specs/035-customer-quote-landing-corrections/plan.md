# Implementation Plan: Customer Quote Landing Page — Required Corrections

**Branch**: `035-customer-quote-landing-corrections` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/035-customer-quote-landing-corrections/spec.md`

## Summary

Correct column order, labels, and hyperlinks on the Customer Quotes landing page (`app/quotes/page.tsx`). Direct code inspection confirmed that several cross-cutting requirements are already implemented correctly today — the page header already reads "Customer Quotes" (line 169), all headers already pass `truncate={false}` for single-line no-wrap rendering, the first column is already sticky, `Pagination` already exists, and default sort is already `quoteNumber` descending. These are locked in as regression-protected requirements (User Story 4) rather than new work. The genuine defects found: "Proposal Name" (line 451) currently carries its own hyperlink with no separate "Proposal #" column, merging what other corrected landing pages (feature 032) keep as two distinct columns; "Customer PO" (lines 536-555) currently links to a purchase order record via `purchaseOrderId`, which the request does not ask for (it should be plain text); "Bill to Location"/"Bill to Contact"/"Ship to Location"/"Ship to Contact" columns don't exist at all (only bare Account-level Bill to/Ship to columns exist); "Drop Ship", "Shipping", "Taxes", "Grand Total", "Issued Date", and "Ship Confirmed Date" columns don't exist; and "Expiration Date" is fetched into state (line 74) but never rendered as a column. All changes are frontend edits to `app/quotes/page.tsx` and `app/quotes/types.ts`; no new routes, no schema changes.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: Tailwind CSS, `Link` (Next.js), `SortableHeader`, `Pagination`, `useSortableData`, `useResizableColumns`, `formatCurrency()`/`formatDate()`/`displayCell()` — all existing in the codebase, same primitives used by every prior landing-page-correction feature (021-032)

**Storage**: N/A — read-only Salesforce data via `/api/salesforce/quotes?accountId=...&contactId=...` (no `action` param, unlike the quote-detail-page endpoint used by features 033/034); field-mapping happens client-side in a single `useEffect` in `page.tsx` (lines 47-88)

**Testing**: Visual/functional — run `npm run dev`, open the Customer Quotes landing page, and verify column order, labels, hyperlinks, sort, and pagination per `quickstart.md`

**Target Platform**: Browser (Next.js SSR + client components)

**Performance Goals**: No degradation — column reordering, new field mappings, and a corrected `colSpan` add negligible overhead; no new network calls

**Constraints**: No new API routes; no new SF Apex changes; no DB schema changes. New "Bill to Location"/"Bill to Contact"/"Ship to Location"/"Ship to Contact", "Drop Ship", "Shipping", "Taxes", "Grand Total", "Issued Date", and "Ship Confirmed Date" fields carry residual live-org field-availability risk — all degrade gracefully to "-" if unavailable, consistent with how features 031/033/034 handled equivalent risk.

**Scale/Scope**: 2 files touched (`app/quotes/page.tsx`, `app/quotes/types.ts`), 1 table, growing from 11 rendered data columns + Action to 23 rendered data columns + Action (24 total, matching FR-008)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | Reads continue to flow through the existing `/api/salesforce/quotes` endpoint; no new DB writes; new field references (Bill/Ship to Location/Contact, Drop Ship, Shipping, Taxes, Grand Total, Issued Date, Ship Confirmed Date) read from the same raw record shape already returned by the API |
| II — RBAC-First | ✅ PASS | No permission structure changed; the existing `isManufacturer`/`isRestricted` gating on Proposal #/Customer Order # links is preserved unchanged; removing the Customer PO hyperlink is a simplification (fewer gated links), not new gating logic |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes; `app/quotes/page.tsx` is a client component with no dynamic route params to unwrap |
| IV — Multi-Tenant Isolation | ✅ PASS | No org-scoped query logic changed; account/contact context continues to flow through the existing session-derived `SF_ACCOUNT_ID`/`SF_CONTACT_ID` |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | Targeted corrections to one existing table; reuses the exact `SortableHeader`/`Pagination`/`useSortableData`/`useResizableColumns` primitives already proven on this same page — no new abstractions |

No violations. No Complexity Tracking entry required.

**Post-design re-check** (after Phase 0/1 research): All column/label/hyperlink changes are UI-only edits to one existing page component and its shared types file; no other page imports from `app/quotes/page.tsx`. Removing the Customer PO hyperlink and splitting the Proposal column are both simplifications of existing logic, not new abstractions. All five principles remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/035-customer-quote-landing-corrections/
├── plan.md              # This file
├── research.md          # Phase 0 output — current-state audit
├── data-model.md        # Phase 1 output — field-mapping catalogue and column-order deltas
└── quickstart.md        # Phase 1 output — validation scenarios

(no contracts/ — this feature exposes no new API routes or external interfaces)
```

### Source Code (files in scope)

```text
app/quotes/page.tsx    # Column definitions, mappedQuotes mapping, useResizableColumns config,
                        # header/body rows, colSpan, Customer PO link removal, Proposal #/Name split
app/quotes/types.ts    # Quote interface additions (billToLocationName, billToContactName,
                        # shipToLocationName, shipToContactName, dropShip, shipping, taxes,
                        # grandTotal, shipConfirmedDate; issuedDate already declared but unused today)
```

**Structure Decision**: Single Next.js App Router project (existing structure, no new files) — same minimal-scope pattern as features 021-032, here touching one landing page and its shared types file.

## Complexity Tracking

No constitution violations — table not required.

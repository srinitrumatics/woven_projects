# Implementation Plan: Supplier Bill Landing Page Corrections

**Branch**: `043-supplier-bill-landing-corrections` | **Date**: 2026-07-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/043-supplier-bill-landing-corrections/spec.md`

## Summary

Correct the Supplier Bill landing page (`app/supplier-bills/page.tsx`): replace the "Supplier Name/DBA/Contact" columns with the correct "Ship to Account/Location/Contact" data (confirmed live to be an entirely different, currently-unused set of fields on the same record), split the single mis-gated "Proposal Name" column into a gated "Proposal #" hyperlink plus a plain "Proposal Name" column, fix the swapped/missing financial columns (Total Amount, Shipping, Grand Total each need their own distinct field mapping — two of the three fields are already fetched into component state but never rendered), add account-type gating to Customer Quote #/Proposal #/Customer Order # (currently ungated), remove the incorrect gating on Purchase Order # (currently gated, should be unconditional), add a real hyperlink to Supplier Bill # (currently relies on row-click only), add red/green color-coding to Open Balance (currently plain text), force headers to `truncate={false}`, and add the missing "Settled Date" column. Sticky Supplier Bill # column, pagination, and DESC default sort are already correct and must not regress. All changes are a pure frontend edit to one existing page component; no new routes, no schema changes.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router), React

**Primary Dependencies**: Tailwind CSS, `Link` (Next.js), `SortableHeader`, `useSortableData`, `Pagination`, `useResizableColumns`, `useUserSession`, `formatCurrency()`/`formatDate()`/`displayCell()` — all existing in the codebase, same primitives used by every prior table-correction feature (016-042)

**Storage**: N/A — read-only Salesforce data via `/api/supplier-bills?...&objectName=Supplier_Bill__c&tabName=Supplier_Bill` (used identically by this page today); confirmed live against this exact endpoint that every field this plan needs — `Ship_to_Account_Name`/`Ship_to_Account__c`, `Ship_to_Contact_Name`/`Ship_to_Contact__c`, `Authorized_Ship_To_Location_Name`, `Total_Product_Amount__c`, `Total_Shipping_Charges__c`, `TotalAmount__c`, `Proposal_Name`/`Proposal__c` — is actually present in the raw response, so this is a pure frontend mapping/rendering fix, not a data-availability risk

**Testing**: Visual/functional — run `npm run dev`, open the Supplier Bill landing page as both a Supplier-type and a Hybrid-type account, verify column order, labels, hyperlinks, gating, ship-to data, financial figures, color-coding, headers, pagination, and sort per `quickstart.md`

**Target Platform**: Browser (Next.js SSR + client components)

**Performance Goals**: No degradation — column relabeling/remapping and reusing the already-present `isManufacturer` computation (already imported via `useUserSession` on this page) add negligible overhead

**Constraints**: No new API routes; no new SF Apex changes; no DB schema changes; changes scoped to `app/supplier-bills/page.tsx` and its `SupplierBill` type in `app/supplier-bills/types.ts` (add a `shipToContact` field — `shipToAccount`/`shipToLocation` already exist in the type but are never populated from the API response today). No dedicated "proposal number" field exists separately from the Proposal's display name — "Proposal #" and "Proposal Name" both source from `Proposal_Name`, matching the already-shipped precedent in `POSupplierBillsTable.tsx` (feature 041).

**Scale/Scope**: 2 files touched (`page.tsx`, `types.ts`), 1 table, 21 column definitions (up from 15 today: -1 removed [Supplier Name], +7 added [Purchase Order #/Customer Quote #/Customer Order # label fixes aside, net-new: Proposal #, Ship to Location, Ship to Contact, Shipping, Grand Total, Settled Date] — Ship to Account replaces Supplier Name's slot)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Salesforce as Single Source of Truth | ✅ PASS | Reads continue to flow through the existing `/api/supplier-bills` endpoint; no new DB writes; all new field references read from the same raw record shape already returned by the API (confirmed live) |
| II — RBAC-First | ✅ PASS | No permission structure changed; `isManufacturer` is already computed on this page via `useUserSession` (line 161) — this feature only changes which three columns it gates (adding Proposal #, removing it from Purchase Order #) |
| III — Next.js 15 App Router Patterns | ✅ PASS | No new routes; modifying one existing client component only; no `params` involved (this is a non-dynamic landing route) |
| IV — Multi-Tenant Isolation | ✅ PASS | No org-scoped query logic changed |
| V — Simplicity & Phase-Driven Scope | ✅ PASS | Targeted correction to one existing page; reuses the exact `SortableHeader`/`useSortableData`/`Pagination`/`useResizableColumns`/`useUserSession`/`isManufacturer` primitives already used on this same page and proven elsewhere — no new abstractions |

No violations. No Complexity Tracking entry required.

**Post-design re-check** (after Phase 0/1 research): All column and gating changes are UI-only within `page.tsx`; the two `types.ts` additions (`shipToContact`, plus using already-declared `shipToAccount`/`shipToLocation`) are additive and don't affect any other consumer of `SupplierBill` (checked — only this page and `app/supplier-bills/[id]/page.tsx` import the type, and the detail page already independently defines/maps its own fields for its own view). All five principles remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/043-supplier-bill-landing-corrections/
├── plan.md              # This file
├── research.md          # Phase 0 output — current-state audit + live field-availability confirmation
├── data-model.md        # Phase 1 output — field-mapping catalogue and column-order delta
└── quickstart.md        # Phase 1 output — validation scenarios (including Supplier/Hybrid gating)

(no contracts/ — this feature exposes no new API routes or external interfaces)
```

### Source Code (files modified)

```text
app/supplier-bills/
├── page.tsx    # widths, mapping (ship-to/financial fields), header/body row, gating, color-coding
└── types.ts    # SupplierBill interface — add shipToContact field
```

**Structure Decision**: Single Next.js App Router project (existing structure, no new files) — same minimal-scope pattern as features 016-042, here touching one landing-page component that already owns its full data-fetch-to-render pipeline, plus its co-located type definition file.

## Complexity Tracking

No constitution violations — table not required.

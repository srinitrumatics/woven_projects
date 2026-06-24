# Data Model: Fix Invoice List Columns Invisible in Light Mode

**Feature**: `specs/004-fix-invoice-columns-light-mode`
**Date**: 2026-06-24

## No New Entities

This is a pure visual/styling fix. No new data entities, state, or API fields are introduced.

## Affected Render Paths

The following render paths in `app/invoices/page.tsx` are affected:

| Column | Condition | Element | Current Classes | Fix |
|--------|-----------|---------|-----------------|-----|
| Sales Order | Always | `<div>` (~line 522) | `text-sm font-medium` | + `text-gray-900 dark:text-white` |
| Purchase Order | `purchaseOrderId` falsy | Bare text (~line 539) | (none — inherits outer div) | Outer div fix covers this |
| Purchase Order | `purchaseOrderId` truthy + `isManufacturer` | `<span>` (~line 536) | `font-medium` | Outer div fix covers this |
| Purchase Order | `purchaseOrderId` truthy + not manufacturer | `<Link>` (~line 528) | `text-primary font-medium hover:underline` | Already correct — no change |

**Outer div fix** (~line 525): `<div>` gains `text-sm font-medium text-gray-900 dark:text-white` — all three PO paths are children of this div.

# Data Model: Shared Read-Only Field Component

No database schema, Drizzle table, or Salesforce object changes anywhere in this feature. This document captures the two new shared component APIs and how each existing call site's data maps onto them.

## `ReadOnlyField` (new — `components/ui/ReadOnlyField.tsx`)

| Prop | Type | Required | Notes |
|---|---|---|---|
| `label` | `string` | Yes | Rendered above the value, `title`-tooltipped |
| `value` | `any` | Yes | Already-resolved display value (fallback logic stays at the call site) |
| `href` | `string \| undefined` | No | When truthy, value renders as a real `<Link>`; when falsy/absent, renders as plain text |
| `className` | `string` | No | Appended to the outer wrapper `<div>` — layout/spacing override (grid `col-span`, margins) |
| `valueClassName` | `string` | No | Appended to the value box itself — used only for the Drop-Ship conditional-color case |

## `ReadOnlyTextArea` (new — `components/ui/ReadOnlyTextArea.tsx`)

| Prop | Type | Required | Notes |
|---|---|---|---|
| `value` | `any` | Yes | Already-resolved display value (each call site's own `|| "No special notes."` etc. fallback stays as-is) |
| `className` | `string` | No | Controls sizing — `h-full` for the 3 top-level Notes/Scope-Summary cards, `min-h-[200px]` for the 3 per-Line-Detail Notes boxes |

## Call-site migration map

### Single-line fields → `ReadOnlyField`

| File | Fields migrated | Current treatment | `href` used? |
|---|---|---|---|
| `app/invoices/[id]/components/InvoiceBillingInfo.tsx` | Bill to Account, Bill to Location, Billing Address, Payment Terms, Customer PO, Due Date | via `DetailInput` | Yes (2 of 6) |
| `app/invoices/[id]/components/InvoiceShippingInfo.tsx` | Ship to Account, Ship to Location, Shipping Address, Ship Confirmed Date, Site | via `DetailInput` | Yes (2 of 5) |
| `app/invoices/[id]/components/InvoiceCardDetail.tsx` (exports `InvoiceKeyDates`) | AR Rep, Proposal Name, Customer Order, Sales Order, Purchase Order | via `DetailInput` | Yes (4 of 5) |
| `app/invoices/[id]/lines/[lineid]/page.tsx` (~342-461) | Product Name, Description, Product Family, Brand, Taxable, Sales/Use/Local Tax Rate, GRT Rate (9 fields) | inline "Line Detail" treatment | No |
| `app/proposals/[id]/components/BillingInfo.tsx` | Bill to Account, Bill to Location, Billing Address, Payment Terms, Customer PO, Price Book | inline (Proposals treatment) | No |
| `app/proposals/[id]/components/ShippingInfo.tsx` | Ship to Account, Ship to Location, Shipping Address, Request Date, Drop-Ship (uses `valueClassName`), Site | inline (Proposals treatment) | No |
| `app/proposals/[id]/components/KeyDates.tsx` | Account Rep, Proposal Type, Issued Date, Expiration Date, Customer Order | inline (Proposals treatment) | No |
| `app/proposals/[id]/lines/[lineid]/page.tsx` (~744-871) | Same 9-field set as Invoice Line Detail | inline "Line Detail" treatment | No |
| `app/quotes/[id]/components/QuoteBillingInfo.tsx` | Bill to Account, Bill to Location, Billing Address, Payment Terms, Customer PO, Price Book | inline, uniquely grayed-out (`cursor-not-allowed`, `text-gray-500`) | No |
| `app/quotes/[id]/components/QuoteShippingInfo.tsx` | Ship to Account, Ship to Location, Shipping Address, Request Date, Drop-Ship (uses `valueClassName`), Site | inline (Quotes treatment) | No |
| `app/quotes/[id]/components/QuoteKeyDates.tsx` | Account Rep, Proposal Name, Customer Order, Issued Date, Expiration Date | inline (Quotes treatment) | No |
| `app/quotes/[id]/lines/[lineid]/page.tsx` (~482-608) | Same 9-field set as Invoice Line Detail | inline "Line Detail" treatment | No |
| `app/orders/[id]/lines/[lineId]/components/ProductInfo.tsx` | Product Name, Description, Product Family, Brand Name, Grouping, Taxable, MOQ, Lead-Time, Shipping Dimensions (9 fields) | inline, 7th distinct treatment | No |

### Notes/Scope-Summary boxes → `ReadOnlyTextArea`

| File | Content | Current treatment | Sizing className |
|---|---|---|---|
| `app/invoices/[id]/components/InvoiceNotes.tsx` | Invoice Notes | `<textarea disabled>` | `h-full` |
| `app/proposals/[id]/components/ProposalDetails.tsx` (~lines 47-51) | Proposal Notes | `<textarea readOnly>` | `h-full` |
| `app/proposals/[id]/components/ProposalDetails.tsx` (~lines 79-83) | Scope Summary | `<textarea readOnly>` | `min-h-[54px]` |
| `app/quotes/[id]/components/QuoteNotes.tsx` | Quote Notes | `<textarea disabled>` | `h-full` |
| `app/invoices/[id]/lines/[lineid]/page.tsx` (~lines 314-317) | Invoice Line Notes | `<div><p className="truncate">` | `min-h-[200px]` |
| `app/proposals/[id]/lines/[lineid]/page.tsx` (~722-726) | Proposal Line Notes | `<div><p className="truncate">` | `min-h-[200px]` |
| `app/quotes/[id]/lines/[lineid]/page.tsx` (~460-464) | Quote Line Notes | `<div><p className="truncate">` | `min-h-[200px]` |

### Deleted

| File | Reason |
|---|---|
| `app/invoices/[id]/components/DetailInput.tsx` | Fully superseded by `components/ui/ReadOnlyField.tsx` once its 3 call sites (`InvoiceBillingInfo.tsx`, `InvoiceShippingInfo.tsx`, `InvoiceCardDetail.tsx`) are migrated |

### Explicitly out of scope (verified, not touched)

`app/orders/[id]/components/BillingInfo.tsx`, `ShippingInfo.tsx`, `OrderNotes.tsx`, `DeliveryOptions.tsx`, `ShipToContact.tsx` — genuine editable forms with an `isEditing` prop and real `onChange` handlers, confirmed via source read to be a different pattern than the defect this feature targets.

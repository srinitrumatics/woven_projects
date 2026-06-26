# Research: Default Descending Table Sort & Fulfillment Tab Navigation Links

## Decision 1: Default Sort Field for Data Tables

**Decision**: Use `{ key: 'Name', direction: 'desc' }` as the universal default sort config for all entity tables.

**Rationale**:
- `Name` is the Salesforce naming field (`INV-00001`, `SO-00005`, etc.) present on every entity. Higher numbers correlate with more recently created records, so descending order by `Name` delivers "latest first" without needing a `CreatedDate` field in the fetched payload.
- Existing compliant tables (Proposals, Quotes, Invoices, Purchase Orders, Supplier Bills) already use entity-number fields in descending order — using `Name` for the remaining tables is consistent.
- Exception: the Proposals sub-tab in `FulfillmentTab.tsx` uses `Proposal_Number__c` as its primary display field (not `Name`) — for that specific table, `{ key: 'Proposal_Number__c', direction: 'desc' }` is the correct choice.

**Alternatives considered**:
- Sorting by `CreatedDate`: Not available in most fetched payloads; would require API changes.
- Sorting by the most-recently-updated date: Same issue — additional API payload required.

---

## Decision 2: Two Sort Patterns Identified — Different Fixes Required

**Decision**: Apply fixes differently based on the sort implementation pattern in each file.

**Pattern A — `useSortableData` hook** (majority of files):
- Current call: `useSortableData(data)` (default `null` sort config)
- Fix: `useSortableData(data, { key: 'Name', direction: 'desc' })`
- Hook signature: `useSortableData<T>(items: T[], config: SortConfig<T> | null = null)`
- The `useState(config)` inside the hook sets the initial sort on first render — providing a non-null config immediately activates descending order on mount.

**Pattern B — Custom inline `useState` sort** (quote and proposal detail pages):
- Current state: `useState<'asc' | 'desc'>('asc')` for sort direction
- Fix: Change initial value to `'desc'`
- Files using Pattern B:
  - `app/proposals/[id]/page.tsx` — 5 sort states (element, product, file, project, order)
  - `app/quotes/[id]/page.tsx` — 2 sort states (lines, taxes)
  - `app/quotes/[id]/components/QuoteFilesTab.tsx` — 1 sort state
  - `app/quotes/[id]/components/QuoteFulfillmentTab.tsx` — 3 sort states (sales orders, manifests, invoices)
  - `app/quotes/[id]/components/QuoteReturnsTab.tsx` — 4 sort states (RMA, CM, RTV, DM)
  - `app/quotes/[id]/components/QuotePurchasesTab.tsx` — 2 sort states (PO, bills)
  - `app/quotes/[id]/lines/[lineid]/components/QuoteLineFilesTab.tsx` — 1 sort state
  - `app/shipments/[id]/components/InventoryTab.tsx` — 1 sort state
  - `app/shipments/[id]/components/SerialNumbersTab.tsx` — 1 sort state

**Rationale**: The quote and shipment detail pages were built with a custom inline sort implementation instead of `useSortableData`. The fix requires changing the `useState` initial value rather than a hook argument.

---

## Decision 3: TypeScript Compatibility for Union-Typed Tables

**Decision**: `{ key: 'Name', direction: 'desc' }` is safe for all union-typed `useSortableData` calls.

**Rationale**:
- `useSortableData<Invoice | ShippingManifest | SalesOrder | CustomerQuote>` — `Name` exists on all four interfaces.
- `useSortableData<RMA | RTV | CreditMemo | DebitMemo>` — all Salesforce return types have `Name`.
- `useSortableData<PurchaseOrder | SupplierBill>` — same.
- `useSortableData<any>` — TypeScript accepts any key for `any`-typed tables.
- TypeScript enforces `keyof (A | B)` = `keyof A & keyof B`; since `Name` is a common field across all union members, there are no compile errors.

---

## Decision 4: Access Gating for FulfillmentTab Navigation Links

**Decision**: Use the same account-type-based gating as `Sidebar.tsx` to conditionally render entity names as links vs. plain text in the Fulfillment tab.

**Mechanism**:
- Import `useUserSession` and `usePermissions` into `FulfillmentTab.tsx`.
- Compute `typeCategory` from `selectedAccount?.Account_Record_Type__c` using the same mapping as `Sidebar.tsx` (Customer/NSO → "Customer"; Hybrid → "Hybrid"; partner types → "Partner").
- For each linkable column, only render an `<a>` tag when the destination route's `visibleFor` array includes `typeCategory`, OR `isSuperAdmin` is true.

**Sidebar `visibleFor` values for each destination**:
| Route | `visibleFor` | Accessible to |
|-------|-------------|---------------|
| `/proposals/{Id}` | `[""]` | Super Admin only |
| `/quotes/{Id}` | `[""]` | Super Admin only |
| `/shipments/{Id}` | `["Customer", "Hybrid"]` | Customer, NSO, Hybrid |
| `/invoices/{Id}` | `["Customer", "Hybrid"]` | Customer, NSO, Hybrid |
| `/sales-orders/` | Does not exist | Nobody — plain text always |

**Implication**: For standard (non-admin) users, Proposal and Quote links will render as plain text because their `visibleFor` is `[""]`. This is consistent with the sidebar hiding those sections from all non-admin users. Super Admin users will see all valid entity names as links.

**Alternative considered**: Always show links regardless of account type (relying on middleware for auth). Rejected because the `visibleFor: [""]` on Proposals/Quotes suggests intentional hiding from the portal UI. The plan follows the existing access pattern rather than bypassing it.

---

## Decision 5: Link Destination and Null Guard

**Decision**: Links use `href="/entity/{Id}"` with Next.js `<Link>` component. If `Id` is null/empty, render plain text.

**Pattern** (for each linkable entity in FulfillmentTab):
```
canLinkProposals = isSuperAdmin (visibleFor is [""])
canLinkQuotes    = isSuperAdmin (visibleFor is [""])
canLinkShipments = isSuperAdmin || ['Customer', 'Hybrid'].includes(typeCategory)
canLinkInvoices  = isSuperAdmin || ['Customer', 'Hybrid'].includes(typeCategory)
```

Null guard: `(canLink && entity.Id) ? <Link href={...}> : <span>`

---

## Complete File Inventory

### Pattern A — `useSortableData` without default sort (all add `{ key: 'Name', direction: 'desc' }`)

**Main list pages:**
- `app/orders/page.tsx:202`
- `app/shipments/page.tsx:180`
- `app/inventory/page.tsx:133`

**Order detail sub-tables** (all in `app/orders/[id]/components/`):
- `FulfillmentTab.tsx:119` → `{ key: 'Proposal_Number__c', direction: 'desc' }` (proposals)
- `FulfillmentTab.tsx:120` → `{ key: 'Name', direction: 'desc' }` (customer quotes)
- `FulfillmentTab.tsx:121` → `{ key: 'Name', direction: 'desc' }` (sales orders)
- `FulfillmentTab.tsx:122` → `{ key: 'Name', direction: 'desc' }` (shipping manifests)
- `FulfillmentTab.tsx:123` → `{ key: 'Name', direction: 'desc' }` (invoices)
- `FilesTab.tsx:47`
- `MyOrderTable.tsx:44`

**Proposal detail sub-tables** (all in `app/proposals/[id]/`):
- `components/TaxesTab.tsx:37`
- `components/PurchasesTab.tsx:40` (purchase orders)
- `components/PurchasesTab.tsx:41` (supplier bills)
- `components/ReturnsTab.tsx:47`
- `components/FulfillmentsTab.tsx:47`
- `lines/[lineid]/components/LineReturnsTab.tsx:50`
- `lines/[lineid]/components/LinePurchasesTab.tsx:28` (PO lines)
- `lines/[lineid]/components/LinePurchasesTab.tsx:29` (bill lines)
- `lines/[lineid]/components/LineFulfillmentsTab.tsx:41`

**Quote line detail sub-tables** (all in `app/quotes/[id]/lines/[lineid]/components/`):
- `QuoteLineReturnsTab.tsx:252`
- `QuoteLineFulfillmentsTab.tsx:209`
- `QuoteLinePurchasesTab.tsx:150`
- `QuoteLineTaxesTab.tsx:65`

**Shipment detail sub-tables** (all in `app/shipments/[id]/`):
- `components/ShipmentFilesTab.tsx:59`
- `lines/[lineid]/components/SerialNumbersTab.tsx:69`
- `lines/[lineid]/components/InventoryTab.tsx:79`
- `lines/[lineid]/components/FilesTab.tsx:70`

**Invoice detail sub-tables** (all in `app/invoices/[id]/components/`):
- `InvoiceLineItems.tsx:14`
- `InvoiceTaxes.tsx:44`
- `InvoiceCredits.tsx:19`
- `InvoicePayments.tsx:25` (receive payments)
- `InvoicePayments.tsx:26` (applied credit memos)
- `InvoiceFilesTab.tsx` (verify line on implementation)

**Purchase Order detail sub-tables** (all in `app/purchase-orders/[id]/components/`):
- `POLinesTable.tsx:53`
- `PORTVTable.tsx:55`
- `POSupplierBillsTable.tsx:58`
- `PODebitMemoTable.tsx:57`
- `POFilesTable.tsx:44`
- `POSerialNumbersTable.tsx` (verify line on implementation)

**Supplier Bill detail sub-tables** (all in `app/supplier-bills/[id]/components/`):
- `SupplierBillDebitsTab.tsx:34`
- `SupplierBillLinesTable.tsx:25`
- `SupplierBillPaymentsTab.tsx:37` (bill payments)
- `SupplierBillPaymentsTab.tsx:59` (applied debit memos)
- `SupplierBillFilesTable.tsx:32`

### Pattern B — Custom `useState` sort direction (change `'asc'` → `'desc'` initial value)

- `app/proposals/[id]/page.tsx` — `elementSortDirection`, `productSortDirection`, `fileSortDirection`, `projectSortDirection`, `orderSortDirection`
- `app/quotes/[id]/page.tsx` — `sortDirection` (lines), `taxSortDirection`
- `app/quotes/[id]/components/QuoteFilesTab.tsx` — `sortDirection`
- `app/quotes/[id]/components/QuoteFulfillmentTab.tsx` — `salesSortDirection`, `manifestSortDirection`, `invoiceSortDirection`
- `app/quotes/[id]/components/QuoteReturnsTab.tsx` — `rmaSortDirection`, `cmSortDirection`, `rtvSortDirection`, `dmSortDirection`
- `app/quotes/[id]/components/QuotePurchasesTab.tsx` — `purchaseSortDirection`, `billSortDirection`
- `app/quotes/[id]/lines/[lineid]/components/QuoteLineFilesTab.tsx` — `sortConfig.direction`
- `app/shipments/[id]/components/InventoryTab.tsx` — `sortDir`
- `app/shipments/[id]/components/SerialNumbersTab.tsx` — `sortDir`

### FulfillmentTab Link Additions (single file, dual changes)

- `app/orders/[id]/components/FulfillmentTab.tsx` — imports + link logic for 4 entity columns

**Total: ~51 targeted changes across approximately 43 files.**

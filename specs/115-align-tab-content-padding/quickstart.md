# Quickstart: Validate Align Tab Content Padding to p-6

## Prerequisites

- Dependencies installed (`npm install`) and dev server able to start (`npm run dev`).
- Logged in as any user with access to the object types under test (Salesforce-backed login per constitution Principle I; mock data fallback also works for a pure visual check).
- At least one record of each object type (Proposal, Order, Quote, Purchase Order, Supplier Bill, Invoice, Product, Shipment) with a line item, so line-detail pages can be reached.

## Setup

```bash
npm run dev
# open http://localhost:3000 and log in
```

## Validation Scenarios

Run each scenario after implementing the edits enumerated in `research.md`. See `spec.md` for the acceptance criteria being validated.

### Scenario 1 — Proposal detail page matches the reference screenshot (covers FR-001, FR-005, SC-001)

1. Open any Proposal detail page.
2. Select a top-level tab that shows nested sub-tabs and a table — e.g. **Fulfillment**, which shows Customer Quotes / Sales Orders / Shipping Manifests / Invoices.
3. **Expected**: The space around the top-level tab bar and the panel below it (sub-tabs + table) visually matches the padding used by other cards on the same page (e.g. Key Dates, Billing Information).

### Scenario 2 — Every object detail page matches the same standard (covers FR-001–FR-004, SC-001, SC-002)

For each of: Orders, Quotes, Purchase Orders, Supplier Bills, Invoices, Products, Shipments:

1. Open a detail page for that object type.
2. Switch between its top-level tabs.
3. **Expected**: The tab bar and content panel padding is visually identical to the Proposal detail page checked in Scenario 1 — no object type looks tighter than another.

### Scenario 3 — Line-item detail pages match too (covers FR-004)

For each of: Proposal line, Quote line, Purchase Order line, Supplier Bill line, Invoice line, Shipment line:

1. Navigate to a line item's detail page from its parent object.
2. Switch between its tabs.
3. **Expected**: Padding matches the standard from Scenario 1.

### Scenario 4 — Loading state matches loaded state (covers FR-006)

1. On a Proposal line detail page, throttle the network (browser devtools) or observe on first load.
2. Switch to the Taxes or Fulfillment tab while data is still loading.
3. **Expected**: No visible layout shift in padding once the loading spinner is replaced by loaded content.

### Scenario 5 — Admin and list-page tab filters match (covers FR-007)

1. Log into the admin portal and open **Authorize Locations**, then a location's **Delivery Windows** sub-page.
2. Separately, open the main portal's **Inventory** and **Shipments** list pages.
3. **Expected**: The card padding around each page's tab-style filters matches the standard from Scenario 1.

### Scenario 6 — No overflow regressions (covers SC-003)

1. Resize the browser to the app's smallest supported width (or use devtools responsive mode).
2. Repeat Scenario 1 on a narrow viewport.
3. **Expected**: No new horizontal or vertical scrollbar appears beyond what already existed before the padding change; tables still scroll horizontally within their own existing `overflow-x-auto` container, not the page.

## Static Checks

```bash
npx tsc --noEmit -p tsconfig.json
```

Expect zero errors — className string edits should not affect type-checking, so any error indicates an unrelated typo introduced during editing (e.g. a broken JSX tag).

## Sign-off

Feature is considered validated when all 6 scenarios pass across every object type, every line-detail page, both admin pages, and the two additional list pages (Inventory, Shipments), with no overflow regressions at the smallest supported breakpoint.

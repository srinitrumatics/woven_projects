# Quickstart: Validate Proposal # Columns Show the Proposal Number

## Prerequisites

- Dev server running (`npm run dev`, http://localhost:3000)
- A logged-in session with access to at least one proposal whose linked Salesforce record has both a `Name` and a populated `Proposal_Number__c` (format `PRP-YY-MM-NNNNNN`)
- If Salesforce credentials are not configured locally, the app falls back to mock data automatically (per `lib/salesforce-service.ts`) — verify the mock data for the affected domains includes a distinct `Proposal_Number__c` value so the fix is visible even without a live SF connection

## Validation Scenarios

For each page below, confirm the "Proposal #" column shows a `PRP-...` style value that is **different** from the adjacent "Proposal Name" column (see [data-model.md](./data-model.md) for the field mapping and [spec.md](./spec.md) User Story 1 / Acceptance Scenarios for the full behavioral contract):

1. **Quotes list** (`/quotes`) — "Proposal #" vs "Proposal Name" columns.
2. **Quote detail sub-tabs** (`/quotes/[id]`) — Invoices, Credit Memos, RMA, Sales Orders, Shipping Manifests sub-tabs.
3. **Invoices list** (`/invoices`) and **Invoice detail → Credits tab** (`/invoices/[id]`).
4. **Purchase Orders list** (`/purchase-orders`) and detail sub-tables (Debit Memo, RTV, Supplier Bills).
5. **Supplier Bills list** (`/supplier-bills`) and detail → Debits tab.
6. **Shipments list** (`/shipments`).
7. **Orders list** (`/orders`).
8. **Proposal detail** (`/proposals/[id]`) → Fulfillments tab (4 sub-tables: quotes/sales/invoices/shipping) and Returns tab.

## Expected Outcome

- Every "Proposal #" cell shows the `PRP-YY-MM-NNNNNN`-style value (SC-001, SC-002).
- Every adjacent "Proposal Name" column (where present) is unchanged (FR-004).
- For any record with a blank `Proposal_Number__c`, the "Proposal #" cell falls back to showing the Name rather than blank (FR-006).
- Existing sort/click-through/link behavior on all affected tables still works (FR-008, SC-003).
- Already-correct pages (`/proposals`, `/proposals/[id]` own header, `/orders/[id]` Fulfillment/Returns tabs) show no change in behavior (Acceptance Scenario 4).

## Regression Check

Run `npx tsc --noEmit -p tsconfig.json` after implementation — must be clean, consistent with the verification approach used for prior specs (063–065) in this same file/area.

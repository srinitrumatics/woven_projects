# Quickstart: Validating Customer Quote Landing Page Corrections

## Prerequisites

- Valid Salesforce credentials configured, or rely on mock-data fallback.
- A logged-in session with an account that has more than 10 Customer Quote records (to exercise pagination), and at least one quote with a populated Proposal, Customer Order, distinct Bill To/Ship To Account/Location/Contact values, a populated Drop Ship flag, and populated Shipping/Taxes/Grand Total/Issued Date/Expiration Date/Ship Confirmed Date.

## Setup

```bash
npm run dev
```

Navigate to `/quotes` (the Customer Quotes landing page) after logging in via `/auth`.

## Validation scenarios

### 1. Page header and layout (FR-001 through FR-003, FR-006; SC-001, SC-002, SC-011)

- Confirm the page heading reads "Customer Quotes."
- Confirm every column header displays its full label on a single line — no wrapping, no ellipsis.
- Confirm long cell content may truncate with ellipsis.
- Scroll the table horizontally and confirm the "Customer Quote #" column remains pinned in view.

### 2. Column order and labels (FR-008; SC-003)

- Confirm columns appear in this exact order: Customer Quote #, Status, Proposal #, Proposal Name, Customer Order #, Customer PO, Bill to Account, Bill to Location, Bill to Contact, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Shipping, Taxes, Grand Total, Issued Date, Expiration Date, Request Date, Planned Ship Date, Ship Confirmed Date, Action.

### 3. Hyperlinks and the Proposal split (FR-009, FR-010; SC-004, SC-005)

- Click a populated "Customer Quote #" value → confirm navigation to `/quotes/{id}`.
- Click a populated "Proposal #" value → confirm navigation to `/proposals/{id}`; confirm the adjacent "Proposal Name" cell shows the same proposal's name as plain, non-clickable text.
- Click a populated "Customer Order #" value → confirm navigation to `/orders/{id}`.
- Confirm a populated "Customer PO" value renders as plain text (not a link) — correcting its prior link to a purchase order.

### 4. Distinct Bill To / Ship To fields and Drop Ship (FR-011, FR-012; SC-006)

- Find (or seed) a quote with distinct Bill To Account, Bill To Location, and Bill To Contact values in Salesforce.
- Confirm each of the three columns shows its own value, not a repeated value. Repeat for the Ship To trio.
- Confirm "Drop Ship" renders a Yes/No indicator.

### 5. New financial and date columns (FR-013, FR-014; SC-007, SC-008)

- Find a quote with populated Shipping, Taxes, and Grand Total values that differ from each other and from Total Price.
- Confirm each of the three columns shows its own correct, independently distinct figure.
- Confirm "Issued Date", "Expiration Date", and "Ship Confirmed Date" each show correct, non-blank values distinct from "Request Date" and "Planned Ship Date" for a quote where all five dates are populated.

### 6. Pagination and default sort (FR-004, FR-005; SC-009, SC-010)

- With more than 10 quotes, confirm pagination controls appear and only 10 rows show per page.
- On first load (no manual sort applied), confirm the highest Customer Quote # appears first.

### 7. Null handling (FR-007; SC-012)

- Find a quote with an unpopulated field (e.g. no Ship to Contact, or no Grand Total).
- Confirm the cell displays "-" rather than blank or a raw null.

## Expected outcome

All seven scenarios pass once the corrective edits described in `data-model.md` are applied to `app/quotes/page.tsx` and `app/quotes/types.ts`. Fields with residual live-org verification risk (Shipping, Taxes, Grand Total, Issued Date) should degrade to "-" gracefully if unavailable in the live org rather than crashing or showing raw nulls.

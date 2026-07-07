# Quickstart: Validating Orders Landing Page Corrections

## Prerequisites

- Valid Salesforce credentials configured (`SF_CLIENT_ID`, `SF_CLIENT_SECRET`, `SF_USERNAME`, `SF_PASSWORD`, `SF_TOKEN`, `SF_URL`), or rely on mock-data fallback.
- A logged-in session with an account that has more than 10 Customer Order records (to exercise pagination), and at least one order with a populated Proposal, distinct Bill To/Ship To Account/Location/Contact values, and a populated Drop Ship flag.

## Setup

```bash
npm run dev
```

Navigate to `/orders` (the Orders landing page) after logging in via `/auth`.

## Validation scenarios

Each scenario maps to an acceptance scenario / functional requirement in `spec.md`.

### 1. Header layout (FR-001, FR-002; SC-001)

- Confirm every column header displays its full label on a single line — no wrapping, no ellipsis.
- Confirm long cell content (e.g. a long Bill to Account name) may truncate with ellipsis.

### 2. Sticky first column (FR-003; SC-002)

- Scroll the table horizontally.
- Confirm the "Customer Order #" column remains pinned in view.

### 3. Column order and labels (FR-007; SC-003)

- Confirm columns appear in this exact order: Customer Order #, Status, Proposal #, Proposal Name, Customer PO, Bill to Account, Bill to Location, Bill to Contact, Ship to Account, Ship to Location, Ship to Contact, Drop Ship, Total Lines, Total Price, Request Date, Create Date, Action.

### 4. Hyperlinks (FR-008; SC-004)

- Click a populated "Customer Order #" value → confirm navigation to `/orders/{id}`.
- Click a populated "Proposal #" value → confirm navigation to `/proposals/{id}`.

### 5. Distinct Bill To / Ship To fields (FR-009; SC-005)

- Find (or seed) an order with distinct Bill To Account, Bill To Location, and Bill To Contact values in Salesforce.
- Confirm each of the three columns shows its own value, not a repeated value. Repeat for the Ship To trio.

### 6. Drop Ship and Create Date (FR-010, FR-011)

- Confirm "Drop Ship" renders as a Yes/No indicator.
- Confirm "Create Date" differs from "Request Date" for a record where both are populated.

### 7. Pagination (FR-004; SC-006)

- With more than 10 orders, confirm pagination controls appear and only 10 rows show per page.
- Navigate to page 2 and back to page 1; confirm records display correctly.

### 8. Default sort (FR-005; SC-007)

- On first load (no manual sort applied), confirm the highest Customer Order # (Record ID) appears first.

### 9. Null handling (FR-006; SC-008)

- Find a record with an unpopulated field (e.g. no Ship to Contact).
- Confirm the cell displays "-" rather than blank or a raw null.

## Expected outcome

All nine scenarios pass with no code changes, since `app/orders/page.tsx` already implements every requirement (see `research.md`). If any scenario fails, that is a regression from the state audited during planning — file it as a corrective task scoped to `app/orders/page.tsx`.

# Quickstart: Validating Inventory Landing Page & Inventory Details Page Corrections

## Prerequisites

- Valid Salesforce credentials configured, or rely on mock-data fallback.
- Access to an account with more than 10 inventory items (for pagination) and, ideally, an inventory item with Qty Available at 0 and one with a negative Qty Available (data anomaly) to validate the color-logic fix. If a negative value cannot be seeded, code inspection of the corrected comparison (`< 1`) is an acceptable substitute per this feature's narrow scope.

## Setup

```bash
npm run dev
```

Navigate to `/inventory` (My Inventory) and drill into a product's Inventory Details page after logging in via `/auth`.

## Validation scenarios

### 1. My Inventory — column layout and existing-correct behavior (US1, US3, US4; FR-001 through FR-009; SC-001 through SC-005, SC-011, SC-012)

- Confirm columns appear in order: Product Name, Description, Brand Name, Product Family, Qty On Hand, Qty Available, Avg Unit Price, Total OH Value, Total CV (IN), Total CV (SQFT), Avg Age (Days), Total Positions, Sites, Action.
- Confirm headers render full-text single-line; confirm the Product Name column stays pinned while scrolling.
- Click a Product Name value → confirm navigation to that product's inventory detail page.
- Confirm Brand Name shows a real value for an item with brand data populated.
- Confirm Total OH Value renders as non-bold text.
- Confirm pagination controls appear with more than 10 items, and default sort shows Product Name descending on first load.

### 2. My Inventory — the two corrected defects (US1; FR-010, FR-011; SC-006, SC-008)

- Find or seed an item with Qty Available = 0 → confirm it renders red.
- Find or seed an item with Qty Available < 0 → confirm it now renders red (previously would have rendered green).
- Find or seed an item with Qty Available > 0 → confirm it renders green.
- Trigger the empty state (e.g. search for a non-existent item) → confirm the message row spans the full table width with no visual gap or overflow (colSpan now matches the 15 actual columns).

### 3. Inventory Details — column layout and existing-correct behavior (US2, US3, US4; FR-001 through FR-008, FR-012 through FR-014; SC-001 through SC-003, SC-006, SC-007, SC-009 through SC-012)

- Confirm columns appear in order: Inventory Position ID, Received Date, Age (Days), PO # | RMA #, Supplier Name, Qty on Hand, Qty Available, On Hold, Unit Price, Total OH Value, Total CV (IN), Total CV (SQFT), Sales Order #, Shipping Manifest, Condition, Invoiced, Location, Site.
- Confirm headers render full-text single-line; confirm Inventory Position ID stays pinned while scrolling.
- Find a position with only an RMA (no PO) → confirm the PO # | RMA # column shows the RMA value.
- Confirm the "Shipping Manifest" header reads with a space between the words.
- Confirm Total OH Value renders as non-bold text.
- Confirm Qty Available renders red at 0 and below, green above 0 (already correct — verify no regression).
- Confirm pagination controls appear with more than 10 positions, and default sort shows Inventory Position ID ascending on first load.

## Expected outcome

All scenarios pass. Scenario 2 is the only one exercising genuinely new behavior; scenarios 1 and 3 confirm that the already-correct implementation from spec 026 is unaffected by this feature's two isolated fixes.

# Phase 1 Data Model: Supplier Bill Landing Page Corrections

## `page.tsx` — Supplier Bill column set

| # | Column (target) | Source field | Hyperlink behavior |
|---|---|---|---|
| 1 | Supplier Bill # | `Name` (mapped `name`) | **New unconditional hyperlink** → `/supplier-bills/{id}` (currently plain text; row-level `onClick` navigation stays as a convenience but a real `Link` is added to the cell itself) |
| 2 | Status | `Status__c` (mapped `status`) | None (status badge) |
| 3 | Purchase Order # | `Purchase_Order_Name`/`Purchase_Order__c` (mapped `purchaseOrderName`/`purchaseOrderId`) | **Gating removed** — unconditional hyperlink → `/purchase-orders/{purchaseOrderId}` regardless of account type (was incorrectly wrapped in `!isManufacturer`) |
| 4 | Customer Quote # | `Customer_Quote_Name`/`Customer_Quote__c` (mapped `customerQuoteName`/`customerQuoteId`) | Unchanged — already correctly gated: plain text for Supplier, hyperlink → `/quotes/{customerQuoteId}` for non-Supplier |
| 5 | Proposal # | `Proposal_Name` (fallback; no dedicated number field — see research.md), `Proposal__c` | **New column** — gated hyperlink → `/proposals/{proposalId}` for non-Supplier, plain text for Supplier |
| 6 | Proposal Name | `Proposal_Name` (mapped `proposalName`) | **Split from the old combined column** — always plain text, never a hyperlink, regardless of account type |
| 7 | Customer Order # | `Customer_Order_Name`/`Customer_Order__c` (mapped `customerOrderName`/`customerOrderId`) | Unchanged — already correctly gated |
| 8 | Ship to Account | `Ship_to_Account_Name` (**new mapping** `shipToAccount`) | None — **replaces "Supplier Name"**, which showed the wrong (supplier's own) identity |
| 9 | Ship to Location | `Authorized_Ship_To_Location_Name` (**new mapping**, use existing `shipToLocation` field) | None — **new column**, was entirely absent |
| 10 | Ship to Contact | `Ship_to_Contact_Name` (**new mapping**, new `shipToContact` field added to `SupplierBill` type) | None — **new column**, was entirely absent (replaces "Supplier Contact") |
| 11 | Total Lines | `Total_Lines__c` (mapped `totalLines`) | None — unchanged |
| 12 | Total Amount | `Total_Product_Amount__c` (mapped `totalProductAmount` — already fetched, was unused; **becomes the rendered value for this header**) | None |
| 13 | Shipping | `Total_Shipping_Charges__c` (mapped `totalShippingCharges` — already fetched, was unused) | **New column** |
| 14 | Grand Total | `TotalAmount__c` (mapped `totalAmount` — this is the value currently mislabeled under "Total Amount") | **New column**, correctly relabeled |
| 15 | Billed Date | `Billed_Date__c` (mapped `billedDate`) | None — unchanged |
| 16 | Payment Terms | `Payment_Terms__c` (mapped `paymentTerms`) | None — unchanged |
| 17 | Due Date | `Due_Date__c` (mapped `dueDate`) | None — unchanged |
| 18 | Remittance Status | `Remittance_Status__c` (mapped `remittanceStatus`) | None — color-coding already correct (Paid=green, Pending=amber/yellow, Past Due=red via existing `RemittanceBadge`) |
| 19 | Open Balance | `Open_Balance__c` (mapped `openBalance`) | **New color-coding**: red when `> 0`, green when `<= 0` (currently static gray text) |
| 20 | Settled Date | `Settled_Date__c` (mapped `settledDate` — already fetched, was unused) | **New column** |
| 21 | Action | *(n/a — existing view-icon button)* | None — unchanged |

**Removed** (present today, not in the target list): "Supplier Name" (`supplierName`, sourced from `Supplier_Name`) — the supplier's own identity, wrongly shown where ship-to data belongs.

**Gating**: `useUserSession`/`isManufacturer` is already imported and computed on this page (line 44, 161) — no new import needed. Apply the existing `!isManufacturer` ternary pattern to the new Proposal # column; remove it from Purchase Order #.

**Interface additions** (`SupplierBill` type in `app/supplier-bills/types.ts`): add `shipToContact: string;` (alongside the already-declared but currently-unused `shipToAccount`/`shipToLocation`); add `proposalNumber?: string;` for the Proposal # fallback pattern (mirrors `POSupplierBillsTable.tsx`'s local interface — here it's the shared page-level `SupplierBill` type instead of a component-local interface, but the same fallback-to-`Proposal_Name` behavior applies).

## Key Entities

Unchanged from spec.md — Supplier Bill, Ship to Account/Location/Contact, Proposal (as two distinct display columns).

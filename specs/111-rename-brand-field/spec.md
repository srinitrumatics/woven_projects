# Feature Specification: Product Brand Field Rename (`Product_Brand_Name__c` → `Brand_Name__c`)

**Feature Branch**: `111-rename-brand-field`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "search this field 'Product_Brand_Name__c' in all pages across the web app and replcae this 'Brand_Name__c'"

## Summary

The Salesforce org has renamed the custom field that stores a product's brand name from `Product_Brand_Name__c` to `Brand_Name__c` (and, on the namespaced product-sync object, from `gtherp__Product_Brand_Name__c` to `gtherp__Brand_Name__c`). Every place in the web app that reads, queries, or types this field by its old API name must be updated to the new name so Brand Name keeps displaying correctly everywhere it does today — on Order, Invoice, Proposal, Quote, Purchase Order, Shipment, Supplier Bill, and Inventory line items, and in the Product Catalog / Configure Order flows.

Note: Salesforce field API names (`Product_Brand_Name__c`, `Brand_Name__c`, `gtherp__Brand_Name__c`) are quoted directly below because they are the integration target the user's request specifies — the actual requirements remain behavior-focused (what must keep displaying correctly), not an implementation prescription.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Brand Name keeps displaying on line-item pages (Priority: P1)

A user views an Order, Invoice, Proposal, Quote, Purchase Order, Shipment, Supplier Bill, or Inventory line-item page. The Brand Name for each product line continues to show its correct value after the Salesforce field rename, exactly as it did before the rename.

**Why this priority**: These are the highest-traffic, most business-critical pages, and a prior history of "brand name missing" bugs on this exact field (fixed across multiple earlier commits) shows this value is easy to silently break. This is the core regression the rename must avoid.

**Independent Test**: Open any Order/Invoice/Proposal/Quote/Purchase Order/Shipment/Supplier Bill/Inventory line-item page for a product that has a brand value in Salesforce. Confirm the Brand Name column/field shows that value, not blank or a dash placeholder.

**Acceptance Scenarios**:

1. **Given** a product line with a brand value set in Salesforce, **When** a user opens its line-item detail or list page, **Then** the Brand Name is displayed with that value.
2. **Given** the Salesforce field has been renamed, **When** any page that previously read the old field name loads, **Then** it reads the new field name and shows the same brand value as before the rename.

---

### User Story 2 - Brand Name keeps displaying in the Product Catalog and Configure Order flows (Priority: P1)

A user browses the Product Catalog, views a product's detail page, or browses the catalog panel inside Configure Order. The Brand Name / Manufacturer filter and displayed value continue to work correctly after the rename.

**Why this priority**: The catalog and Configure Order rely on a separate sync/search pipeline (product load + Algolia) from the line-item pages in User Story 1; both pipelines reference the old field name and both must be corrected for brand data to stay accurate app-wide.

**Independent Test**: Browse the Product Catalog and the Configure Order "Browse Catalog" panel; confirm brand values and the brand/manufacturer filter still populate and filter correctly for products that have a brand set in Salesforce.

**Acceptance Scenarios**:

1. **Given** the product sync pipeline pulls data from Salesforce, **When** it queries product records, **Then** it retrieves the brand value using the renamed field and the sync completes without errors.
2. **Given** a product with a brand value, **When** a user views it in the Product Catalog or Configure Order catalog panel, **Then** the brand value displayed matches what is stored in Salesforce.

---

### Edge Cases

- Some places already read the brand value through a fallback chain that lists both the old and new field names together (e.g. `... ?? Brand_Name__c ?? Product_Brand_Name__c`). After the rename, these must not be left with the new name listed twice in the same fallback chain — that is dead, confusing code, even though it wouldn't cause a visible bug.
- The product-sync SOQL query text and TypeScript field-name declarations must be updated consistently with the object-property reads, so there is no mismatch between what is queried/typed and what is read at runtime.
- No other, unrelated Salesforce field names (e.g. `Manufacturer_DBA__c`, `Brand_Name__r`) are touched by this change.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every reference to the Salesforce field `Product_Brand_Name__c` (object-property access, SOQL query text, and TypeScript type/interface declarations) across the web app MUST be updated to reference `Brand_Name__c` instead.
- **FR-002**: Every reference to the namespaced variant `gtherp__Product_Brand_Name__c` MUST be updated to `gtherp__Brand_Name__c`.
- **FR-003**: Brand Name MUST continue to display its correct value, with no regression, on every page that displays it today: Order, Invoice, Proposal, Quote, Purchase Order, Shipment, Supplier Bill, and Inventory line-item pages, plus the Product Catalog, Product Detail, and Configure Order pages.
- **FR-004**: The product-sync pipeline's Salesforce query MUST select the renamed field so brand data continues to flow into the catalog/search index without interruption.
- **FR-005**: Where the old and new field names previously appeared together in the same fallback expression, the resulting duplicate reference to the new field name MUST be reduced to a single reference, preserving the existing fallback order for all other field names in that expression.
- **FR-006**: No Salesforce field name other than `Product_Brand_Name__c` / `gtherp__Product_Brand_Name__c` is in scope for this change.

### Key Entities

- **Product Brand Field**: The Salesforce custom field that stores a product's brand name, read by line-item and catalog pages throughout the web app. Prior name: `Product_Brand_Name__c` (namespaced sync variant: `gtherp__Product_Brand_Name__c`). New name: `Brand_Name__c` (namespaced sync variant: `gtherp__Brand_Name__c`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero remaining references to the old field name (`Product_Brand_Name__c` / `gtherp__Product_Brand_Name__c`) exist anywhere in the web app codebase after the change.
- **SC-002**: 100% of pages that displayed Brand Name before the change (Orders, Invoices, Proposals, Quotes, Purchase Orders, Shipments, Supplier Bills, Inventory, Product Catalog, Product Detail, Configure Order) display the same brand values after the change, with no new blank/missing brand values.
- **SC-003**: The product-sync pipeline completes successfully with no errors related to an unknown or missing field.
- **SC-004**: No fallback expression in the codebase contains the same field name listed more than once.

## Assumptions

- The Salesforce org has already renamed the underlying field's API name from `Product_Brand_Name__c` to `Brand_Name__c` (and the namespaced sync variant accordingly); this is a fact about the live org supplied by the user and is not independently verified from within this repository.
- The rename is the same field renamed consistently everywhere it was exposed (every Apex REST endpoint and the SOQL-queried product object used for catalog sync) — not two unrelated fields that happen to share old/new names.
- This is a pure field-reference rename with no new business logic; the app's own internal variable/prop names (e.g. `brand`, `brandName`) that the field value is mapped into are unaffected and out of scope.
- Matching is on the literal Salesforce field-name string wherever it is used as a field key (object-property access, SOQL query text, TypeScript declarations); incidental mentions in comments are updated for consistency where encountered, but auditing prose/documentation outside the source code is out of scope.

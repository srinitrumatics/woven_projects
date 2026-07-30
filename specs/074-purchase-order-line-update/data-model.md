# Data Model: Save Tracking Number and Promise Date on Purchase Order Line

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

No new entities or tables are introduced. This feature operates on a narrow subset of the existing **Purchase Order Line** entity (already modeled in `app/purchase-orders/types.ts` as `PurchaseOrderLine`, and already sourced from Salesforce's `Purchase_Order_Line__c` object).

## Entity: Purchase Order Line (subset in scope)

| Field (client) | Salesforce API name | Type | Editable? | Notes |
|---|---|---|---|---|
| `id` | `Id` | string | N/A (identifier) | Already loaded; used unchanged to target the record being saved. |
| `status` | `Status__c` | string | Read-only via this feature | Governs whether the two fields below are editable at all (Draft / Approved / Awarded = editable; any other value = read-only). Never written by this feature. |
| `trackingNumber` | `Tracking_Number__c` | string, optional | **Yes** | Free-text shipment tracking identifier. May be saved as empty/blank (Edge Cases). |
| `promiseDate` | `Promise_Date__c` | date string (`YYYY-MM-DD`), optional | **Yes** | Supplier-promised delivery date. May be saved as empty/blank (Edge Cases). |

All other `PurchaseOrderLine` fields (product info, cost/qty fields, other dates, notes, related-record ids, etc.) are out of scope and MUST NOT be included in, or altered by, the save request (FR-003).

## Validation Rules

- **VR-001**: A save request is only valid when the target line's current `status` is `Draft`, `Approved`, or `Awarded`. (FR-002, FR-009)
- **VR-002**: A save request MUST include at least one of `trackingNumber` / `promiseDate`; it targets exactly one line, identified by `id`. (FR-007)
- **VR-003**: A save request MUST include the requesting account/contact context (`accountId`, `contactId`) already established on the page. (FR-008)
- **VR-004**: Omitting one of the two fields from a save request MUST leave that field's persisted value unchanged — it MUST NOT be sent as blank/null unless the user explicitly cleared it. (FR-005)
- **VR-005**: An empty string is a valid value for either field, representing an intentional clear. (Edge Cases)

## State / Lifecycle

No new state machine is introduced. The line's `status` lifecycle (Draft → Approved/Awarded → later terminal states) is owned entirely by existing upstream processes and is unaffected by this feature — this feature only reads `status` to decide editability, per the rule that already governs the existing read-only rendering.

## Derived UI State (page-local, not persisted)

| State | Source | Purpose |
|---|---|---|
| `trackingNumber`, `promiseDate` (existing `useState`) | Initialized from the loaded line on fetch; edited via the existing controlled inputs | Holds the user's in-progress edit; on failed save, retained as-is (not reset) so the user can retry (FR-006). |
| Save-in-flight / save-error (new, page-local) | Set when a save request is issued / rejected | Drives the failure indication in User Story 3; cleared on the next successful save or new edit attempt. |

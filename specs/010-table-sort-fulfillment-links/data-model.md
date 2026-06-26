# Data Model: Default Descending Table Sort & Fulfillment Tab Navigation Links

## Assessment

This feature is a **pure UI change**. It involves no new data entities, no new database tables, no new API endpoints, and no changes to existing data structures.

All data fetched for the affected components remains unchanged. The only modifications are:
1. How fetched data is sorted before rendering (client-side).
2. Whether certain cells render as plain text or as navigation links.

## Existing Entities Referenced (No Changes)

The following Salesforce entities are already fetched by existing API routes and are referenced in the FulfillmentTab link logic. No new fields or queries are required.

| Entity | Portal Route | Identifier Field | Current API Source |
|--------|-------------|------------------|--------------------|
| Proposal | `/proposals/{Id}` | `Id` | `Proposal__c` in orders fulfillment API |
| Customer Quote | `/quotes/{Id}` | `Id` | `Customer_Quote__c` in orders fulfillment API |
| Sales Order | No portal route | `Id` | `Sales_Order__c` in orders fulfillment API |
| Shipping Manifest | `/shipments/{Id}` | `Id` | `Shipping_Manifest__c` in orders fulfillment API |
| Invoice | `/invoices/{Id}` | `Id` | `Invoice__c` in orders fulfillment API |

## Sort Config (Existing Type — No Changes)

The `SortConfig<T>` type is already defined in `hooks/useSortableData.ts`:

```ts
interface SortConfig<T> {
  key: keyof T;
  direction: 'asc' | 'desc';
}
```

No changes to this type are needed. The feature simply passes concrete values where previously `null` was passed.

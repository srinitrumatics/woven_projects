# Data Model: Remove "Editable" Tag and Align Field Styling on Purchase Order Line Page

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Summary

No data model changes. This feature is presentation-only (JSX markup and Tailwind class names on an existing page) and introduces, modifies, or removes no entity, field, request/response shape, or persisted record.

## Existing entity referenced (unchanged)

- **Purchase Order Line** (`lib/purchase-order-service.ts`, `PurchaseOrderLine` type in `app/purchase-orders/types.ts`): the two fields visually affected by this feature — `promiseDate` and `trackingNumber` — are read from and written to exactly as before. Their type, validation, and status-based editability rule (`status === "Draft" || "Approved" || "Awarded"`) are unchanged.

No new entities, attributes, or relationships are introduced.

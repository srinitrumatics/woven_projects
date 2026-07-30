# Contracts: Remove "Editable" Tag and Align Field Styling on Purchase Order Line Page

**Feature**: [spec.md](../spec.md) | **Plan**: [plan.md](../plan.md)

## Summary

No contract changes. This feature does not add, remove, or modify any API route, request schema, or response schema.

The existing `PATCH /api/purchase-orders?lineId=...&purchaseOrderId=...` endpoint (used by `handleSaveLine` in `app/purchase-orders/[id]/lines/[lineid]/page.tsx`) and the existing `GET /api/purchase-orders?...&action=lines` endpoint (used to load line data) are exercised by this page exactly as they are today, with no change to the request body shape, query parameters, or response handling. This feature is scoped entirely to markup/styling and does not touch `lib/purchase-order-service.ts` or `app/api/purchase-orders/route.ts`.

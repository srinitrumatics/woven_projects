# Data Model: Post-Order Creation Redirect

**Feature**: 002-post-order-redirect
**Date**: 2026-06-24

> This feature introduces no new data entities. It is a pure UI navigation change.

## Relevant Existing Entities

### Order (`Customer_Order__c`)

The redirect destination is derived from the Order's ID. No new fields are read or written.

| Field | Used By | Purpose |
|-------|---------|---------|
| `Id` | Redirect destination | Forms the URL `/orders/{Id}` |

### Navigation State

| State | Value | Notes |
|-------|-------|-------|
| Redirect path (add to existing) | `/orders/{selectedOrderId}` | Uses the selected draft order's ID |
| Redirect path (create new) | `/orders/{newOrderId}` | Uses the newly created order's ID extracted from the POST response |

## No Schema Changes

No new Drizzle migrations or PostgreSQL tables are required. No new Salesforce fields are read or written.

# Data Model: Table Empty/Null Dash Display

**Feature**: 015-table-null-dash  
**Date**: 2026-06-27

## Overview

This feature is a **presentation-layer change only**. No new database tables, Salesforce objects, API endpoints, or data structures are introduced or modified. The change lives entirely in how existing values are rendered inside table cells.

## Relevant Types

### `displayCell` input type

```
CellValue = string | null | undefined
```

Callers pass the raw field value from the mapped Salesforce record object. The function outputs a `string` (either the original value or `"-"`).

### Updated formatter signatures

| Function | Before | After |
|----------|--------|-------|
| `formatCurrency(amount, currency?, decimals?)` | `amount: number` | `amount: number \| null \| undefined` |
| `formatNumber(value, decimals?)` | `value: number` | `value: number \| null \| undefined` |
| `formatDate(dateString, format?)` | unchanged signature | unchanged signature (null guard updated) |
| `formatTime(timeString)` | unchanged signature | unchanged signature (null guard updated) |

## Validation Rules

| Rule | Description |
|------|-------------|
| Null/undefined → "-" | Any null or undefined string/number field shows "-" |
| Empty string → "-" | A field that is `""` shows "-" |
| Whitespace-only → "-" | A field that is `"   "` (or similar) shows "-" |
| Zero preserved | `formatNumber(0)` returns `"0"`, not `"-"` |
| False preserved | Boolean `false` is never passed to `displayCell` (wrong type) |
| NaN → "-" | `formatCurrency(NaN)` returns `"-"` |

## State Transitions

Not applicable. This feature has no state machine or workflow.

## No Schema Changes

No Drizzle migrations required. No new tables. No changes to `db/schema.ts`.

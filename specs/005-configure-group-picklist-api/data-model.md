# Data Model: Configure Order — Add Group Dropdown from Product Grouping Picklist

**Feature**: `specs/005-configure-group-picklist-api`
**Date**: 2026-06-24

## No New Entities

No new data entities, database tables, or API fields. This is a client-side state source change.

## Affected State

### `grpLabels` (changed from useMemo → useState)

| Property | Feature 003 (old) | Feature 005 (new) |
|----------|-------------------|-------------------|
| Declaration | `const grpLabels = useMemo(...)` | `const [grpLabels, setGrpLabels] = useState<string[]>([])` |
| Source | Derived from `catalog` state | Fetched from `/api/salesforce/picklists` |
| Updates when | `catalog` changes | Component mounts + `SF_ACCOUNT_ID`/`SF_CONTACT_ID` become available |
| Content | Unique non-empty `groupingLabel` values from loaded catalog items | `result.data[0].Product_Grouping__c` string array from Salesforce |
| Used by | "+ Add Group" dropdown JSX (unchanged) | Same |

## New Fetch Pattern

Follows the exact pattern in `app/orders/[id]/page.tsx` lines 548–572:

```
On mount (when SF_ACCOUNT_ID + SF_CONTACT_ID are available):
  fetch /api/salesforce/picklists?accountId=...&contactId=...
  → result.data[0].Product_Grouping__c → setGrpLabels(values)
  → on error or missing field: grpLabels stays []
```

## API Response Shape (reference)

```
GET /api/salesforce/picklists?accountId={id}&contactId={id}

{
  success: true,
  data: [
    {
      Product_Grouping__c: ["Group A", "Group B", "Group C", ...],
      Shipping_Method__c: [...],
      Incoterms__c: [...]
    }
  ]
}
```

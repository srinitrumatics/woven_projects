# Phase 1 Data Model: Proposal # Columns Show the Proposal Number, Not the Name

No new entities, tables, or Drizzle schema changes. This documents the existing Salesforce-sourced fields relevant to this fix.

## Entity: Proposal (Salesforce)

| Field | Type | Notes |
|---|---|---|
| `Name` | string | Human-entered proposal name. Already displayed correctly under "Proposal Name" columns app-wide. |
| `Proposal_Number__c` | string | Salesforce auto-number, format `PRP-YY-MM-NNNNNN` (e.g. `PRP-26-04-000494`). The value this feature ensures is displayed under every "Proposal #" column. May be blank on records created before this field existed or where SF auto-numbering has a data gap. |
| `Id` | string | Salesforce record Id. Used by several pages purely for row identity/sort/link keys; unaffected by this change. |

## Derived/mapped display field (per affected page/component)

Each affected page or component currently maps raw Salesforce fields into a local row shape (e.g. `proposalNumber`, `proposalName`, `proposal_name`). This feature changes what value is assigned to the field feeding the "Proposal #" column, without renaming or removing any existing mapped field used elsewhere (e.g. row keys, sort comparators, links).

**Corrected mapping expression** (applied consistently everywhere a "Proposal #" column exists):

```ts
proposalNumber: raw.Proposal_Number__c || raw.Name || raw.Proposal_Name || raw.Proposal__r?.Name || 'N/A'
```

The exact right-hand fallback chain after `Proposal_Number__c` depends on what fallback each individual file already uses today (some reference `Proposal_Name`, others `Proposal__r?.Name`) — the only required change is inserting `Proposal_Number__c ||` at the front of whatever fallback chain already exists, and ensuring the underlying query actually selects `Proposal_Number__c`.

## Relationships

No relationship changes. Proposal continues to be referenced (by Id, and now correctly by Number) from: Quote, Invoice, Credit Memo, RMA, Purchase Order, Debit Memo, Supplier Bill, Shipment, Order, and the Proposal detail page's own child-record sub-tabs (Fulfillments, Returns).

## Validation Rules

None introduced — this is a read/display mapping fix. Salesforce remains the sole writer of `Proposal_Number__c`; the app never sets or edits this field (Constitution Principle I).

## State Transitions

Not applicable — no state machine involved.

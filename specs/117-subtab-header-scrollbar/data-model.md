# Data Model: Fix Unwanted Scrollbar in Sub-Tab Headers on Small Screens

**N/A** — this feature is a client-side CSS/layout correction to an existing shared UI component (`components/ui/SubTabs.tsx`). It introduces no new data entities, no database schema changes, and no Salesforce field usage.

The only "entity" from the spec (Key Entities: *Sub-tab header row*) is a purely visual concept — the existing `tabs: TabItem[]` prop already accepted by `SubTabs.tsx` (`key`, `label`, `count?`, `disabled?`) is unchanged by this fix. No prop, state, or interface changes are required.

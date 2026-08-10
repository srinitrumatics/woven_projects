# Data Model: Clear Gap Between Header Text and Sort Icon in All Datatables

**N/A** — this feature is a single Tailwind CSS spacing-value change on an existing UI component. It introduces no new data entities, no database schema changes, and no Salesforce field usage.

No component prop, state, or data-fetching interface changes are required; only the `gap-1` → `gap-2` Tailwind className value on one existing `<div>` in `components/ui/SortableHeader.tsx` (see `research.md`).

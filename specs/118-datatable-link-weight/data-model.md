# Data Model: Consistent Bold Hyperlinks in All Datatables

**N/A** — this feature is a client-side CSS/layout correction across existing UI components. It introduces no new data entities, no database schema changes, and no Salesforce field usage.

The only "entity" from the spec (Key Entities: *Datatable hyperlink*) is a purely visual/styling concept — an existing `<Link>` (next/link) element already rendered inside a `Td` table cell. No component prop, state, or data-fetching interface changes are required; only the Tailwind `font-*` className on ~176 existing elements (see `research.md` inventory) is updated.

# Data Model: Consistent, Generic "No Search Results" Message on Landing Pages

**N/A** — this feature is a client-side UI text/prop correction across existing pages. It introduces no new data entities, no database schema changes, and no Salesforce field usage.

The two "entities" implied by the spec (the shared message title and description) are plain string constants, not data model concepts — see `research.md` for their exact values and placement (`components/ui/DataTable.tsx`, alongside `TableEmptyState`). No component prop *shape*, state, or data-fetching interface changes are required; only which literal string values are passed into `TableEmptyState`'s already-existing `message`/`description` props (and, on two pages, the boolean condition that selects between two already-existing branches) change.

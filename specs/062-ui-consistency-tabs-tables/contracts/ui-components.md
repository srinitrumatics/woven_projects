# UI Component Contracts

This feature's "interfaces" are the shared presentational component APIs that every page migrates to, not network/API contracts (no new API routes are introduced). These are the contracts implementation MUST satisfy so that all 9+ call sites can migrate without touching business logic.

## `components/ui/Tabs.tsx`

```ts
export interface TabItem {
  key: string;
  label: string;
  count?: number;       // optional badge, e.g. line-item count
  disabled?: boolean;   // optional, for tabs a page may need to disable conditionally
}

export interface TabsProps {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;   // escape hatch for rare page-specific layout needs (e.g. margin), never for color/size/spacing overrides of the tab pills themselves
}
```

- Renders the unified pill-button visual style (padding, gap between tabs, active/inactive/hover states, wrap/scroll on overflow) with no per-consumer ability to override those visual properties.
- Consumers pass their existing `activeTab`/`setActiveTab` state through `activeKey`/`onChange` — no new state management required.

## `components/ui/DataTable.tsx`

```ts
export function Table(props: { children: React.ReactNode; className?: string }): JSX.Element;
export function THead(props: { children: React.ReactNode; className?: string }): JSX.Element;
export function TBody(props: { children: React.ReactNode; className?: string }): JSX.Element;
export function Tr(props: { children: React.ReactNode; className?: string }): JSX.Element;
export function Th(props: { children: React.ReactNode; className?: string }): JSX.Element;
export function Td(props: { children: React.ReactNode; className?: string }): JSX.Element;
export function TableEmptyState(props: { message?: string; description?: string }): JSX.Element;
export function TableLoadingState(props: { message?: string }): JSX.Element;
```

- `Th`/`Td` apply the unified padding/border/font styling; the optional `className` is additive (e.g., text alignment, width) and MUST NOT override the unified padding, border, or font-size/color tokens.
- `Th` children may still include a `SortableHeader` instance; `Tr` may still be wrapped in existing row-click/link-guard logic — the primitives only own the outer chrome.
- `THead`/`TBody`/`Tr` provide the unified header background, row border, and hover/alternating-row treatment (including dark-mode pairs) so no host table needs to redeclare them.
- `TableEmptyState`/`TableLoadingState` (FR-011) are standalone block components, matching how every existing table already handles this case — rendered in place of the `<table>` (or alongside it, e.g. after the `overflow-x-auto` wrapper) when a table has zero rows or a pending fetch, rather than as a row inside `TBody`. This mirrors the codebase's existing convention (e.g. `QuoteLinesTab.tsx`, `POLinesTable.tsx`) exactly, so adopting it requires no restructuring of a table's early-return logic — only swapping the bespoke message markup for the shared component, optionally overriding `message`/`description`.

## Text style roles (`lib/text-styles.ts` or documented Tailwind class groupings)

```ts
export const textStyles = {
  heading: '...',       // fixed size/weight/color (light+dark) Tailwind classes
  body: '...',
  muted: '...',
  tableHeader: '...',
} as const;
```

- Each key resolves to one fixed, non-overridable set of Tailwind utility classes covering font-size, font-weight (where applicable), and text color for both light and dark mode.
- Pages/components reference `textStyles.muted` etc. instead of ad-hoc `text-xs text-gray-500` / `text-[13px]` / hardcoded hex values.

## `tailwind.config.ts` fix

- `fontFamily` moves from its current (invalid) nesting under `theme.extend.colors` to `theme.extend.fontFamily`, so `font-sans` resolves the intended stack app-wide with no other file changes required.

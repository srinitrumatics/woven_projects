# Data Model: Visual Hygiene Fixes

No database schema, Drizzle table, or Salesforce object changes anywhere in this feature. This document captures the component/markup changes per file.

## Order Line Detail stepper (US1)

| File | Element | Before | After |
|---|---|---|---|
| `app/orders/[id]/lines/[lineId]/components/OrderDetailsTable.tsx:141,148` | Desktop decrement/increment `<button>` | `w-6 h-6 ... bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600` | `w-6 h-6 ... transition-colors text-lg bg-white dark:bg-gray-600 border-gray-200 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 text-gray-900 dark:text-white` (mobile's color scheme, desktop's size) |
| `app/orders/[id]/lines/[lineId]/components/OrderDetailsTable.tsx:72-84` | Mobile decrement/increment `<button>` | Unchanged | Unchanged (this is now the shared reference style) |

## Sidebar icons (US2)

| File | Nav item | Before (shared path) | After |
|---|---|---|---|
| `components/layouts/Sidebar.tsx:32-36` | Catalog | `M20 7l-8-4-8 4m16 0l-8 4...` | Unchanged |
| `components/layouts/Sidebar.tsx:46-50` | My Inventory | Same as Catalog | `ArchiveBoxIcon` path (new, distinct) |
| `components/layouts/Sidebar.tsx:53-57` | Orders | `M16 11V7a4 4 0 00-8 0v4...` | Unchanged |
| `components/layouts/Sidebar.tsx:74-78` | Purchase Orders | Same as Orders | `ClipboardDocumentListIcon` path (new, distinct) |

## Shared `Breadcrumb` (US3)

New component: `components/ui/Breadcrumb.tsx`

| Prop | Type | Notes |
|---|---|---|
| `items` | `{ label: string; href?: string }[]` | Items with `href` render as `next/link`; items without render as plain current-page text |
| `className` | `string` (optional) | Appended to the outer wrapper |

| Call site | Before | After |
|---|---|---|
| `app/proposals/[id]/components/ProposalHeader.tsx:14-20` | 2 static non-clickable `<span>`s + 1 current-page `<span>` | `<Breadcrumb items={[{label:"Proposals",href:"/proposals"},{label:"Proposal Details",href:`/proposals/${id}`},{label:proposalNumber}]} />`; component gains a new `id` prop |
| `app/proposals/[id]/summary/page.tsx:56-71` | 2 `<button onClick={() => router.push(...)}>` + 1 current-page `<span>` | `<Breadcrumb items={[{label:"Proposals",href:"/proposals"},{label:"Proposal Details",href:`/proposals/${id}`},{label:"Proposal Workspace"}]} />` |
| `app/proposals/[id]/lines/[lineid]/page.tsx:633-648` | Same button pattern as Summary page | `<Breadcrumb items={[{label:"Proposals",href:"/proposals"},{label:"Proposal Details",href:`/proposals/${id}`},{label:product.sku}]} />` |

## Filter pills onto `Tabs` (US4)

| File | Before | After |
|---|---|---|
| `app/shipments/page.tsx:444-467` | Hand-rolled `<button>` row, inactive = `bg-gray-100 dark:bg-gray-700` | `<Tabs tabs={[{key:'All',label:'All'}, ...uniqueStatuses.map(s => ({key:s, label:s}))]} activeKey={activeTab} onChange={(key) => setActiveTab(key as ShipmentStatus)} />` |
| `app/inventory/page.tsx:574-587` | Hand-rolled `<button>` row, inactive = `bg-gray-100 dark:bg-gray-700` | `<Tabs tabs={["All","On Hold","Put-Away","Average Aged"].map(t => ({key:t, label:t}))} activeKey={activeTab} onChange={(key) => handleCardClick(key as TabFilter)} />` |
| `app/admin/authorize-locations/[id]/delivery-windows/page.tsx:278-292` | Hand-rolled `<button>` row, `rounded-full`, inactive = `bg-gray-50` | `<Tabs tabs={["All","Active","Inactive"].map(t => ({key:t, label:t}))} activeKey={activeTab} onChange={(key) => setActiveTab(key as TabFilter)} />` |

## Key Entities

- **Quantity stepper**: The +/- control for order-line quantity, present in both mobile and desktop renderings of one file.
- **Sidebar navigation item**: An entry in the persistent left nav with a label, destination, icon, and optional account-type visibility filter.
- **Breadcrumb trail**: A sequence of navigation segments ending in a non-interactive current-page label — now a single shared component instead of 3 independent copies.
- **Filter pill**: A clickable status/category filter control on a list page — now rendered via the shared `Tabs` component instead of 3 independent implementations.

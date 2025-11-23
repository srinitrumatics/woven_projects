import { Suspense } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layouts/Sidebar';
import Pagination from '@/components/ui/Pagination';
import { requireAuth } from '@/lib/auth';
import { getOrdersFromSalesforce } from '@/lib/salesforce-service';
import { formatCurrency } from '@/lib/utils/formatting';
import { UIOrder, OrderStatus } from './types';

type TabFilter = 'All' | 'Pending' | 'Success' | 'Draft' | 'Cancelled';

// Server component to get orders data
async function OrdersContent({
  searchParams
}: {
  searchParams?: {
    page?: string;
    tab?: TabFilter;
    search?: string;
  }
}) {
  // Using the resolved searchParams directly
  const currentPage = Number(searchParams?.page) || 1;
  const activeTab = searchParams?.tab || 'All';
  const searchQuery = searchParams?.search || '';
  const itemsPerPage = 10;

  // Fetch orders data from Salesforce
  const sfOrders = await getOrdersFromSalesforce('001WL00000bapRiYAI');

  // Map Salesforce records to UI-friendly order shape used in your table
  const uiOrders: UIOrder[] = sfOrders.map((o: any) => ({
    id: o.Id,
    name: o.Name,
    status: o.Status__c || 'N/A',
    billTo: o.Bill_To_Contact_Name || '',
    shipTo: o.Ship_To_Contact_Name || '',
    items: o.Total_Lines__c || 0,
    total: Number(o.Total_Price__c || 0),
  }));

  // Derive stats
  const stats = {
    totalOrders: uiOrders.length,
    orderItems: uiOrders.reduce((sum, order) => sum + (Number(order.items) || 0), 0),
    returnsOrders: 0,
    fulfilledOrders: uiOrders.filter(o => (o.status || '').toLowerCase().includes('success')).length,
    totalOrdersChange: 5,
    orderItemsChange: 3,
    returnsOrdersChange: -1,
    fulfilledOrdersChange: 2,
  };

  // Filter and search
  let filteredAndSearchedOrders = uiOrders;

  // Apply tab filter
  if (activeTab !== 'All') {
    filteredAndSearchedOrders = filteredAndSearchedOrders.filter(order => 
      String(order.status).toUpperCase() === String(activeTab).toUpperCase()
    );
  }

  // Apply search
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredAndSearchedOrders = filteredAndSearchedOrders.filter(order =>
      String(order.id).toLowerCase().includes(q) ||
      String(order.name || '').toLowerCase().includes(q) ||
      String(order.billTo || '').toLowerCase().includes(q) ||
      String(order.shipTo || '').toLowerCase().includes(q) ||
      String(order.status || '').toLowerCase().includes(q)
    );
  }

  // Pagination
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredAndSearchedOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = filteredAndSearchedOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Orders"
          value={`${stats.totalOrders}`}
          change={stats.totalOrdersChange}
          trend="up"
        />
        <StatCard
          title="Order Items"
          value={`${stats.orderItems}`}
          change={stats.orderItemsChange}
          trend="up"
        />
        <StatCard
          title="Return Orders"
          value={`${stats.returnsOrders}`}
          change={stats.returnsOrdersChange}
          trend="down"
        />
        <StatCard
          title="Fulfilled Orders"
          value={`${stats.fulfilledOrders}`}
          change={stats.fulfilledOrdersChange}
          trend="up"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Tabs and Search */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 gap-3 flex-wrap">
            <div className="flex flex-wrap gap-6">
              {(['All', 'Pending', 'Success', 'Draft', 'Cancelled'] as TabFilter[]).map(tab => (
                <Link
                  key={tab}
                  href={`?${new URLSearchParams({
                    tab: tab,
                    search: searchQuery,
                    page: '1' // Reset to page 1 when changing tabs
                  }).toString()}`}
                  className={`pb-2 text-sm font-medium transition-colors relative ${
                    activeTab === tab
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white"></div>
                  )}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Search Form */}
              <form className="relative w-full sm:w-[260px]">
                <input
                  type="text"
                  name="search"
                  placeholder="Search orders..."
                  defaultValue={searchQuery}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full"
                />
                <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </form>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-primary-light dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Order</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Bill To</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Ship To</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Items</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Total</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No orders found</p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm">
                        {searchQuery || activeTab !== 'All'
                          ? 'Try adjusting your filters'
                          : 'Get started by creating your first order'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-primary">
                      <Link href={`/orders/${order.id}`}>#{order.name}</Link>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status as OrderStatus} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 max-w-[200px] line-clamp-2">{order.billTo}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 max-w-[200px] line-clamp-2">{order.shipTo}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white">{order.items}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white font-semibold">{formatCurrency(order.total)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link 
                          href={`/orders/${order.id}/edit`} 
                          className="p-1.5 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                          title="Edit order"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                          title="Delete order"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {(() => {
              const totalItems = filteredAndSearchedOrders.length;
              const safeCurrent = Number(currentPage) || 1;
              const start = totalItems === 0 ? 0 : (safeCurrent - 1) * ITEMS_PER_PAGE + 1;
              const end = Math.min(totalItems, safeCurrent * ITEMS_PER_PAGE);
              return (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {start} to {end} of {totalItems} orders
                </div>
              );
            })()}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredAndSearchedOrders.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={(page) => {
                // This would need to be part of a client component or form action
                console.log(`Navigate to page ${page}`);
              }}
              itemName="orders"
            />
          </div>
        </div>
      </div>
    </>
  );
}

// Type for search parameters
type SearchParams = Promise<{
  page?: string;
  tab?: TabFilter;
  search?: string;
}>;

export default async function OrdersPage({
  searchParams
}: {
  searchParams?: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  // Server-side authentication and permission check
  await requireAuth(['order-list', 'order-read']); // Requires either order-list or order-read permission

  return (
    <Sidebar>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Export
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            More actions
          </button>
          <Link href="/orders/create">
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
              Create order
            </button>
          </Link>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="mb-6">
        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Jan 1 - Jan 30, 2024
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <Suspense fallback={<div className="flex justify-center py-12">Loading orders...</div>}>
        <OrdersContent searchParams={resolvedSearchParams} />
      </Suspense>
    </Sidebar>
  );
}

function StatCard({ 
  title, 
  value, 
  change, 
  trend 
}: {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
}) {
  const isPositive = trend === 'up';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <span className={`text-sm flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '▲' : '▼'} {Math.abs(change)}% last week
        </span>
      </div>
      <div className="mt-4 h-12 flex items-end gap-1">
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-sm h-[30%]"></div>
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-sm h-[45%]"></div>
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-sm h-[60%]"></div>
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-sm h-[80%]"></div>
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-sm h-[70%]"></div>
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-sm h-[55%]"></div>
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-sm h-[85%]"></div>
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-sm h-[95%]"></div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const getStyles = () => {
    switch ((status || '').toString()) {
      case 'Success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Draft':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStyles()}`}>
      {status || 'N/A'}
    </span>
  );
}
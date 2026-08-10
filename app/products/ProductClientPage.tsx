"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import Pagination from "@/components/ui/Pagination";
import algoliasearch from "algoliasearch";
import {
  InstantSearch,
  Configure,
  useInfiniteHits,
  useSearchBox,
  useRefinementList,
  useClearRefinements,
  RefinementList,
  CurrentRefinements,
  useInstantSearch,
  usePagination,
  useHits
} from "react-instantsearch";
import { formatCurrency, formatNumber, displayCell } from "@/lib/utils/formatting";
import { Product } from "../orders/types";
import Link from "next/link";
import { useUserSession } from "@/components/UserSessionContext";
import AddProductModal from "./components/AddProductModal";
import AddToOrderModal from "./[id]/components/AddToOrderModal";
import PermissionGate from "@/components/PermissionGate";
import { getCategoryFromAccountType, MANUFACTURER_GROUP } from "@/lib/permissions";
import { Table, THead, TBody, Tr, Th, Td, TableEmptyState, SEARCH_EMPTY_MESSAGE, SEARCH_EMPTY_DESCRIPTION } from "@/components/ui/DataTable";

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "",
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || ""
);

// Helper for debugging unfiltered data
const logUnfilteredData = async (indexName: string) => {
  try {
    const index = searchClient.initIndex(indexName);
    const { hits } = await index.search("", { hitsPerPage: 5 });
  } catch (error) {
    console.error("[DEBUG] Failed to fetch unfiltered data:", error);
  }
};

function CustomClearButton({ onClear, canClearCustom }: { onClear: () => void, canClearCustom?: boolean }) {
  const { canRefine, refine } = useClearRefinements();
  const isClearable = canRefine || canClearCustom;
  return (
    <button
      onClick={() => { if (canRefine) refine(); onClear(); }}
      disabled={!isClearable}
      className={`text-sm font-medium transition-colors ${isClearable ? 'text-primary hover:text-primary-dark cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}
    >
      Clear all
    </button>
  );
}

function CategoryHeader({ attribute, title }: { attribute: string, title: string }) {
  const { items } = useRefinementList({ attribute });
  const selectedCount = items.filter(item => item.isRefined).length;

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
        {items.length > 0 && (
          <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
            ({items.length})
          </span>
        )}
      </div>
      {selectedCount > 0 && (
        <span className="bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
          {selectedCount}
        </span>
      )}
    </div>
  );
}

function CustomRefinementList(props: any) {
  const {
    items,
    refine,
    toggleShowMore,
    isShowingMore,
    canToggleShowMore,
  } = useRefinementList(props);

  const { status } = useInstantSearch();
  const isLoading = status === 'loading' || status === 'stalled';

  if (items.length === 0) {
    if (isLoading) {
      return (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      );
    }
    return <p className="text-sm text-gray-500">No options available</p>;
  }

  return (
    <ul className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
      {items.map((item) => (
        <li key={item.label} className="flex items-center">
          <label className="flex items-center cursor-pointer w-full group">
            <input
              type="checkbox"
              checked={item.isRefined}
              onChange={() => refine(item.value)}
              className="w-4 h-4 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary cursor-pointer"
            />
            <span className={`ml-2 text-sm group-hover:text-gray-900 dark:group-hover:text-white flex-1 ${item.isRefined ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
              {item.label}
            </span>
            <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
              {item.count}
            </span>
          </label>
        </li>
      ))}
      {canToggleShowMore && (
        <button
          onClick={toggleShowMore}
          className="mt-3 text-sm text-primary hover:text-primary-dark font-medium cursor-pointer w-full text-left"
        >
          {isShowingMore ? 'Show less' : 'Show more'}
        </button>
      )}
    </ul>
  );
}

function Content({ indexName }: { indexName: string }) {
  useEffect(() => {
    logUnfilteredData(indexName);
  }, [indexName]);

  const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { selectedAccount, user } = useUserSession();
  const accountType = selectedAccount?.Account_Record_Type__c;
  const accountCategory = getCategoryFromAccountType(accountType);
  const isCustomer = accountCategory === 'Customer';
  const isManufacturer = MANUFACTURER_GROUP.includes(accountType || '');
  const isHybrid = accountCategory === 'Hybrid';
  const isSupplierGroup = isManufacturer;
  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any>(null);
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const accountId = selectedAccount?.Id || selectedAccount?.id || "";
  const contactId = user?.contact?.Id || user?.contact?.id || "";
  const [addToOrderProduct, setAddToOrderProduct] = useState<{ id: string; name: string; price: number } | null>(null);
  const [addToOrderQuantity, setAddToOrderQuantity] = useState(1);

  const openAddToOrder = (p: any) => {
    setAddToOrderProduct({
      id: p.objectID || p.id,
      name: p.name,
      price: Number(p.price ?? p.unitPrice ?? 0),
    });
    setAddToOrderQuantity(parseInt(p.moq) || 1);
  };

  const canEditProduct = (p: any) => {
    if (isAdmin) return true;
    if (isCustomer) return false;
    // Hybrid and Supplier Group can only edit their own products
    // Note: manufacturer field in Algolia stores the Account ID
    return (isHybrid || isSupplierGroup) && p.manufacturer === selectedAccount?.Id;
  };

  let filters = '';
  if (isCustomer) {
    // (1) Customer or NSO: Display only Available products
    filters = "product_availability:'Available'";
  } else if (isHybrid) {
    // (2) Hybrid: Display All Products OR My Products
    filters = showOnlyMine ? `manufacturer:'${selectedAccount?.Id}'` : '';
  } else if (isSupplierGroup && !isAdmin) {
    // (3) Supplier/Manufacturer Group: Display only their own products
    filters = `manufacturer:'${selectedAccount?.Id}'`;
  } else if (isAdmin) {
    // Admins see all products
    filters = '';
  } else {
    // Default
    filters = "product_availability:'Available'";
  }

  if (stockFilter === 'in_stock') {
    filters = filters ? `${filters} AND stock_quantity > 0` : "stock_quantity > 0";
  } else if (stockFilter === 'out_of_stock') {
    filters = filters ? `${filters} AND stock_quantity <= 0` : "stock_quantity <= 0";
  }

  // Search Box Hook
  const { query, refine: setQuery } = useSearchBox();

  // Pagination Hook to explicitly reset page on custom filter changes
  const { refine: setPage } = usePagination();

  // InstantSearch Status Hook
  const { status } = useInstantSearch();
  const isLoading = status === 'loading' || status === 'stalled';

  // Infinite Hits Hook
  const { hits, isLastPage, showMore } = useInfiniteHits();

  useEffect(() => {
    if (hits.length > 0) {
      // Specifically check for manufacturer field in the first hit
      const firstHit = hits[0] as any;
    }
  }, [hits]);

  const sentinelRef = useRef(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    // Prevent race conditions by not observing while loading
    if (!sentinelRef.current || isLastPage || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            showMore();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [isLastPage, showMore, isLoading]);

  // derived state for UI
  const products = hits as unknown as Product[];

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-w-0">
      <Configure
        hitsPerPage={viewMode === 'list' ? 10 : 9}
        maxValuesPerFacet={200}
        filters={filters}
        facets={['*']}
      />
      {/* Filters Sidebar */}
      <aside className="lg:w-64 flex-shrink-0">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-6">
          <div className="flex items-center justify-between mb-4 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
            <CustomClearButton
              onClear={() => { setQuery(''); setStockFilter('all'); setPage(0); }}
              canClearCustom={stockFilter !== 'all'}
            />
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <CategoryHeader attribute="category" title="Category" />
            <CustomRefinementList
              attribute="category"
              operator="or"
              limit={10}
              showMore={true}
              showMoreLimit={200}
            />
          </div>

          <div className="mb-6">
            <CategoryHeader attribute="product_availability" title="Availability" />
            <CustomRefinementList
              attribute="product_availability"
              operator="or"
              limit={10}
              showMore={true}
              showMoreLimit={200}
            />
          </div>

          {/* Stock Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Stock Status</h3>
            <ul className="space-y-2">
              {[
                { label: 'All', value: 'all' },
                { label: 'In Stock', value: 'in_stock' },
                { label: 'Out of Stock', value: 'out_of_stock' }
              ].map((item) => (
                <li key={item.value} className="flex items-center">
                  <label className="flex items-center cursor-pointer w-full group">
                    <input
                      type="radio"
                      checked={stockFilter === item.value}
                      onChange={() => { setStockFilter(item.value as any); setPage(0); }}
                      className="w-4 h-4 text-primary border-gray-300 dark:border-gray-600 focus:ring-primary dark:focus:ring-primary cursor-pointer"
                    />
                    <span className={`ml-2 text-sm group-hover:text-gray-900 dark:group-hover:text-white flex-1 ${stockFilter === item.value ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {item.label}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Type Filter */}
          {/*<div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 ">Type</h3>
            <RefinementList
              attribute="genre"
              limit={5}
              showMore={true}
              showMoreLimit={200}
              classNames={{
                root: "",
                noRefinementRoot: "hidden",
                list: "space-y-2",
                item: "flex items-center",
                selectedItem: "font-medium",
                label: "flex items-center cursor-pointer w-full group",
                checkbox: "w-4 h-4 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary cursor-pointer",
                labelText: "ml-2 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white flex-1",
                count: "ml-auto text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full",
                showMore: "mt-3 text-sm text-primary hover:text-primary-dark font-medium cursor-pointer w-full text-left",
                disabledShowMore: "hidden"
              }}
              translations={{
                showMoreButtonText({ isShowingMore }) {
                  return isShowingMore ? 'Show less' : 'Show more';
                }
              }}
            />
          </div>*/}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Search and View Mode Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between min-w-0">
            {/* Search */}
            <div className="flex-1 relative w-full md:max-w-md">
              <input
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 min-w-0">
              {/* My Products Toggle – Only for Hybrid accounts */}
              {isHybrid && (
                <label
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm whitespace-nowrap text-sm font-medium cursor-pointer border select-none ${showOnlyMine
                    ? "bg-primary/10 text-primary border-primary/20 dark:border-primary/30"
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600"
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={showOnlyMine}
                    onChange={() => { setShowOnlyMine(!showOnlyMine); setPage(0); }}
                    className="hidden"
                  />
                  My Products
                </label>
              )}

              {/* Create Product Button – visible for Hybrid and Supplier group */}
              {(isHybrid || isSupplierGroup) && (
                <button
                  onClick={() => { setProductToEdit(null); setIsAddModalOpen(true); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap"
                  title="Create Product"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Product
                </button>
              )}

              <button
                onClick={() => setViewMode('card')}
                className={`p-2 rounded-lg transition-colors ${viewMode === "card"
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                title="Card View"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === "list"
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                title="List View"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
          </div>

          {/* Current Refinements */}
          <div className="mt-4">
            <CurrentRefinements
              classNames={{
                root: "flex flex-wrap gap-2",
                list: "flex flex-wrap gap-2",
                item: "bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2",
                label: "font-medium",
                category: "opacity-75",
                delete: "hover:text-red-600 cursor-pointer ml-1"
              }}
            />
          </div>
        </div>

        {/* Render products based on viewMode */}
        <div className={`relative min-h-[400px] ${viewMode === 'card' ? 'bg-gray-50 dark:bg-gray-900 rounded-lg p-4' : ''}`}>
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Loading catalog...</p>
              </div>
            </div>
          )}

          {viewMode === 'card' ? (
            <CardView
              products={products}
              canEditProduct={canEditProduct}
              onEdit={(p) => { setProductToEdit(p); setIsAddModalOpen(true); }}
              onAddToOrder={openAddToOrder}
            />
          ) : (
            <ListView
              canEditProduct={canEditProduct}
              onEdit={(p) => { setProductToEdit(p); setIsAddModalOpen(true); }}
              onAddToOrder={openAddToOrder}
            />
          )}
        </div>

        {/* Infinite Scroll Sentinel — card view only */}
        {!isLastPage && viewMode === 'card' && (
          <div ref={sentinelRef} className="flex justify-center py-8">
            <div className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
              <span className="text-sm truncate">Loading more products...</span>
            </div>
          </div>
        )}

        {/* End of Results Message — card view only */}
        {isLastPage && products.length > 0 && viewMode === 'card' && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-sm truncate" title="You've reached the end of the results">You've reached the end of the results</p>
          </div>
        )}
      </div>

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
      />

      <AddToOrderModal
        isOpen={!!addToOrderProduct}
        onClose={() => setAddToOrderProduct(null)}
        product={addToOrderProduct}
        quantity={addToOrderQuantity}
        moq={addToOrderQuantity}
        accountId={accountId}
        contactId={contactId}
      />
    </div>
  );
}

export default function ProductClientPage({ indexName = "wovn_products_local" }: { indexName?: string }) {
  useEffect(() => { }, [indexName]);

  if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || !process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY) {
    return (
      <div className="p-8 text-center text-red-600 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-2 ">Search Configuration Missing</h2>
        <p>Please check your environment variables.</p>
      </div>
    );
  }

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={indexName}
      future={{ preserveSharedStateOnUnmount: true }}
    >
      <Content indexName={indexName} />
    </InstantSearch>
  );
}

interface ViewProps {
  products: Product[];
  canEditProduct: (p: any) => boolean;
  onEdit: (p: any) => void;
  onAddToOrder: (p: any) => void;
}
/* card View Products Function Start */
const CardView = ({ products, canEditProduct, onEdit, onAddToOrder }: ViewProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {products.length === 0 ? (
      <div key="no-matches" className="col-span-full">
        <TableEmptyState message={SEARCH_EMPTY_MESSAGE} description={SEARCH_EMPTY_DESCRIPTION} />
      </div>
    ) : (
      products.map((product) => {
        // Cast to access Algolia fields
        const p = product as any;
        const thumbnail = p.images?.[0]?.thumb || p.image_url;

        // Price logic
        const sellingPrice = typeof p.price === 'number' ? p.price : (product.unitPrice || 0);
        const listPrice = product.listPrice || 0;
        const category = p.category || p.family || product.productFamily || product.manufacturer || "No Category";

        return (
          <Link
            href={`/products/${p.objectID || product.id}`}
            key={p.objectID || product.id}
            className="flex flex-col h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer"
          >
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 min-w-0">
                  <span className="text-4xl truncate">📦</span>
                </div>
              )}
              {/* Badge for Selling Price */}
              <div className="absolute top-2 right-2 bg-primary text-white text-sm font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm shadow-lg">
                {formatCurrency(sellingPrice)}
              </div>
            </div>

            <div className="p-4 flex flex-col flex-grow">
              <div className="mb-2 flex items-center gap-2 min-w-0">
                <span className="text-xs font-medium text-primary truncate">
                  {category}
                </span>
                {p.brand && (
                  <>
                    <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate" title={p.brand}>
                      {p.brand}
                    </span>
                  </>
                )}
              </div>
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="text-base font-bold text-gray-900 dark:text-white min-w-[200px] truncate group-hover:text-primary transition-colors " title={product.name}>
                  {product.name}
                </h3>

              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 min-w-[200px] truncate mb-3" title={product.description}>
                {product.description}
              </p>

              <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-1">
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 min-w-0">
                  <span>List Price:</span>
                  <span className="line-through truncate">{formatCurrency(listPrice)}</span>
                </div>
                {/*<div className="flex justify-between items-center min-w-0">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">Selling Price:</span>
                   <span className="text-lg font-bold text-gray-900 dark:text-white truncate">
                    {formatCurrency(sellingPrice)}
                  </span>
                </div>*/}
                <div className="flex gap-2 w-full mt-2">
                  <PermissionGate requiredPermissions={['order-create']} fallback={null}>
                    <button
                      disabled={product.availableQty <= 0}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToOrder(p); }}
                      className={`flex-1 px-2 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${product.availableQty <= 0
                        ? "bg-gray-400 cursor-not-allowed text-white opacity-70"
                        : "bg-primary hover:bg-primary-dark text-white"
                        }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 20 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="truncate">{product.availableQty === 0 ? "Out of Stock" : "Add to Order"}</span>
                    </button>
                  </PermissionGate>
                </div>
              </div>
            </div>
          </Link>
        );
      })
    )}
  </div>
);
/* List View Products Function Start */
const LIST_ITEMS_PER_PAGE = 10;

function ListView({ canEditProduct, onEdit, onAddToOrder }: Omit<ViewProps, 'products'>) {
  const { hits } = useHits();
  const { currentRefinement, nbHits, nbPages, refine } = usePagination();
  
  const { items: sortedProducts, requestSort, sortConfig } = useSortableData<any>(hits, { key: 'name', direction: 'asc' });
  const { widths, handleResize } = useResizableColumns({
    name: 250,
    category: 200,
    brand: 150,
    description: 250,
    listPrice: 120,
    sellingPrice: 120,
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        {sortedProducts.length === 0 ? (
          <TableEmptyState message={SEARCH_EMPTY_MESSAGE} description={SEARCH_EMPTY_DESCRIPTION} />
        ) : (
        <Table className="min-w-[640px]">
          <THead>
            <tr>
              <Th style={{ width: 80, minWidth: 80 }}>&nbsp;</Th>
              <SortableHeader label="Product Name" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={handleResize} />
              <SortableHeader label="Category" field="category" sortConfig={sortConfig} requestSort={requestSort} width={widths.category} onResize={handleResize} />
              <SortableHeader label="Brand" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={widths.brand} onResize={handleResize} className="hidden sm:table-cell" />
              <SortableHeader label="Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} className="hidden md:table-cell" />
              <SortableHeader label="List Price" field="listPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.listPrice} onResize={handleResize} className="hidden sm:table-cell" />
              <SortableHeader label="Selling Price" field="price" sortConfig={sortConfig} requestSort={requestSort} width={widths.sellingPrice} onResize={handleResize} />
              <Th>Action</Th>
            </tr>
          </THead>
          <TBody>
            {sortedProducts.map((product) => {
                const p = product as any;
                const thumbnail = p.images?.[0]?.thumb || p.image_url;
                const sellingPrice = typeof p.price === 'number' ? p.price : (product.unitPrice || 0);
                const listPrice = product.listPrice || 0;
                const category = p.category || p.family || product.productFamily || product.manufacturer || "No Category";

                return (
                  <Tr key={p.objectID || product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer group">
                    <Td className="px-4 py-3" style={{ width: 80, minWidth: 80 }}>
                      <Link href={`/products/${p.objectID || product.id}`} className="block">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center overflow-hidden">
                          {thumbnail ? (
                            <img src={thumbnail} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                          )}
                        </div>
                      </Link>
                    </Td>
                    <Td className="px-4 py-3 overflow-hidden" style={{ width: widths.name, minWidth: widths.name, maxWidth: widths.name }}>
                      <Link href={`/products/${p.objectID || product.id}`} className="block font-semibold" title={product.name}>
                        <div className="text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate">{product.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono truncate">{displayCell(product.sku)}</div>
                      </Link>
                    </Td>
                    <Td className="px-4 py-3 overflow-hidden" style={{ width: widths.category, minWidth: widths.category, maxWidth: widths.category }}>
                      <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-primary/10 text-primary max-w-full truncate" title={category}>{category}</span>
                    </Td>
                    <Td className="px-4 py-3 overflow-hidden hidden sm:table-cell" style={{ width: widths.brand, minWidth: widths.brand, maxWidth: widths.brand }}>
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate" title={displayCell(p.brand)}>{displayCell(p.brand)}</div>
                    </Td>
                    <Td className="px-4 py-3 overflow-hidden hidden md:table-cell" style={{ width: widths.description, minWidth: widths.description, maxWidth: widths.description }}>
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate" title={displayCell(product.description)}>{displayCell(product.description)}</div>
                    </Td>
                    <Td className="px-4 py-3 text-sm text-left text-gray-500 dark:text-gray-400 line-through hidden sm:table-cell" style={{ width: widths.listPrice, minWidth: widths.listPrice }}>{formatCurrency(listPrice)}</Td>
                    <Td className="px-4 py-3 text-sm text-left text-gray-900 dark:text-white font-semibold" style={{ width: widths.sellingPrice, minWidth: widths.sellingPrice }}>{formatCurrency(sellingPrice)}</Td>
                    <Td className="px-4 py-3 text-left">
                      <div className="flex items-center gap-2">
                        <PermissionGate requiredPermissions={['order-create']} fallback={null}>
                          <button
                            disabled={product.availableQty <= 0}
                            title={product.availableQty === 0 ? "Out of Stock" : "Add to Order"}
                            onClick={() => onAddToOrder(p)}
                            className={`p-2 rounded-lg transition-colors ${product.availableQty <= 0
                              ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-400"
                              : "bg-primary text-white hover:bg-primary-dark"
                              }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </button>
                        </PermissionGate>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
          </TBody>
        </Table>
        )}
      </div>
      <Pagination
        currentPage={currentRefinement + 1}
        totalPages={nbPages}
        totalItems={nbHits}
        itemsPerPage={10}
        onPageChange={(page) => refine(page - 1)}
        itemName="products"
      />
    </div>
  );
}

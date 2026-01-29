"use client";

import { useState, useRef, useEffect } from "react";
import algoliasearch from "algoliasearch/lite";
import {
  InstantSearch,
  Configure,
  useInfiniteHits,
  useSearchBox,
  useRefinementList,
  RefinementList,
  ClearRefinements,
  CurrentRefinements
} from "react-instantsearch";
import { formatCurrency, formatNumber } from "@/lib/utils/formatting";
import { Product } from "../orders/types";

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "",
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || ""
);

function Content() {
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card');

  // Search Box Hook
  const { query, refine: setQuery } = useSearchBox();

  // Infinite Hits Hook
  const { hits, isLastPage, showMore } = useInfiniteHits();
  console.log("Algolia Hits:", hits);
  const sentinelRef = useRef(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || isLastPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLastPage) {
            showMore();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [isLastPage, showMore]);

  // derived state for UI
  const products = hits as unknown as Product[];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Filters Sidebar */}
      <aside className="lg:w-64 flex-shrink-0">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
            <ClearRefinements
              classNames={{
                root: "",
                button: "text-sm text-primary hover:text-primary-dark font-medium",
                disabledButton: "text-gray-400 cursor-not-allowed"
              }}
              translations={{
                resetButtonText: "Clear all"
              }}
            />
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Category</h3>
            <RefinementList
              attribute="category"
              limit={50}
              showMore={true}
              showMoreLimit={200}
              classNames={{
                root: "",
                list: "space-y-2",
                item: "flex items-center",
                selectedItem: "font-medium",
                label: "flex items-center cursor-pointer w-full group",
                checkbox: "w-4 h-4 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary cursor-pointer",
                labelText: "ml-2 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white flex-1",
                count: "ml-auto text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full",
                showMore: "mt-3 text-sm text-primary hover:text-primary-dark font-medium cursor-pointer"
              }}
              translations={{
                showMoreButtonText({ isShowingMore }) {
                  return isShowingMore ? 'Show less' : 'Show more';
                }
              }}
            />
          </div>

          {/* Type Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Type</h3>
            <RefinementList
              attribute="genre"
              limit={50}
              showMore={true}
              showMoreLimit={200}
              classNames={{
                root: "",
                list: "space-y-2",
                item: "flex items-center",
                selectedItem: "font-medium",
                label: "flex items-center cursor-pointer w-full group",
                checkbox: "w-4 h-4 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary cursor-pointer",
                labelText: "ml-2 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white flex-1",
                count: "ml-auto text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full",
                showMore: "mt-3 text-sm text-primary hover:text-primary-dark font-medium cursor-pointer"
              }}
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {/* Search and View Mode Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
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
            <div className="flex items-center gap-2">
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
        {viewMode === 'card' ? (
          <CardView products={products} />
        ) : (
          <ListView products={products} />
        )}

        {/* Infinite Scroll Sentinel */}
        {!isLastPage && (
          <div ref={sentinelRef} className="flex justify-center py-8">
            <div className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
              <span className="text-sm">Loading more products...</span>
            </div>
          </div>
        )}

        {/* Manual Load More Button (fallback) */}
        {!isLastPage && (
          <div className="flex justify-center mt-6">
            <button
              onClick={showMore}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              Load More Products
            </button>
          </div>
        )}

        {/* End of Results Message */}
        {isLastPage && products.length > 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-sm">You've reached the end of the results</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductClientPage() {
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "dev_woven_products";

  if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || !process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY) {
    return (
      <div className="p-8 text-center text-red-600 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-2">Search Configuration Missing</h2>
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
      <Configure
        hitsPerPage={9}
        facets={['category', 'genre']}
        maxValuesPerFacet={50}
      />
      <Content />
    </InstantSearch>
  );
}

interface ViewProps {
  products: Product[];
}

const CardView = ({ products }: ViewProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {products.length === 0 ? (
      <div key="no-matches" className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
        No products found matching your criteria.
      </div>
    ) : (
      products.map((product) => {
        // Cast to access Algolia fields
        const p = product as any;
        const thumbnail = p.images?.[0]?.thumb || p.image_url;

        // Price logic
        const sellingPrice = typeof p.price === 'number' ? p.price : (product.unitPrice || 0);
        const listPrice = product.listPrice || 0;
        const category = p.category || product.productFamily || product.manufacturer || "Product";

        return (
          <div key={p.objectID || product.id} className="flex flex-col h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer">
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <span className="text-4xl">📦</span>
                </div>
              )}
              {/* Badge for Selling Price */}
              <div className="absolute top-2 right-2 bg-primary text-white text-sm font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm shadow-lg">
                {formatCurrency(sellingPrice)}
              </div>
            </div>

            <div className="p-4 flex flex-col flex-grow">
              <div className="mb-2">
                <span className="text-xs font-medium text-primary uppercase tracking-wider">
                  {category}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {product.description}
              </p>

              <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-1">
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>List Price:</span>
                  <span className="line-through">{formatCurrency(listPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Selling Price:</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(sellingPrice)}
                  </span>
                </div>
                <button className="w-full mt-2 px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-xs font-medium rounded-lg transition-colors">
                  Add to Order
                </button>
              </div>
            </div>
          </div>
        );
      })
    )}
  </div>
);

const ListView = ({ products }: ViewProps) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-primary-light dark:bg-gray-900">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">&nbsp;</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">Product Name</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">Category</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">Description</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">List Price</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">Selling Price</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">Action</th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {products.length === 0 ? (
          <tr key="no-matches"><td colSpan={7} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">No products found.</td></tr>
        ) : (
          products.map((product) => {
            // Cast to access Algolia fields
            const p = product as any;
            const thumbnail = p.images?.[0]?.thumb || p.image_url;

            // Price logic
            const sellingPrice = typeof p.price === 'number' ? p.price : (product.unitPrice || 0);
            const listPrice = product.listPrice || 0;
            const category = p.category || product.productFamily || product.manufacturer || "Product";

            return (
              <tr key={p.objectID || product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-3">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center overflow-hidden">
                    {thumbnail ? (
                      <img src={thumbnail} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="line-clamp-2" title={product.name}>
                    <div className="text-xs font-bold text-gray-900 dark:text-white">{product.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{product.sku}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="line-clamp-2" title={category}>
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary">{category}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400" style={{ maxWidth: '300px' }}><div className="line-clamp-2">{product.description}</div></td>
                <td className="px-4 py-3 text-xs text-right text-gray-500 dark:text-gray-400 line-through">{formatCurrency(listPrice)}</td>
                <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white font-semibold">{formatCurrency(sellingPrice)}</td>
                <td className="px-4 py-3 text-left"><button className="px-4 py-1.5 bg-primary text-white rounded hover:bg-primary-dark transition-colors text-xs font-medium whitespace-nowrap">Add to Order</button></td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </div>
);

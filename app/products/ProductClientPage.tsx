"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/ui/Pagination";
import { mockProducts } from "./mockData"; // Using mock data for now
import { formatCurrency, formatNumber } from "@/lib/utils/formatting";

// This is a new Client Component to handle all interactivity

export default function ProductClientPage({
  initialProducts,
  initialTotalPages,
  initialCurrentPage,
  productFamilies,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const selectedFamily = searchParams.get("family") || "All";
  const viewMode = searchParams.get("view") === "list" ? "list" : "card";
  const currentPage = Number(searchParams.get("page")) || 1;

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    updateURL({ search: query, page: 1 });
  };

  const updateURL = (params) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
            newParams.set(key, params[key]);
        } else {
            newParams.delete(key);
        }
    });
    router.push(`?${newParams.toString()}`);
  };
  

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {/* Search and Filter Bar */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Search */}
            <div className="flex-1 relative w-full md:max-w-md">
              <input
                type="text"
                placeholder="Search products by name, brand, SKU..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateURL({ view: 'card' })}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "card"
                    ? "bg-primary text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                title="Card View"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button
                onClick={() => updateURL({ view: 'list' })}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-primary text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                title="List View"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
          </div>

          {/* Product Family Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => updateURL({ family: 'All', page: 1 })}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedFamily === "All"
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              All
            </button>
            {productFamilies.map((family) => (
              <button
                key={family}
                onClick={() => updateURL({ family, page: 1 })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedFamily === family
                    ? "bg-primary text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {family}
              </button>
            ))}
          </div>
        </div>
        
        {/* Render products based on viewMode */}
        {viewMode === 'card' ? (
            <CardView products={initialProducts} currentPage={currentPage} totalPages={initialTotalPages} onPageChange={(page) => updateURL({ page })} />
        ) : (
            <ListView products={initialProducts} currentPage={currentPage} totalPages={initialTotalPages} onPageChange={(page) => updateURL({ page })} />
        )}
      </div>
    </>
  );
}

const CardView = ({ products, currentPage, totalPages, onPageChange }) => (
    <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                    No products found matching your criteria.
                </div>
            ) : (
                products.map((product) => (
                    <div key={product.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                        <div className="bg-gray-100 dark:bg-gray-700 h-48 flex items-center justify-center flex-shrink-0">
                            <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                            <div className="mb-2">
                                <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary">{product.productFamily}</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 min-h-[56px] line-clamp-2">{product.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 truncate">{product.description}</p>
                            <div className="space-y-1.5 text-sm mb-4">
                                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">SKU:</span><span className="font-mono text-xs text-gray-900 dark:text-white">{product.sku}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Manufacturer:</span><span className="font-medium text-gray-900 dark:text-white">{product.manufacturer}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Available Qty:</span><span className="font-medium text-gray-900 dark:text-white">{formatNumber(product.availableQty)} <span className="text-gray-500 dark:text-gray-400 text-xs">(MOQ {formatNumber(product.moq)})</span></span></div>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-auto">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-through">{formatCurrency(product.listPrice)}</p>
                                        <p className="text-2xl font-bold text-primary">{formatCurrency(product.unitPrice)}</p>
                                    </div>
                                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium whitespace-nowrap">Add to Order</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
        <div className="mt-8">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} itemName="products" />
        </div>
    </>
);

const ListView = ({ products, currentPage, totalPages, onPageChange }) => (
    <>
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-primary-light dark:bg-gray-900">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Image</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Product Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Description</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Manufacturer</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Product Family</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Available Qty</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">List Price</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Unit Price</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Action</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {products.length === 0 ? (
                        <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">No products found.</td></tr>
                    ) : (
                        products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-3"><div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center"><svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></div></td>
                                <td className="px-4 py-3"><div className="text-sm font-mono text-gray-900 dark:text-white">{product.sku}</div></td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" style={{ maxWidth: '250px' }}><div className="line-clamp-2">{product.description}</div></td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{product.manufacturer}</td>
                                <td className="px-4 py-3"><span className="inline-block px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary">{product.productFamily}</span></td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white"><div>{formatNumber(product.availableQty)}</div><div className="text-xs text-gray-500 dark:text-gray-400">(MOQ {formatNumber(product.moq)})</div></td>
                                <td className="px-4 py-3 text-sm text-right text-gray-500 dark:text-gray-400 line-through">{formatCurrency(product.listPrice)}</td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">{formatCurrency(product.unitPrice)}</td>
                                <td className="px-4 py-3 text-center"><button className="px-4 py-1.5 bg-primary text-white rounded hover:bg-primary-dark transition-colors text-sm font-medium whitespace-nowrap">Add to Order</button></td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
        <div className="mt-8">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} itemName="products" />
        </div>
    </>
);

"use client";

import React from "react";
import algoliasearch from "algoliasearch/lite";
import {
  InstantSearch,
  SearchBox,
  Configure,
  useHits,
  RefinementList,
  ClearRefinements,
  CurrentRefinements
} from "react-instantsearch";
import Sidebar from "@/components/layouts/Sidebar";

const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "movies_index";

function CustomHits() {
  const { hits } = useHits();

  if (hits.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No results found.</p>
        <p className="text-sm">Try adjusting your search or seeding the database.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {hits.map((hit: any) => (
        <div key={hit.objectID} className="flex flex-col h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer">
          <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
            {hit.image ? (
              <img
                src={hit.image}
                alt={hit.title || hit.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <span className="text-4xl">📦</span>
              </div>
            )}
            {hit.price && (
              <div className="absolute top-2 right-2 bg-indigo-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm shadow-lg">
                ${typeof hit.price === 'number' ? hit.price.toFixed(2) : hit.price}
              </div>
            )}
          </div>

          <div className="p-4 flex flex-col flex-grow">
            <div className="mb-2">
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {Array.isArray(hit.genre) ? hit.genre[0] : (hit.genre || hit.category || "Product")}
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {hit.title || hit.name || hit.original_title || "Untitled"}
            </h3>

            {hit.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {hit.description}
              </p>
            )}

            <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
              {hit.price ? (
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  ${typeof hit.price === 'number' ? hit.price.toFixed(2) : hit.price}
                </span>
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">Price not available</span>
              )}
              <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors">
                View
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SearchPage() {
  const [searchClient, setSearchClient] = React.useState<any>(null);
  const [seedStatus, setSeedStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [seedMessage, setSeedMessage] = React.useState("");

  React.useEffect(() => {
    if (typeof window !== 'undefined' &&
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID &&
      process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY) {
      const client = algoliasearch(
        process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
        process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!
      );
      setSearchClient(client);
    }
  }, []);

  const handleSeed = async () => {
    setSeedStatus("loading");
    try {
      const res = await fetch("/api/algolia", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to seed");
      setSeedStatus("success");
      setSeedMessage(`Successfully seeded ${data.count} records! Refresh the page to see results.`);
      // Optional: reload page after a delay
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      setSeedStatus("error");
      setSeedMessage(err.message);
    }
  };

  if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || !process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY) {
    return (
      <Sidebar>
        <div className="p-8 text-center text-red-600">
          <h2 className="text-2xl font-bold mb-2">Configuration Missing</h2>
          <p className="mb-4">Please add NEXT_PUBLIC_ALGOLIA_APP_ID and NEXT_PUBLIC_ALGOLIA_SEARCH_KEY to your .env.local file.</p>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-left max-w-3xl mx-auto">
            <h3 className="font-bold mb-2 text-gray-900 dark:text-white">To fix this:</h3>
            <ol className="list-decimal list-inside mb-2 text-gray-700 dark:text-gray-300">
              <li>Copy the .env_example.env file to .env.local</li>
              <li>Add your Algolia credentials to .env.local</li>
              <li>Make sure to use the correct NEXT_PUBLIC_ prefixed variables</li>
            </ol>
            <p className="text-sm text-gray-600 dark:text-gray-400">Note: Never commit .env.local to version control</p>
          </div>
        </div>
      </Sidebar>
    );
  }

  if (!searchClient) {
    return (
      <Sidebar>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Initializing search...</p>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          {seedMessage && (
            <div className="mb-6">
              <p className={`text-sm ${seedStatus === "success" ? "text-green-600" : "text-red-600"}`}>
                {seedMessage}
              </p>
            </div>
          )}

          <InstantSearch searchClient={searchClient} indexName={indexName}>
            <Configure
              hitsPerPage={200}
              facets={['category', 'genre']}
              maxValuesPerFacet={200}
            />

            <div className="mb-8">
              <SearchBox
                placeholder="Search for products..."
                classNames={{
                  root: "w-full",
                  form: "relative",
                  input: "w-full px-4 py-3 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400",
                  submitIcon: "hidden",
                  resetIcon: "hidden"
                }}
              />
            </div>

            {/* Current Refinements */}
            <div className="mb-4">
              <CurrentRefinements
                classNames={{
                  root: "flex flex-wrap gap-2",
                  list: "flex flex-wrap gap-2",
                  item: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-3 py-1 rounded-full text-sm flex items-center gap-2",
                  label: "font-medium",
                  category: "opacity-75",
                  delete: "hover:text-red-600 dark:hover:text-red-400 cursor-pointer ml-1"
                }}
              />
            </div>

            {/* Filters and Results Layout */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Filters Sidebar */}
              <aside className="lg:w-64 flex-shrink-0">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
                    <ClearRefinements
                      classNames={{
                        root: "",
                        button: "text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium",
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
                        checkbox: "w-4 h-4 text-indigo-600 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400 cursor-pointer",
                        labelText: "ml-2 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white flex-1",
                        count: "ml-auto text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full",
                        showMore: "mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium cursor-pointer"
                      }}
                      translations={{
                        showMoreButtonText({ isShowingMore }) {
                          return isShowingMore ? 'Show less' : 'Show more';
                        }
                      }}
                    />
                  </div>


                  {/* Genre/Type Filter (if available) */}
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
                        checkbox: "w-4 h-4 text-indigo-600 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400 cursor-pointer",
                        labelText: "ml-2 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white flex-1",
                        count: "ml-auto text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full",
                        showMore: "mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium cursor-pointer"
                      }}
                    />
                  </div>
                </div>
              </aside>

              {/* Products Grid */}
              <div className="flex-1">
                <CustomHits />
              </div>
            </div>
          </InstantSearch>
        </div>
      </div>
    </Sidebar>
  );
}

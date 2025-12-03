"use client";

import React from "react";
import algoliasearch from "algoliasearch/lite";
import { InstantSearch, SearchBox, Configure, useHits } from "react-instantsearch";

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
        <div key={hit.objectID} className="flex flex-col h-full bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
          <div className="relative aspect-[2/3] bg-gray-100 overflow-hidden">
            {hit.image ? (
              <img
                src={hit.image}
                alt={hit.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <span className="text-4xl">🎬</span>
              </div>
            )}
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
              {hit.vote_average ? `★ ${hit.vote_average}` : "N/A"}
            </div>
          </div>

          <div className="p-4 flex flex-col flex-grow">
            <div className="mb-1">
              <span className="text-xs font-medium text-indigo-600 uppercase tracking-wider">
                {Array.isArray(hit.genre) ? hit.genre[0] : (hit.genre || "Movie")}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
              {hit.title || hit.name || hit.original_title || "Untitled"}
            </h3>

            <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
              <span>{hit.year || (hit.release_date ? new Date(hit.release_date).getFullYear() : "Unknown")}</span>
              <span className="font-mono opacity-60">ID: {hit.objectID.slice(0, 6)}...</span>
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Search</h1>
          <div className="p-8 text-center text-red-600">
            <h2 className="text-2xl font-bold mb-2">Configuration Missing</h2>
            <p className="mb-4">Please add NEXT_PUBLIC_ALGOLIA_APP_ID and NEXT_PUBLIC_ALGOLIA_SEARCH_KEY to your .env.local file.</p>
            <div className="bg-gray-100 p-4 rounded-lg text-left max-w-3xl mx-auto">
              <h3 className="font-bold mb-2">To fix this:</h3>
              <ol className="list-decimal list-inside mb-2">
                <li>Copy the .env_example.env file to .env.local</li>
                <li>Add your Algolia credentials to .env.local</li>
                <li>Make sure to use the correct NEXT_PUBLIC_ prefixed variables</li>
              </ol>
              <p className="text-sm text-gray-600">Note: Never commit .env.local to version control</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!searchClient) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Search</h1>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Initializing search...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center"> Search</h1>

        {/* Seed Data Section for Demo/Dev */}
        <div className="max-w-2xl mx-auto mb-8 text-center">

          {seedMessage && (
            <p className={`mt-2 text-sm ${seedStatus === "success" ? "text-green-600" : "text-red-600"}`}>
              {seedMessage}
            </p>
          )}
        </div>

        <InstantSearch searchClient={searchClient} indexName={indexName}>
          <Configure hitsPerPage={12} />

          <div className="max-w-2xl mx-auto mb-10">
            <SearchBox
              placeholder="Search for products..."
              classNames={{
                root: "w-full",
                form: "relative",
                input: "w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-500",
                submitIcon: "hidden",
                resetIcon: "hidden"
              }}
            />
          </div>

          <CustomHits />
        </InstantSearch>
      </div>
    </div>
  );
}

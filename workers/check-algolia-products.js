const algoliasearch = require('algoliasearch');
require('dotenv').config();

const client = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
    process.env.ALGOLIA_ADMIN_KEY
);
const index = client.initIndex(process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "dev_woven_products");

async function checkAlgolia() {
    console.log("Searching for Apple Inc and Happy Tech products in Algolia...");
    const results = await index.search('', {
        facetFilters: [
            ['category:Apple Inc', 'category:Happy Tech']
        ]
    });

    console.log(`Found ${results.hits.length} matches.`);
    results.hits.forEach(hit => {
        console.log(`- ID: ${hit.objectID}, Name: ${hit.name}, Category: ${hit.category}`);
    });
}

checkAlgolia().catch(console.error);

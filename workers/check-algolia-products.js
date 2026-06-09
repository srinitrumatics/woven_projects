const algoliasearch = require('algoliasearch');
require('dotenv').config();

const client = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
    process.env.ALGOLIA_ADMIN_KEY
);
const index = client.initIndex(process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "dev_woven_products");

async function checkAlgolia() {
    const results = await index.search('', {
        facetFilters: [
            ['category:Apple Inc', 'category:Happy Tech']
        ]
    });

    results.hits.forEach(hit => {});
}

checkAlgolia().catch(console.error);

const algoliasearch = require('algoliasearch');
require('dotenv').config();

const client = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
    process.env.ALGOLIA_ADMIN_KEY
);
const index = client.initIndex(process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "dev_woven_products");

async function checkAlgolia() {
    console.log("Fetching all products from Algolia...");
    let hits = [];
    await index.browseObjects({
        query: '',
        batch: (batch) => {
            hits = hits.concat(batch);
        }
    });

    console.log(`Total hits in Algolia: ${hits.length}`);
    hits.slice(0, 50).forEach(hit => {
        console.log(`- ID: ${hit.objectID}, Name: ${hit.name}, Category: ${hit.category}, Manufacturer: ${hit.manufacturer}`);
    });
}

checkAlgolia().catch(console.error);

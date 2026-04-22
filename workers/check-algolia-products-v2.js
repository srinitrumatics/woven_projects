const algoliasearch = require('algoliasearch');
require('dotenv').config();

const client = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
    process.env.ALGOLIA_ADMIN_KEY
);
const index = client.initIndex(process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "dev_woven_products");

async function checkAlgolia() {
    console.log("Searching for Apple and Happy in Algolia...");
    const results = await index.search('Apple Happy');

    console.log(`Found ${results.hits.length} matches.`);
    results.hits.forEach(hit => {
        console.log(`- ID: ${hit.objectID}, Name: ${hit.name}, Category: ${hit.category}, Manufacturer: ${hit.manufacturer}`);
    });
}

checkAlgolia().catch(console.error);

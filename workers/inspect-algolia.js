const algoliasearch = require('algoliasearch');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const client = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
    process.env.ALGOLIA_ADMIN_KEY
);
const index = client.initIndex(process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "dev_woven_products");

async function checkAlgolia() {
    console.log("[Function Start] inspect-algolia.js -> checkAlgolia");
    let hits = [];
    await index.browseObjects({
        query: '',
        batch: (batch) => {
            hits = hits.concat(batch);
        }
    });

    hits.slice(0, 50).forEach(hit => {});
}

checkAlgolia().catch(console.error);

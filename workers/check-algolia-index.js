const algoliasearch = require('algoliasearch');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function main() {
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const adminKey = process.env.ALGOLIA_ADMIN_KEY;
    const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'wovn_products_local';

    if (!appId || !adminKey) {
        console.error('❌ Missing NEXT_PUBLIC_ALGOLIA_APP_ID or ALGOLIA_ADMIN_KEY in .env');
        process.exit(1);
    }

    const client = algoliasearch(appId, adminKey);

    try {
        const { items } = await client.listIndices();
        if (!items || items.length === 0) {} else {
            for (const idx of items) {}
        }
    } catch (err) {
        console.error('❌ Failed to list indexes:', err.message);
        console.error('   This usually means the key is a SEARCH key, not an ADMIN key.');
        process.exit(1);
    }

    try {
        const index = client.initIndex(indexName);
        const result = await index.search('', { hitsPerPage: 3 });
        if (result.hits.length > 0) {
            result.hits.forEach(h => );
        }
    } catch (err) {
        console.error(`❌ Error querying index "${indexName}":`, err.message);
    }
}

main();

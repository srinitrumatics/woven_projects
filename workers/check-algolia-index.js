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

    console.log(`\n📋 Algolia App ID : ${appId}`);
    console.log(`🔑 Admin Key      : ${adminKey.slice(0, 8)}...`);
    console.log(`📦 Index Name     : ${indexName}\n`);

    const client = algoliasearch(appId, adminKey);

    // 1. List all indexes
    console.log('=== All indexes in your Algolia app ===');
    try {
        const { items } = await client.listIndices();
        if (!items || items.length === 0) {
            console.log('⚠️  No indexes found. Either the Admin Key is wrong (search-only key) or no data has been synced.');
        } else {
            for (const idx of items) {
                console.log(`  - ${idx.name} (${idx.entries} entries, updated: ${idx.updatedAt})`);
            }
        }
    } catch (err) {
        console.error('❌ Failed to list indexes:', err.message);
        console.error('   This usually means the key is a SEARCH key, not an ADMIN key.');
        process.exit(1);
    }

    // 2. Check the specific index
    console.log(`\n=== Checking index: ${indexName} ===`);
    try {
        const index = client.initIndex(indexName);
        const result = await index.search('', { hitsPerPage: 3 });
        console.log(`✅ Index found. Total records: ${result.nbHits}`);
        if (result.hits.length > 0) {
            console.log('Sample records:');
            result.hits.forEach(h => console.log(`  - [${h.objectID}] ${h.Name || h.name || '(no name field)'}`));
        }
    } catch (err) {
        console.error(`❌ Error querying index "${indexName}":`, err.message);
    }
}

main();

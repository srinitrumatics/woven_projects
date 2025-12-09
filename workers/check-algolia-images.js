const algoliasearch = require('algoliasearch');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function checkAlgoliaImages() {
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || process.env.ALGOLIA_APP_ID;
    const adminKey = process.env.ALGOLIA_ADMIN_KEY;
    const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'dev_woven_products';

    console.log('Checking Algolia index:', indexName);
    console.log('');

    try {
        const client = algoliasearch(appId, adminKey);
        const index = client.initIndex(indexName);

        const response = await index.search('', { hitsPerPage: 10 });
        const hits = response.hits || [];

        console.log(`Total hits: ${hits.length}\n`);

        if (hits.length === 0) {
            console.log('No products found in Algolia.');
            return;
        }

        hits.forEach((hit, i) => {
            console.log(`${i + 1}. ${hit.name || 'Unnamed'}`);
            console.log(`   image_url: ${hit.image_url || 'MISSING'}`);
        });

        const withImages = hits.filter(h => h.image_url && h.image_url !== 'MISSING').length;
        console.log(`\n✅ ${withImages} out of ${hits.length} have image_url`);

    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
    }
}

checkAlgoliaImages();

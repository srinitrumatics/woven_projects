const algoliasearch = require('algoliasearch');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function checkAlgoliaImages() {
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || process.env.ALGOLIA_APP_ID;
    const adminKey = process.env.ALGOLIA_ADMIN_KEY;
    const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'wovn_products_local';

    try {
        const client = algoliasearch(appId, adminKey);
        const index = client.initIndex(indexName);

        const response = await index.search('', { hitsPerPage: 10 });
        const hits = response.hits || [];

        if (hits.length === 0) {
            return;
        }

        hits.forEach((hit, i) => {});

        const withImages = hits.filter(h => h.image_url && h.image_url !== 'MISSING').length;
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
    }
}

checkAlgoliaImages();

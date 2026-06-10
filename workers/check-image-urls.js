const { Pool } = require('pg');
const algoliasearch = require('algoliasearch');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function checkImageUrls() {
    console.log("[Function Start] check-image-urls.js -> checkImageUrls");
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        const pgResult = await client.query(`
            SELECT 
                p.sfid,
                p.name,
                p.image_url as raw_image_url,
                salesforce.transform_sf_product_for_algolia(p.*)->>'image_url' as extracted_url
            FROM salesforce.product2 p
            WHERE p.image_url IS NOT NULL
            LIMIT 5
        `);

        pgResult.rows.forEach((row, i) => {});

        client.release();
    } catch (error) {
        console.error('PostgreSQL Error:', error.message);
    }

    await pool.end();

    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || process.env.ALGOLIA_APP_ID;
    const adminKey = process.env.ALGOLIA_ADMIN_KEY;
    const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'dev_woven_products';

    if (!appId || !adminKey) {
        return;
    }

    try {
        const client = algoliasearch(appId, adminKey);
        const index = client.initIndex(indexName);

        const { results } = await index.search('', { hitsPerPage: 5 });

        results.hits.forEach((hit, i) => {});

        // Summary
        const withImages = results.hits.filter(h => h.image_url).length;
        const withoutImages = results.hits.filter(h => !h.image_url).length;

        if (withImages === 0) {} else if (withoutImages > 0) {} else {}
    } catch (error) {
        console.error('Algolia Error:', error.message);
    }
}

checkImageUrls();

const { Pool } = require('pg');
const algoliasearch = require('algoliasearch');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function checkImageUrls() {
    console.log('=== Checking Image URLs ===\n');

    // 1. Check PostgreSQL transform function
    console.log('1. Checking PostgreSQL Transform Function:\n');
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

        console.log(`Found ${pgResult.rows.length} products with image_url in PostgreSQL:\n`);
        pgResult.rows.forEach((row, i) => {
            console.log(`${i + 1}. ${row.name}`);
            console.log(`   SFID: ${row.sfid}`);
            console.log(`   Raw image_url type: ${typeof row.raw_image_url}`);
            console.log(`   Extracted URL: ${row.extracted_url || 'NULL'}`);
            console.log('');
        });

        client.release();
    } catch (error) {
        console.error('PostgreSQL Error:', error.message);
    }

    await pool.end();

    // 2. Check Algolia index
    console.log('\n2. Checking Algolia Index:\n');
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || process.env.ALGOLIA_APP_ID;
    const adminKey = process.env.ALGOLIA_ADMIN_KEY;
    const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'dev_woven_products';

    if (!appId || !adminKey) {
        console.log('❌ Missing Algolia credentials');
        return;
    }

    try {
        const client = algoliasearch(appId, adminKey);
        const index = client.initIndex(indexName);

        const { results } = await index.search('', { hitsPerPage: 5 });

        console.log(`Found ${results.hits.length} products in Algolia index "${indexName}":\n`);
        results.hits.forEach((hit, i) => {
            console.log(`${i + 1}. ${hit.name || hit.title || 'Unnamed'}`);
            console.log(`   ObjectID: ${hit.objectID}`);
            console.log(`   image_url: ${hit.image_url || 'NULL'}`);
            console.log(`   Has image_url: ${hit.image_url ? '✅ YES' : '❌ NO'}`);
            console.log('');
        });

        // Summary
        const withImages = results.hits.filter(h => h.image_url).length;
        const withoutImages = results.hits.filter(h => !h.image_url).length;

        console.log('\n=== Summary ===');
        console.log(`Products with image_url: ${withImages}`);
        console.log(`Products without image_url: ${withoutImages}`);

        if (withImages === 0) {
            console.log('\n⚠️  No products have image_url in Algolia!');
            console.log('You need to trigger a re-sync of your products.');
            console.log('Run: node workers/trigger-resync.js');
        } else if (withoutImages > 0) {
            console.log('\n⚠️  Some products are missing image_url.');
            console.log('You may need to update those specific products.');
        } else {
            console.log('\n✅ All products have image_url!');
        }

    } catch (error) {
        console.error('Algolia Error:', error.message);
    }
}

checkImageUrls();

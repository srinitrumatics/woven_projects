require('dotenv').config();
const { Pool } = require('pg');
const algoliasearch = require('algoliasearch');

async function testWorkerSetup() {
    try {
        const client = algoliasearch(
            process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
            process.env.ALGOLIA_ADMIN_KEY
        );
        const index = client.initIndex('dev_woven_products');
        await index.search('', { hitsPerPage: 1 });
    } catch (error) {}

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        const pendingResult = await client.query('SELECT * FROM salesforce.get_pending_algolia_syncs(10)');

        const configResult = await client.query('SELECT * FROM salesforce.algolia_index_config WHERE is_enabled = TRUE');

        if (configResult.rows.length > 0) {
            configResult.rows.forEach(config => {});
        }

        client.release();
        await pool.end();
    } catch (error) {
        console.error('   ❌ Database test failed:', error.message);
        await pool.end();
        process.exit(1);
    }
}

testWorkerSetup();

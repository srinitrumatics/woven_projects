const { Pool } = require('pg');
const algoliasearch = require('algoliasearch');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function wipeAndResync() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    const pgClient = await pool.connect();

    const client = algoliasearch(
        process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, 
        process.env.ALGOLIA_ADMIN_KEY
    );

    const targetSchemaArg = process.argv[2];
    const targetIndexArg = process.argv[3];

    let orgRows = [];
    if (targetSchemaArg) {
        const res = await pgClient.query(`SELECT algolia_schema, algolia_index_name, name FROM organizations WHERE algolia_schema ILIKE $1`, [targetSchemaArg]);
        if (res.rows.length > 0) {
            orgRows = res.rows;
        } else {
            const lowercaseSchema = targetSchemaArg.toLowerCase();
            orgRows = [{ algolia_schema: lowercaseSchema, name: 'Manual Override' }];
        }
    } else {
        const res = await pgClient.query(`SELECT algolia_schema, algolia_index_name, name FROM organizations`);
        orgRows = res.rows;
    }

    for (const org of orgRows) {
        const schema = (org.algolia_schema || 'salesforce').replace(/"/g, '');
        const indexName = targetIndexArg || org.algolia_index_name || process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'wovn_products_local';

        const index = client.initIndex(indexName);
        await index.setSettings({ attributesForFaceting: ['category', 'product_availability', 'manufacturer', 'searchable(productFamily)'] });
        await index.clearObjects();
        try {
            await pgClient.query(`
                UPDATE "${schema}".product2
                SET systemmodstamp = CURRENT_TIMESTAMP
                WHERE isactive = true;
            `);
        } catch (err) {
            console.error(`⚠️ Error updating ${schema}.product2: ${err.message}`);
        }
    }

    pgClient.release();
    await pool.end();
}

wipeAndResync().catch(console.error);

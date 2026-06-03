const { Pool } = require('pg');
const algoliasearch = require('algoliasearch');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function wipeAndResync() {
    console.log("Connecting to Postgres...");
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    const pgClient = await pool.connect();

    console.log("Connecting to Algolia...");
    const client = algoliasearch(
        process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, 
        process.env.ALGOLIA_ADMIN_KEY
    );

    const targetSchemaArg = process.argv[2];
    const targetIndexArg = process.argv[3];

    let orgRows = [];
    if (targetSchemaArg) {
        const res = await pgClient.query(`SELECT algolia_schema, algolia_index_name, name FROM organizations WHERE algolia_schema = $1`, [targetSchemaArg]);
        if (res.rows.length > 0) {
            orgRows = res.rows;
        } else {
            console.log(`⚠️ Schema '${targetSchemaArg}' not found in DB. Using as manual override.`);
            orgRows = [{ algolia_schema: targetSchemaArg, name: 'Manual Override' }];
        }
    } else {
        const res = await pgClient.query(`SELECT algolia_schema, algolia_index_name, name FROM organizations`);
        orgRows = res.rows;
    }
    
    for (const org of orgRows) {
        const schema = (org.algolia_schema || 'salesforce').replace(/"/g, '');
        const indexName = targetIndexArg || org.algolia_index_name || process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'wovn_products_local';

        console.log(`\n--- Processing Tenant: Schema "${schema}", Index "${indexName}" ---`);
        
        console.log(`Wiping existing products from the Algolia index...`);
        const index = client.initIndex(indexName);
        await index.clearObjects();
        console.log("✅ Algolia index is now empty!");

        console.log(`Pushing active products in "${schema}".product2 into the sync queue...`);
        try {
            await pgClient.query(`
                UPDATE "${schema}".product2
                SET systemmodstamp = CURRENT_TIMESTAMP
                WHERE isactive = true;
            `);
            console.log(`✅ Success for ${schema}. The syncing worker will now rebuild Algolia.`);
        } catch (err) {
            console.error(`⚠️ Error updating ${schema}.product2: ${err.message}`);
        }
    }
    
    pgClient.release();
    await pool.end();
}

wipeAndResync().catch(console.error);

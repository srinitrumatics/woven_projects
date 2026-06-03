const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function triggerResync() {
    console.log('=== Triggering Product Re-sync to Algolia ===\n');

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        
        // Fetch all organizations
        const orgsResult = await client.query(`SELECT * FROM organizations`);

        for (const org of orgsResult.rows) {
            const schema = (org.algolia_schema || 'salesforce').replace(/"/g, '');
            console.log(`\n--- Processing Tenant: ${org.name || schema} ---`);

            try {
                console.log(`Checking active products in "${schema}".product2...`);
                const countResult = await client.query(`
                    SELECT COUNT(*) FROM "${schema}".product2
                    WHERE isactive = true
                `);
                const activeCount = parseInt(countResult.rows[0].count, 10);
                console.log(`Found ${activeCount} active products in "${schema}".product2.`);

                if (activeCount === 0) {
                    console.log(`⚠️ No active products found in "${schema}".product2. Skipping trigger.`);
                    continue;
                }

                console.log(`Triggering UPDATE for ${activeCount} active products in "${schema}".product2...`);
                
                await client.query(`
                    UPDATE "${schema}".product2
                    SET systemmodstamp = CURRENT_TIMESTAMP
                    WHERE isactive = true;
                `);

                console.log(`✅ Success! The syncing worker will pick up ${activeCount} records for tenant ${schema} in a few seconds.`);
            } catch (dbErr) {
                console.error(`❌ Error triggering sync for ${schema}:`, dbErr.message);
            }
        }

        console.log("\nFinished processing all tenants!");

        client.release();
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
    }

    await pool.end();
}

triggerResync();

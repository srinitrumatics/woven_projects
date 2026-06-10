const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function triggerResync() {
    console.log("[Function Start] trigger-resync.js -> triggerResync");
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        const targetSchemaArg = process.argv[2];

        let orgRows = [];
        if (targetSchemaArg) {
            const res = await client.query(`SELECT * FROM organizations WHERE algolia_schema ILIKE $1`, [targetSchemaArg]);
            if (res.rows.length > 0) {
                orgRows = res.rows;
            } else {
                const lowercaseSchema = targetSchemaArg.toLowerCase();
                orgRows = [{ algolia_schema: lowercaseSchema, name: 'Manual Override' }];
            }
        } else {
            const res = await client.query(`SELECT * FROM organizations`);
            orgRows = res.rows;
        }

        for (const org of orgRows) {
            const schema = (org.algolia_schema || 'salesforce').replace(/"/g, '');

            try {
                const countResult = await client.query(`
                    SELECT COUNT(*) FROM "${schema}".product2
                    WHERE isactive = true
                `);
                const activeCount = parseInt(countResult.rows[0].count, 10);

                if (activeCount === 0) {
                    continue;
                }

                await client.query(`
                    UPDATE "${schema}".product2
                    SET systemmodstamp = CURRENT_TIMESTAMP
                    WHERE isactive = true;
                `);
            } catch (dbErr) {
                console.error(`❌ Error triggering sync for ${schema}:`, dbErr.message);
            }
        }

        client.release();
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
    }

    await pool.end();
}

triggerResync();

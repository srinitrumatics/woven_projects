const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function applyAlgoliaSql() {
    console.log("[Function Start] apply-algolia-sql.js -> applyAlgoliaSql");
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        // Read the SQL file
        const sqlPath = path.join(__dirname, '..', 'db', 'algolia.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        const client = await pool.connect();

        await client.query(sql);

        const testResult = await client.query(`
            SELECT salesforce.transform_sf_product_for_algolia(p.*) as transformed
            FROM salesforce.product2 p
            WHERE p.image_url IS NOT NULL
            LIMIT 1
        `);

        if (testResult.rows.length > 0) {}

        client.release();
    } catch (error) {
        console.error('❌ Error applying SQL:', error.message);
        console.error('\nFull error:');
        console.error(error);
    }

    await pool.end();
}

applyAlgoliaSql();

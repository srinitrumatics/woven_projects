const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function checkManufacturerColumn() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        // Check if manufacturer_name__c column exists
        const result = await client.query(`
            SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns
            WHERE table_schema = 'salesforce'
            AND table_name = 'product2'
            AND column_name LIKE '%manufacturer%'
        `);

        if (result.rows.length > 0) {} else {}

        client.release();
    } catch (error) {
        console.error('Error:', error.message);
    }

    await pool.end();
}

checkManufacturerColumn();

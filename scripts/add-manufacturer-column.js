const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function addManufacturerColumn() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        // Add the manufacturer_name__c column
        await client.query(`
            ALTER TABLE salesforce.product2 
            ADD COLUMN IF NOT EXISTS manufacturer_name__c VARCHAR(255);
        `);

        // Verify the column was added
        const result = await client.query(`
            SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns
            WHERE table_schema = 'salesforce'
            AND table_name = 'product2'
            AND column_name = 'manufacturer_name__c'
        `);

        if (result.rows.length > 0) {}

        client.release();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    await pool.end();
}

addManufacturerColumn();

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

        console.log('Manufacturer columns found:', result.rows.length);
        if (result.rows.length > 0) {
            console.log('Columns:', result.rows);
        } else {
            console.log('No manufacturer columns exist in the database.');
            console.log('\nYou need to add the column to the database first:');
            console.log('ALTER TABLE salesforce.product2 ADD COLUMN manufacturer_name__c VARCHAR(255);');
        }

        client.release();
    } catch (error) {
        console.error('Error:', error.message);
    }

    await pool.end();
}

checkManufacturerColumn();

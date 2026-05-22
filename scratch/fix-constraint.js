const { Pool } = require('pg');
require('dotenv').config();

async function fixConstraint() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        
        console.log("Dropping existing constraint...");
        await client.query(`
            ALTER TABLE salesforce.algolia_sync_log 
            DROP CONSTRAINT IF EXISTS algolia_sync_log_queue_id_fkey;
        `);
        
        console.log("Adding CASCADE constraint...");
        await client.query(`
            ALTER TABLE salesforce.algolia_sync_log 
            ADD CONSTRAINT algolia_sync_log_queue_id_fkey 
            FOREIGN KEY (queue_id) 
            REFERENCES salesforce.algolia_sync_queue(id) 
            ON DELETE CASCADE;
        `);
        
        console.log("✅ Fixed foreign key constraint on algolia_sync_log!");
        client.release();
    } catch (e) {
        console.error("Error fixing constraint:", e.message);
    } finally {
        await pool.end();
    }
}
fixConstraint();

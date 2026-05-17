const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function runSQL() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const sqlPath = path.join(__dirname, '..', 'db', 'algolia.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log("Applying db/algolia.sql to the database...");
    await pool.query(sql);
    console.log("✅ SQL applied successfully!");
    
  } catch (error) {
    console.error("❌ Failed to apply SQL:", error);
  } finally {
    await pool.end();
  }
}

runSQL();

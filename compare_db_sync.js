const { Client } = require('pg');

async function getDbStats(connectionString) {
  const client = new Client({ connectionString, ssl: connectionString.includes('rds.amazonaws.com') ? { rejectUnauthorized: false } : false });
  await client.connect();
  
  const tablesResult = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);
  
  const stats = {};
  for (const row of tablesResult.rows) {
    const tableName = row.table_name;
    const countResult = await client.query(`SELECT COUNT(*) FROM "${tableName}"`);
    stats[tableName] = parseInt(countResult.rows[0].count, 10);
  }
  
  await client.end();
  return stats;
}

async function main() {
  const localDb = 'postgres://postgres:password123@localhost:5432/wovn_web_db';
  const prodDb = 'postgres://u1ejkdf3lhuk2:p25bac9c177dcc22eb1edd264a2c8b178cd736645cd4a8115db17b741565dc6c6@cet8r1hlj0mlnt.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d1tfc5mb7jo0do';
  
  try {
    console.log("Fetching local DB stats...");
    const localStats = await getDbStats(localDb);
    
    console.log("Fetching prod DB stats...");
    const prodStats = await getDbStats(prodDb);
    
    console.log("\n=== Table Row Counts Comparison ===");
    const allTables = new Set([...Object.keys(localStats), ...Object.keys(prodStats)]);
    let allSynced = true;
    
    for (const table of Array.from(allTables).sort()) {
      const localCount = localStats[table] !== undefined ? localStats[table] : 'MISSING';
      const prodCount = prodStats[table] !== undefined ? prodStats[table] : 'MISSING';
      
      const synced = localCount === prodCount ? "✅" : "❌";
      if (localCount !== prodCount) allSynced = false;
      
      console.log(`${synced} Table: ${table.padEnd(30)} | Local: ${String(localCount).padEnd(10)} | Prod: ${String(prodCount).padEnd(10)}`);
    }
    
    console.log(`\nOverall DB Sync Status: ${allSynced ? 'SYNCED ✅' : 'NOT SYNCED ❌'}`);
  } catch (e) {
    console.error("Error connecting to DB:", e.message);
  }
}

main();

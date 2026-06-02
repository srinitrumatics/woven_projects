const { Client } = require('pg');

async function getDbSchema(connectionString) {
  const client = new Client({ connectionString, ssl: connectionString.includes('rds.amazonaws.com') ? { rejectUnauthorized: false } : false });
  await client.connect();
  
  const columnsResult = await client.query(`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    ORDER BY table_name, column_name;
  `);
  
  const schema = {};
  for (const row of columnsResult.rows) {
    if (!schema[row.table_name]) {
      schema[row.table_name] = [];
    }
    schema[row.table_name].push(`${row.column_name} (${row.data_type})`);
  }
  
  await client.end();
  return schema;
}

async function main() {
  const localDb = 'postgres://postgres:password123@localhost:5432/wovn_web_db';
  const prodDb = 'postgres://u1ejkdf3lhuk2:p25bac9c177dcc22eb1edd264a2c8b178cd736645cd4a8115db17b741565dc6c6@cet8r1hlj0mlnt.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d1tfc5mb7jo0do';
  
  try {
    console.log("Fetching local DB schema...");
    const localSchema = await getDbSchema(localDb);
    
    console.log("Fetching prod DB schema...");
    const prodSchema = await getDbSchema(prodDb);
    
    console.log("\n=== Schema Differences (Local vs Prod) ===\n");
    
    const allTables = new Set([...Object.keys(localSchema), ...Object.keys(prodSchema)]);
    
    let tablesMissingInProd = [];
    let tablesMissingInLocal = [];
    let columnDifferences = [];
    
    for (const table of Array.from(allTables).sort()) {
      if (!prodSchema[table]) {
        tablesMissingInProd.push(table);
        continue;
      }
      if (!localSchema[table]) {
        tablesMissingInLocal.push(table);
        continue;
      }
      
      const localCols = localSchema[table];
      const prodCols = prodSchema[table];
      
      const localColsSet = new Set(localCols);
      const prodColsSet = new Set(prodCols);
      
      const missingInProd = localCols.filter(c => !prodColsSet.has(c));
      const missingInLocal = prodCols.filter(c => !localColsSet.has(c));
      
      if (missingInProd.length > 0 || missingInLocal.length > 0) {
        columnDifferences.push({
          table,
          missingInProd,
          missingInLocal
        });
      }
    }
    
    if (tablesMissingInProd.length > 0) {
      console.log("🔴 Tables in Local but MISSING in Prod:");
      tablesMissingInProd.forEach(t => console.log(`  - ${t}`));
      console.log("");
    }
    
    if (tablesMissingInLocal.length > 0) {
      console.log("🟠 Tables in Prod but MISSING in Local:");
      tablesMissingInLocal.forEach(t => console.log(`  - ${t}`));
      console.log("");
    }
    
    if (columnDifferences.length > 0) {
      console.log("🟡 Column Differences (Existing Tables):");
      columnDifferences.forEach(diff => {
        console.log(`\nTable: ${diff.table}`);
        if (diff.missingInProd.length > 0) {
          console.log(`  - Columns only in Local (needs to be added to Prod):`);
          diff.missingInProd.forEach(c => console.log(`      * ${c}`));
        }
        if (diff.missingInLocal.length > 0) {
          console.log(`  - Columns only in Prod (missing in Local):`);
          diff.missingInLocal.forEach(c => console.log(`      * ${c}`));
        }
      });
    }
    
    if (tablesMissingInProd.length === 0 && tablesMissingInLocal.length === 0 && columnDifferences.length === 0) {
      console.log("✅ Schemas are perfectly synced!");
    }
    
  } catch (e) {
    console.error("Error connecting to DB:", e.message);
  }
}

main();

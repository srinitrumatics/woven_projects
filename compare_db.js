const { Client } = require('pg');

async function getDbSchema(connectionString) {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    // If it's localhost, we might not need SSL
    if (connectionString.includes('localhost')) {
        delete client.connectionParameters.ssl;
    }
    await client.connect();
    const res = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      ORDER BY table_name, column_name;
    `);
    
    const schema = {};
    for (const row of res.rows) {
      if (!schema[row.table_name]) schema[row.table_name] = [];
      schema[row.table_name].push({ name: row.column_name, type: row.data_type });
    }
    return schema;
  } catch (e) {
    console.error("Error connecting to " + connectionString + ": ", e.message);
    return null;
  } finally {
    await client.end().catch(()=> {});
  }
}

async function main() {
  const localUrl = "postgres://postgres:password123@localhost:5432/wovn_web_db";
  const prodUrl = "postgres://u7vcadvgd6h0bk:padf9c158cb89a74c49ebe79f0b04eaf8bca30e86ea13b2ec0f875abf37628117@c1jpc731rp0brl.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d1efk8pbo0783p";

  console.log("Fetching local schema...");
  const localSchema = await getDbSchema(localUrl);
  
  console.log("Fetching prod schema...");
  const prodSchema = await getDbSchema(prodUrl);
  
  if (!localSchema || !prodSchema) {
    console.log("Failed to fetch schemas. Cannot compare.");
    return;
  }
  
  const allTables = new Set([...Object.keys(localSchema), ...Object.keys(prodSchema)]);
  
  let differences = 0;
  for (const table of allTables) {
    if (!localSchema[table]) {
      console.log(`Table ${table} is missing in LOCAL database.`);
      differences++;
      continue;
    }
    if (!prodSchema[table]) {
      console.log(`Table ${table} is missing in PROD database.`);
      differences++;
      continue;
    }
    
    const localCols = localSchema[table];
    const prodCols = prodSchema[table];
    
    if (localCols.length !== prodCols.length) {
      console.log(`Table ${table} has different column counts: LOCAL(${localCols.length}) vs PROD(${prodCols.length})`);
      differences++;
    }
    
    for (const lcol of localCols) {
      const pcol = prodCols.find(c => c.name === lcol.name);
      if (!pcol) {
        console.log(`Column ${table}.${lcol.name} is missing in PROD database.`);
        differences++;
      } else if (lcol.type !== pcol.type) {
        console.log(`Column ${table}.${lcol.name} type mismatch: LOCAL(${lcol.type}) vs PROD(${pcol.type})`);
        differences++;
      }
    }
    
    for (const pcol of prodCols) {
      if (!localCols.find(c => c.name === pcol.name)) {
        console.log(`Column ${table}.${pcol.name} is missing in LOCAL database.`);
        differences++;
      }
    }
  }
  
  if (differences === 0) {
    console.log("\nSUCCESS: The table structures in both databases are identical.");
  } else {
    console.log(`\nFound ${differences} schema differences between the databases.`);
  }
}

main();

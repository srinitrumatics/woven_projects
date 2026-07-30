const { Client } = require('pg');

async function getDbSchema(connectionString, schemaName) {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    if (connectionString.includes('localhost')) {
        delete client.connectionParameters.ssl;
    }
    await client.connect();
    const res = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = $1 
      ORDER BY table_name, column_name;
    `, [schemaName]);
    
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
  const devUrl = "postgres://u7vcadvgd6h0bk:padf9c158cb89a74c49ebe79f0b04eaf8bca30e86ea13b2ec0f875abf37628117@c1jpc731rp0brl.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d1efk8pbo0783p";
  const prodUrl = "postgres://u1ejkdf3lhuk2:p25bac9c177dcc22eb1edd264a2c8b178cd736645cd4a8115db17b741565dc6c6@cet8r1hlj0mlnt.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d1tfc5mb7jo0do";

  console.log("Fetching dev schema (sf_fundream)...");
  const devSchema = await getDbSchema(devUrl, 'sf_fundream');
  
  console.log("Fetching prod schema (sf_00da500001tjiapeat)...");
  const prodSchema = await getDbSchema(prodUrl, 'sf_00da500001tjiapeat');
  
  if (!devSchema || !prodSchema) {
    console.log("Failed to fetch schemas. Cannot compare.");
    return;
  }
  
  const allTables = new Set([...Object.keys(devSchema), ...Object.keys(prodSchema)]);
  
  let differences = 0;
  for (const table of allTables) {
    if (!devSchema[table]) {
      console.log(`Table ${table} is missing in DEV database.`);
      differences++;
      continue;
    }
    if (!prodSchema[table]) {
      console.log(`Table ${table} is missing in PROD database.`);
      differences++;
      continue;
    }
    
    const devCols = devSchema[table];
    const prodCols = prodSchema[table];
    
    for (const dcol of devCols) {
      const pcol = prodCols.find(c => c.name === dcol.name);
      if (!pcol) {
        console.log(`Column ${table}.${dcol.name} is missing in PROD database. ADD COLUMN ${dcol.name} ${dcol.type}`);
        differences++;
      } else if (dcol.type !== pcol.type) {
        console.log(`Column ${table}.${dcol.name} type mismatch: DEV(${dcol.type}) vs PROD(${pcol.type})`);
        differences++;
      }
    }
    
    for (const pcol of prodCols) {
      if (!devCols.find(c => c.name === pcol.name)) {
        console.log(`Column ${table}.${pcol.name} is missing in DEV database.`);
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

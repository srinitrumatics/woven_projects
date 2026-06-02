const { Client } = require('pg');

async function getAlgoliaObjects(connectionString) {
  const client = new Client({ connectionString, ssl: connectionString.includes('rds.amazonaws.com') ? { rejectUnauthorized: false } : false });
  await client.connect();
  
  // Get functions containing 'algolia'
  const routinesResult = await client.query(`
    SELECT routine_name, routine_definition 
    FROM information_schema.routines 
    WHERE specific_schema = 'public' 
    AND (routine_name ILIKE '%algolia%' OR routine_definition ILIKE '%algolia%')
    ORDER BY routine_name;
  `);
  
  // Get triggers containing 'algolia'
  const triggersResult = await client.query(`
    SELECT trigger_name, event_object_table, action_statement
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public'
    AND (trigger_name ILIKE '%algolia%' OR action_statement ILIKE '%algolia%')
    ORDER BY event_object_table, trigger_name;
  `);
  
  await client.end();
  
  return {
    routines: routinesResult.rows,
    triggers: triggersResult.rows
  };
}

async function main() {
  const localDb = 'postgres://postgres:password123@localhost:5432/wovn_web_db';
  const prodDb = 'postgres://u1ejkdf3lhuk2:p25bac9c177dcc22eb1edd264a2c8b178cd736645cd4a8115db17b741565dc6c6@cet8r1hlj0mlnt.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d1tfc5mb7jo0do';
  
  try {
    const local = await getAlgoliaObjects(localDb);
    const prod = await getAlgoliaObjects(prodDb);
    
    console.log("=== Algolia Functions ===");
    console.log(`Local count: ${local.routines.length}, Prod count: ${prod.routines.length}`);
    if (local.routines.length > 0) {
      local.routines.forEach(r => console.log(`- Local: ${r.routine_name}`));
    }
    if (prod.routines.length > 0) {
      prod.routines.forEach(r => console.log(`- Prod: ${r.routine_name}`));
    }
    
    console.log("\n=== Algolia Triggers ===");
    console.log(`Local count: ${local.triggers.length}, Prod count: ${prod.triggers.length}`);
    if (local.triggers.length > 0) {
      local.triggers.forEach(t => console.log(`- Local: ${t.trigger_name} (on ${t.event_object_table})`));
    }
    if (prod.triggers.length > 0) {
      prod.triggers.forEach(t => console.log(`- Prod: ${t.trigger_name} (on ${t.event_object_table})`));
    }
    
  } catch (e) {
    console.error("Error:", e.message);
  }
}

main();

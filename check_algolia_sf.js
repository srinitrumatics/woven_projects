const { Client } = require('pg');

async function getAlgoliaObjects(connectionString) {
  const client = new Client({ connectionString, ssl: connectionString.includes('rds.amazonaws.com') ? { rejectUnauthorized: false } : false });
  await client.connect();
  
  // Get functions containing 'algolia'
  const routinesResult = await client.query(`
    SELECT specific_schema, routine_name
    FROM information_schema.routines 
    WHERE (routine_name ILIKE '%algolia%' OR routine_definition ILIKE '%algolia%')
    ORDER BY specific_schema, routine_name;
  `);
  
  // Get triggers containing 'algolia'
  const triggersResult = await client.query(`
    SELECT trigger_schema, trigger_name, event_object_table
    FROM information_schema.triggers 
    WHERE (trigger_name ILIKE '%algolia%' OR action_statement ILIKE '%algolia%')
    ORDER BY trigger_schema, event_object_table, trigger_name;
  `);
  
  await client.end();
  
  return {
    routines: routinesResult.rows.map(r => `${r.specific_schema}.${r.routine_name}`),
    triggers: triggersResult.rows.map(t => `${t.trigger_schema}.${t.trigger_name} (on ${t.event_object_table})`)
  };
}

async function main() {
  const localDb = 'postgres://postgres:password123@localhost:5432/wovn_web_db';
  const prodDb = 'postgres://u1ejkdf3lhuk2:p25bac9c177dcc22eb1edd264a2c8b178cd736645cd4a8115db17b741565dc6c6@cet8r1hlj0mlnt.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d1tfc5mb7jo0do';
  
  try {
    const local = await getAlgoliaObjects(localDb);
    const prod = await getAlgoliaObjects(prodDb);
    
    console.log("=== Algolia Functions ===");
    const allRoutines = Array.from(new Set([...local.routines, ...prod.routines])).sort();
    for (const r of allRoutines) {
      console.log(`- ${r}: Local(${local.routines.includes(r) ? 'YES' : 'NO'}) | Prod(${prod.routines.includes(r) ? 'YES' : 'NO'})`);
    }
    
    console.log("\n=== Algolia Triggers ===");
    const allTriggers = Array.from(new Set([...local.triggers, ...prod.triggers])).sort();
    for (const t of allTriggers) {
      console.log(`- ${t}: Local(${local.triggers.includes(t) ? 'YES' : 'NO'}) | Prod(${prod.triggers.includes(t) ? 'YES' : 'NO'})`);
    }
    
  } catch (e) {
    console.error("Error:", e.message);
  }
}

main();

const { Client } = require('pg');

async function getAdvancedSchema(connectionString) {
  const client = new Client({ connectionString, ssl: connectionString.includes('rds.amazonaws.com') ? { rejectUnauthorized: false } : false });
  await client.connect();
  
  // Get functions & procedures
  const routinesResult = await client.query(`
    SELECT routine_name, routine_type 
    FROM information_schema.routines 
    WHERE specific_schema = 'public' 
    ORDER BY routine_name;
  `);
  
  // Get triggers
  const triggersResult = await client.query(`
    SELECT trigger_name, event_object_table 
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public'
    ORDER BY event_object_table, trigger_name;
  `);
  
  await client.end();
  
  return {
    routines: routinesResult.rows.map(r => `${r.routine_name} [${r.routine_type}]`),
    triggers: triggersResult.rows.map(t => `${t.trigger_name} (on table ${t.event_object_table})`)
  };
}

async function main() {
  const localDb = 'postgres://postgres:password123@localhost:5432/wovn_web_db';
  const prodDb = 'postgres://u1ejkdf3lhuk2:p25bac9c177dcc22eb1edd264a2c8b178cd736645cd4a8115db17b741565dc6c6@cet8r1hlj0mlnt.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d1tfc5mb7jo0do';
  
  try {
    console.log("Fetching local DB routines and triggers...");
    const local = await getAdvancedSchema(localDb);
    
    console.log("Fetching prod DB routines and triggers...");
    const prod = await getAdvancedSchema(prodDb);
    
    console.log("\n=== Functions & Procedures ===");
    const allRoutines = Array.from(new Set([...local.routines, ...prod.routines])).sort();
    let routinesSynced = true;
    for (const r of allRoutines) {
      const inLocal = local.routines.includes(r);
      const inProd = prod.routines.includes(r);
      if (inLocal !== inProd) {
        routinesSynced = false;
        console.log(`- ${r}: Local(${inLocal ? 'YES' : 'NO'}) | Prod(${inProd ? 'YES' : 'NO'})`);
      }
    }
    if (routinesSynced) console.log("✅ All functions & procedures perfectly matched.");
    
    console.log("\n=== Triggers ===");
    const allTriggers = Array.from(new Set([...local.triggers, ...prod.triggers])).sort();
    let triggersSynced = true;
    for (const t of allTriggers) {
      const inLocal = local.triggers.includes(t);
      const inProd = prod.triggers.includes(t);
      if (inLocal !== inProd) {
        triggersSynced = false;
        console.log(`- ${t}: Local(${inLocal ? 'YES' : 'NO'}) | Prod(${inProd ? 'YES' : 'NO'})`);
      }
    }
    if (triggersSynced) console.log("✅ All triggers perfectly matched.");
    
  } catch (e) {
    console.error("Error:", e.message);
  }
}

main();

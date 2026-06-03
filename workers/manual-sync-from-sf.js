const { Pool } = require('pg');
const algoliasearch = require('algoliasearch');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function getSalesforceSession(org) {
  const tokenUrl = org.salesforce_auth_url || process.env.SF_AUTH_URL || "";
  const clientId = org.client_id || process.env.SF_CLIENT_ID || "";
  const clientSecret = org.client_secret || process.env.SF_CLIENT_SECRET || "";

  if (!tokenUrl || !clientId || !clientSecret) {
      throw new Error("Missing Salesforce credentials for organization");
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  
  if (!res.ok) throw new Error("Failed to authenticate with Salesforce");
  const data = await res.json();
  return { accessToken: data.access_token, instanceUrl: data.instance_url || org.salesforce_url || process.env.SF_DATA_URL };
}

async function fetchProductsFromSalesforce(session) {
  let allRecords = [];
  const query = `
    SELECT Id, ProductCode, Name, Description, IsActive, Family, CreatedDate, SystemModstamp, 
           gtherp__Product_Availability__c, gtherp__Manufacturer_Name__c,  
           gtherp__Available_To_Sell__c,
           (SELECT Id, Name, UnitPrice, gtherp__Selling_Unit_Price__c FROM PricebookEntries)
    FROM Product2
    WHERE IsActive = true
  `;
  let url = `${session.instanceUrl}/services/data/v60.0/query?q=${encodeURIComponent(query)}`;

  while (url) {
    const res = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${session.accessToken}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Failed to fetch products: ${res.statusText}. ${errorBody}`);
    }
    const data = await res.json();
    allRecords = allRecords.concat(data.records);

    if (data.nextRecordsUrl) {
      url = `${session.instanceUrl}${data.nextRecordsUrl}`;
    } else {
      url = null;
    }
  }

  return allRecords;
}

async function main() {
  try {
    console.log("Connecting to Postgres...");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    const client = await pool.connect();
    
    const targetSchemaArg = process.argv[2];

    let orgRows = [];
    if (targetSchemaArg) {
        const res = await client.query(`SELECT * FROM organizations WHERE algolia_schema = $1`, [targetSchemaArg]);
        if (res.rows.length > 0) {
            orgRows = res.rows;
        } else {
            console.log(`⚠️ Schema '${targetSchemaArg}' not found in DB. Using as manual override with default env credentials.`);
            orgRows = [{ algolia_schema: targetSchemaArg, name: 'Manual Override' }];
        }
    } else {
        const res = await client.query(`SELECT * FROM organizations`);
        orgRows = res.rows;
    }
    
    for (const org of orgRows) {
        const schema = (org.algolia_schema || 'salesforce').replace(/"/g, '');
        console.log(`\n--- Processing Tenant: ${org.name || schema} ---`);
        
        let session;
        try {
            session = await getSalesforceSession(org);
            console.log(`✅ Authenticated with Salesforce for ${org.name}`);
        } catch (authErr) {
            console.warn(`⚠️ Skipping ${org.name}: ${authErr.message}`);
            continue;
        }

        console.log("Fetching products from Salesforce via SOQL...");
        const products = await fetchProductsFromSalesforce(session);
        console.log(`Found ${products.length} active products from Salesforce.`);

        let processedCount = 0;
        let inactiveCount = 0;

        for (const p of products) {
          if (p.IsActive !== true && p.IsActive !== 'true') {
            inactiveCount++;
            continue;
          }

          processedCount++;
          try {
              await client.query(`
                       INSERT INTO "${schema}".product2 (
                           sfid, productcode, name, description, isactive, family,
                           gtherp__price__c, list_price__c, gtherp__stock_quantity__c,
                           gtherp__available_quantity__c, gtherp__discount__c,
                           gtherp__category__c, gtherp__sub_category__c,
                           manufacturer_name__c, product_availability__c, createddate, systemmodstamp
                       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                       ON CONFLICT (sfid) DO UPDATE SET
                           productcode = EXCLUDED.productcode,
                           name = EXCLUDED.name,
                           description = EXCLUDED.description,
                           isactive = EXCLUDED.isactive,
                           family = EXCLUDED.family,
                           gtherp__price__c = EXCLUDED.gtherp__price__c,
                           list_price__c = EXCLUDED.list_price__c,
                           gtherp__stock_quantity__c = EXCLUDED.gtherp__stock_quantity__c,
                           gtherp__available_quantity__c = EXCLUDED.gtherp__available_quantity__c,
                           gtherp__category__c = EXCLUDED.gtherp__category__c,
                           gtherp__sub_category__c = EXCLUDED.gtherp__sub_category__c,
                           manufacturer_name__c = EXCLUDED.manufacturer_name__c,
                           product_availability__c = EXCLUDED.product_availability__c,
                           systemmodstamp = EXCLUDED.systemmodstamp
                   `, [
                p.Id, p.ProductCode, p.Name, p.Description, p.IsActive, p.Family,
                (p.PricebookEntries && p.PricebookEntries.records && p.PricebookEntries.records[0] && p.PricebookEntries.records[0].gtherp__Selling_Unit_Price__c) || 0,
                (p.PricebookEntries && p.PricebookEntries.records && p.PricebookEntries.records[0] && p.PricebookEntries.records[0].UnitPrice) || 0,
                p.gtherp__Available_To_Sell__c || 0,
                p.gtherp__Available_To_Sell__c || 0,
                0,
                p.Family || 'No Category',
                '',
                p.gtherp__Manufacturer_Name__c || '',
                p.gtherp__Product_Availability__c || '',
                p.CreatedDate, p.SystemModstamp || ''
              ]);
          } catch (dbErr) {
              console.error(`Error inserting product ${p.Id} for ${schema}:`, dbErr.message);
          }
        }

        console.log(`✅ Processed ${processedCount} active products for ${org.name}.`);
        if (inactiveCount > 0) {
          console.log(`⚠️  Skipped ${inactiveCount} inactive products returned by Salesforce.`);
        }
    }

    console.log("\nFinished processing all tenants!");
    console.log("This will trigger the local algolia_sync_queue! Run 'npm run start:worker' to push them to Algolia.");

    await client.release();
    await pool.end();
  } catch (e) {
    console.error("Error:", e.message);
  }
}

main();

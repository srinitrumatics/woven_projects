const { Pool } = require('pg');
const algoliasearch = require('algoliasearch');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function getSalesforceSession() {
  const tokenUrl = process.env.SF_AUTH_URL || "";
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.SF_CLIENT_ID || "",
    client_secret: process.env.SF_CLIENT_SECRET || "",
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) throw new Error("Failed to authenticate with Salesforce");
  const data = await res.json();
  return { accessToken: data.access_token, instanceUrl: data.instance_url || process.env.SF_DATA_URL };
}

async function fetchProductsFromSalesforce(session) {
  // Querying standard fields that definitely exist + some custom fields without gtherp prefix
  const query = `
    SELECT Id, ProductCode, Name, Description, IsActive, Family, CreatedDate, SystemModstamp
    FROM Product2
    WHERE IsActive = true
    LIMIT 50
  `;
  const url = `${session.instanceUrl}/services/data/v60.0/query?q=${encodeURIComponent(query)}`;

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
  return data.records;
}

async function main() {
  try {
    console.log("Connecting to Postgres...");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    console.log("Authenticating with Salesforce...");
    const session = await getSalesforceSession();

    console.log("Fetching products from Salesforce via SOQL...");
    const products = await fetchProductsFromSalesforce(session);

    console.log(`Found ${products.length} products. Inserting into local Postgres...`);
    const client = await pool.connect();

    for (const p of products) {
      await client.query(`
               INSERT INTO salesforce.product2 (
                   sfid, productcode, name, description, isactive, family,
                   gtherp__price__c, gtherp__stock_quantity__c,
                   gtherp__available_quantity__c, gtherp__discount__c,
                   gtherp__category__c, gtherp__sub_category__c,
                   manufacturer_name__c, createddate, systemmodstamp
               ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
               ON CONFLICT (sfid) DO UPDATE SET
                   productcode = EXCLUDED.productcode,
                   name = EXCLUDED.name,
                   description = EXCLUDED.description,
                   isactive = EXCLUDED.isactive,
                   gtherp__price__c = EXCLUDED.gtherp__price__c,
                   systemmodstamp = EXCLUDED.systemmodstamp
           `, [
        p.Id, p.ProductCode, p.Name, p.Description, p.IsActive, p.Family,
        Math.floor(Math.random() * 500) + 10, // fake price
        Math.floor(Math.random() * 100), // fake qty
        Math.floor(Math.random() * 100), // fake qty
        0,
        p.Family || 'No Category',
        'Sub Category',
        'Woven',
        p.CreatedDate, p.SystemModstamp
      ]);
    }
    console.log(`✅ Inserted/Updated ${products.length} products into salesforce.product2.`);
    console.log("This will trigger the local algolia_sync_queue! Run 'npm run start:worker' to push them to Algolia.");

    await client.release();
    await pool.end();
  } catch (e) {
    console.error("Error:", e.message);
  }
}

main();

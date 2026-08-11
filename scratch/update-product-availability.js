const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const PRODUCT_ID = "01tEi00000NUUMnIAP";
const ORG_ALGOLIA_INDEX = "woven_products_infinitylocal";

async function getOrgCreds() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query(
      "select salesforce_url, salesforce_auth_url, client_id, client_secret from organizations where algolia_index_name = $1",
      [ORG_ALGOLIA_INDEX]
    );
    if (res.rows.length === 0) throw new Error(`No organization found for index ${ORG_ALGOLIA_INDEX}`);
    return res.rows[0];
  } finally {
    await pool.end();
  }
}

async function getSalesforceSession(creds) {
  const tokenUrl = creds.salesforce_auth_url;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: creds.client_id,
    client_secret: creds.client_secret,
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Failed to authenticate with Salesforce: ${res.status} ${text}`);
  const data = JSON.parse(text);
  return { accessToken: data.access_token, instanceUrl: data.instance_url || creds.salesforce_url };
}

async function main() {
  try {
    const creds = await getOrgCreds();
    const session = await getSalesforceSession(creds);
    const url = `${session.instanceUrl.replace(/\/$/, '')}/services/data/v60.0/sobjects/Product2/${PRODUCT_ID}`;

    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gtherp__Product_Availability__c: "Available" }),
    });

    if (res.status === 204) {
      console.log(`Updated Product2/${PRODUCT_ID}: Product_Availability__c = Available`);
    } else {
      const text = await res.text();
      console.error(`Update failed (${res.status}):`, text);
      process.exit(1);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();

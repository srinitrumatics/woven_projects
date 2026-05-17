const { Pool } = require('pg');
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
  return { accessToken: data.access_token, instanceUrl: data.instance_url };
}

async function main() {
  try {
    const session = await getSalesforceSession();
    const url = `${session.instanceUrl}/services/data/v60.0/sobjects/Product2/describe`;
    
    const res = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${session.accessToken}`,
        "Content-Type": "application/json"
      }
    });
    
    const data = await res.json();
    const allFields = data.fields.map(f => f.name);
    
    console.log("All Fields on Product2:");
    console.log(allFields.sort());
    
  } catch (error) {
    console.error(error);
  }
}

main();

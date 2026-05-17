const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function getSalesforceSession() {
  const tokenUrl = process.env.SF_AUTH_URL;
  const body = new URLSearchParams({
    grant_type: "password",
    client_id: process.env.SF_CLIENT_ID,
    client_secret: process.env.SF_CLIENT_SECRET,
    username: process.env.SF_USERNAME,
    password: process.env.SF_PASSWORD,
  });

  const res = await fetch(tokenUrl, { method: "POST", body });
  const data = await res.json();
  return { accessToken: data.access_token, instanceUrl: data.instance_url || process.env.SF_DATA_URL };
}

async function main() {
  try {
    const session = await getSalesforceSession();
    // Assuming accountId and contactId can be found from previous context, let's just query a few Inventory_Position__c records
    const query = `SELECT Id, Name, gtherp__Product__c, gtherp__Inventory_Account__c, gtherp__Ownership_Status__c, gtherp__Invoiced__c FROM gtherp__Inventory_Position__c LIMIT 1`;
    const url = `${session.instanceUrl}/services/data/v60.0/query?q=${encodeURIComponent(query)}`;
    
    const res = await fetch(url, { headers: { "Authorization": `Bearer ${session.accessToken}` }});
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch(e) {
    console.error(e);
  }
}
main();

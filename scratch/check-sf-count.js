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

async function main() {
   try {
       const session = await getSalesforceSession();
       
       const query = `SELECT COUNT(Id) FROM Product2 WHERE IsActive = true`;
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
       console.log("Count in Salesforce (IsActive = true):", data.records[0].expr0);
       
       const queryAll = `SELECT COUNT(Id) FROM Product2`;
       const urlAll = `${session.instanceUrl}/services/data/v60.0/query?q=${encodeURIComponent(queryAll)}`;
       const resAll = await fetch(urlAll, {
         headers: {
           "Authorization": `Bearer ${session.accessToken}`,
           "Content-Type": "application/json"
         }
       });
       const dataAll = await resAll.json();
       console.log("Count in Salesforce (All):", dataAll.records[0].expr0);

   } catch(e) {
       console.error("Error:", e.message);
   }
}

main();

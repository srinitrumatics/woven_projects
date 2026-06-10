const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function getSalesforceSession() {
    console.log("[Function Start] check-sf-fields.js -> getSalesforceSession");
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

async function describeProduct2() {
    console.log("[Function Start] check-sf-fields.js -> describeProduct2");
    const session = await getSalesforceSession();
    const url = `${session.instanceUrl}/services/data/v60.0/sobjects/Product2/describe`;
    const res = await fetch(url, {
        headers: {
            "Authorization": `Bearer ${session.accessToken}`,
            "Content-Type": "application/json"
        }
    });
    const data = await res.json();
    data.fields.forEach(f => {
        if (f.name.includes('Avail') || f.name.includes('Stock')) {}
    });
}

describeProduct2().catch(console.error);

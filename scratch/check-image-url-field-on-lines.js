require('dotenv').config();

const tokenUrl = process.env.SF_AUTH_URL;
const clientId = process.env.SF_CLIENT_ID;
const clientSecret = process.env.SF_CLIENT_SECRET;

async function getToken() {
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Auth failed: ${res.status} ${text}`);
  const data = JSON.parse(text);
  return { accessToken: data.access_token, instanceUrl: data.instance_url || process.env.SF_DATA_URL };
}

async function main() {
  const { accessToken, instanceUrl } = await getToken();
  console.log('Authenticated. Instance URL:', instanceUrl);

  const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

  // 1. List all SObjects, find candidates matching our line-item objects.
  const listRes = await fetch(`${instanceUrl}/services/data/v60.0/sobjects/`, { headers });
  if (!listRes.ok) throw new Error(`sobjects list failed: ${listRes.status} ${await listRes.text()}`);
  const listData = await listRes.json();

  const knownCandidates = [
    'Invoice_Line__c',
    'Purchase_Order_Line__c',
    'Supplier_Bill_Line__c',
    'Shipping_Manifest_Line__c',
  ];

  const lineLike = listData.sobjects
    .map((o) => o.name)
    .filter((name) => /line|product/i.test(name) && name.endsWith('__c'));

  const candidates = Array.from(new Set([...knownCandidates, ...lineLike]));
  console.log(`\nFound ${candidates.length} candidate objects (matching known names + */Line*|*Product*__c pattern):`);
  console.log(candidates.join(', '));

  // 2. Describe each candidate and check for Image_URL__c.
  console.log('\n--- Image_URL__c field check ---');
  const results = [];
  for (const objName of candidates) {
    try {
      const descRes = await fetch(`${instanceUrl}/services/data/v60.0/sobjects/${objName}/describe`, { headers });
      if (!descRes.ok) {
        results.push({ objName, status: `describe failed (${descRes.status})` });
        continue;
      }
      const desc = await descRes.json();
      const hasField = desc.fields.some((f) => f.name === 'Image_URL__c');
      results.push({ objName, status: hasField ? 'HAS Image_URL__c' : 'no Image_URL__c field' });
    } catch (err) {
      results.push({ objName, status: `error: ${err.message}` });
    }
  }

  results.forEach((r) => console.log(`  ${r.objName.padEnd(35)} -> ${r.status}`));
}

main().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});

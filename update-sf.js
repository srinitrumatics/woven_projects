const fs = require('fs');
let file = fs.readFileSync('lib/salesforce-service.ts', 'utf8');

file = `import { getOrgConfig } from './org-config';\n` + file;

// Update getSalesforceSession
file = file.replace(/export async function getSalesforceSession\(\) \{\s*\/\/ obtain or reuse token\s*const tokenUrl = process\.env\.SF_AUTH_URL \|\| "";\s*const body = new URLSearchParams\(\{[\s\S]*?\}\);\s*const res = await fetchWithLogging\(tokenUrl, \{/m, 
`export async function getSalesforceSession() {
  const orgConfig = await getOrgConfig().catch(e => {
    console.warn("Could not load org config, falling back to env:", e.message);
    return null;
  });
  
  const tokenUrl = orgConfig?.salesforceAuthUrl || process.env.SF_AUTH_URL || "";
  const clientId = orgConfig?.clientId || process.env.SF_CLIENT_ID || "";
  const clientSecret = orgConfig?.clientSecret || process.env.SF_CLIENT_SECRET || "";

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetchWithLogging(tokenUrl, {`);

file = file.replace(/instanceUrl: tokenData\.instance_url,\s*\};\s*\}/m, 
`instanceUrl: orgConfig?.salesforceUrl || tokenData.instance_url || process.env.SF_DATA_URL || "",
  };
}`);

// Replace global process.env.SF_DATA_URL with session.instanceUrl or orgConfig?.salesforceUrl where possible
// Since getSalesforceSession returns instanceUrl, let's use it.
file = file.replace(/let Url = \`\$\{process\.env\.SF_DATA_URL\}\/services\/apexrest\/gtherp\/orders\`;/g, 
`let Url = \`\$\{session.instanceUrl\}\/services\/apexrest\/gtherp\/orders\`;`);

file = file.replace(/const url = \`\$\{process\.env\.SF_DATA_URL\}\/services\/apexrest\/gtherp\/orders\`;/g, 
`const url = \`\$\{session.instanceUrl\}\/services\/apexrest\/gtherp\/orders\`;`);

fs.writeFileSync('lib/salesforce-service.ts', file);

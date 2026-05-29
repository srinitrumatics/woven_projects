const fs = require('fs');
let content = fs.readFileSync('app/api/salesforce/token/route.ts', 'utf8');

content = content.replace(/import \{ NextResponse \} from "next\/server";/, `import { NextResponse } from "next/server";
import { getOrgConfig } from "@/lib/org-config";`);

content = content.replace(/let cachedToken: string \| null = null;\nlet tokenExpiry: number \| null = null;/, `let tokenCache: Record<string, { token: string, expiry: number }> = {};`);

content = content.replace(/export async function POST\(\) \{[\s\S]*?try \{[\s\S]*?\/\/ if cached token still valid, reuse it[\s\S]*?if \(cachedToken && tokenExpiry && Date.now\(\) < tokenExpiry\) \{[\s\S]*?return NextResponse\.json\(\{ access_token: cachedToken \}\);[\s\S]*?\}/, 
`export async function POST() {
  try {
    const orgConfig = await getOrgConfig().catch(e => {
      console.warn("Could not load org config, falling back to env:", e.message);
      return null;
    });

    const cacheKey = orgConfig?.id || 'default';
    const cached = tokenCache[cacheKey];

    if (cached && Date.now() < cached.expiry) {
      return NextResponse.json({ access_token: cached.token });
    }`);

content = content.replace(/const tokenUrl = "https:\/\/test\.salesforce\.com\/services\/oauth2\/token";/, `const tokenUrl = orgConfig?.salesforceAuthUrl || process.env.SF_AUTH_URL || "https://test.salesforce.com/services/oauth2/token";`);

content = content.replace(/client_id: process\.env\.SF_CLIENT_ID \|\| "",/g, `client_id: orgConfig?.clientId || process.env.SF_CLIENT_ID || "",`);
content = content.replace(/client_secret: process\.env\.SF_CLIENT_SECRET \|\| "",/g, `client_secret: orgConfig?.clientSecret || process.env.SF_CLIENT_SECRET || "",`);

content = content.replace(/cachedToken = data\.access_token;\n\s*tokenExpiry = Date\.now\(\) \+ 55 \* 60 \* 1000; \/\/ ~55 minutes/, `tokenCache[cacheKey] = {
      token: data.access_token,
      expiry: Date.now() + 55 * 60 * 1000
    };`);

fs.writeFileSync('app/api/salesforce/token/route.ts', content);

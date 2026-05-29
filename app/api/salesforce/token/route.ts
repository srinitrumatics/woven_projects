import { NextResponse } from "next/server";
import { getOrgConfig } from "@/lib/org-config";

// simple in-memory token cache (clears on server restart)
let tokenCache: Record<string, { token: string, expiry: number }> = {};

export async function POST() {
  try {
    const orgConfig = await getOrgConfig().catch(e => {
      console.warn("Could not load org config, falling back to env:", e.message);
      return null;
    });

    const cacheKey = orgConfig?.id || 'default';
    const cached = tokenCache[cacheKey];

    if (cached && Date.now() < cached.expiry) {
      return NextResponse.json({ access_token: cached.token });
    }

    // build Salesforce token URL
    const tokenUrl = orgConfig?.salesforceAuthUrl || process.env.SF_AUTH_URL || "https://test.salesforce.com/services/oauth2/token";
    const body = new URLSearchParams({
      grant_type: "password",
      client_id: orgConfig?.clientId || process.env.SF_CLIENT_ID || "",
      client_secret: orgConfig?.clientSecret || process.env.SF_CLIENT_SECRET || "",
      username: process.env.SF_USERNAME || "",
      password: process.env.SF_PASSWORD || "",
    });

    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Token request failed:", err);
      return NextResponse.json({ error: "Salesforce auth failed" }, { status: 401 });
    }

    const data = await res.json();

    tokenCache[cacheKey] = {
      token: data.access_token,
      expiry: Date.now() + 55 * 60 * 1000
    };
    return NextResponse.json(data);
  } catch (err) {
    console.error("Token error:", err);
    return NextResponse.json({ error: "Token fetch failed" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getOrgConfig } from "@/lib/org-config";

// simple in-memory token cache (clears on server restart)
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export async function POST() {
  try {
    // if cached token still valid, reuse it
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      return NextResponse.json({ access_token: cachedToken });
    }

    // Fetch org config from organizations table (falls back to env vars)
    const orgConfig = await getOrgConfig().catch(e => {
      console.warn("Token route: Could not load org config, falling back to env:", e.message);
      return null;
    });

    // build Salesforce token URL from org config or env vars
    const tokenUrl = orgConfig?.salesforceAuthUrl || process.env.SF_AUTH_URL || "https://test.salesforce.com/services/oauth2/token";
    const clientId = orgConfig?.clientId || process.env.SF_CLIENT_ID || "";
    const clientSecret = orgConfig?.clientSecret || process.env.SF_CLIENT_SECRET || "";

    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
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

    cachedToken = data.access_token;
    tokenExpiry = Date.now() + 55 * 60 * 1000; // ~55 minutes
    return NextResponse.json(data);
  } catch (err) {
    console.error("Token error:", err);
    return NextResponse.json({ error: "Token fetch failed" }, { status: 500 });
  }
}


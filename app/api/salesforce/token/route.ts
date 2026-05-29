import { NextResponse } from "next/server";

// simple in-memory token cache (clears on server restart)
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export async function POST() {
  try {
    // if cached token still valid, reuse it
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      return NextResponse.json({ access_token: cachedToken });
    }

    // build Salesforce token URL
    const tokenUrl = "https://test.salesforce.com/services/oauth2/token";
    const body = new URLSearchParams({
      grant_type: "password",
      client_id: process.env.SF_CLIENT_ID || "",
      client_secret: process.env.SF_CLIENT_SECRET || "",
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

    cachedToken = data.access_token;
    tokenExpiry = Date.now() + 55 * 60 * 1000; // ~55 minutes
    return NextResponse.json(data);
  } catch (err) {
    console.error("Token error:", err);
    return NextResponse.json({ error: "Token fetch failed" }, { status: 500 });
  }
}

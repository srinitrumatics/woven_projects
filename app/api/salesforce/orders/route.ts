import { NextResponse } from "next/server";
import { exit } from "process";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");
    const orderId = searchParams.get("orderId");

    if (!accountId) {
      return NextResponse.json({ error: "Missing accountId" }, { status: 400 });
    }

    // obtain or reuse token
    const tokenRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/salesforce/token`, {
      method: "POST",
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return NextResponse.json({ error: "Auth failed" }, { status: 401 });
    }

    // compose Salesforce REST URL
    let orderUrl = `${process.env.SF_DATA_URL}/services/apexrest/gtherp/orders` +
      `?accountId=${accountId}`;
    if (orderId) orderUrl += `&orderId=${orderId}`;

    const res = await fetch(orderUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
    });
    console.log('ressult');
    console.log(res);
    if (!res.ok) {
      const errText = await res.text();
      console.error("Order fetch failed:", errText);
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Orders route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

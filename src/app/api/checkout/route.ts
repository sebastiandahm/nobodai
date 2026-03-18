import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_API = "https://api.stripe.com/v1";

const PRICE_MAP: Record<string, string> = {
    starter: process.env.STRIPE_PRICE_STARTER || "",
    pro: process.env.STRIPE_PRICE_PRO || "",
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE || "",
  };

async function stripePost(endpoint: string, body: Record<string, string>) {
    var res = await fetch(STRIPE_API + endpoint, {
          method: "POST",
          headers: {
                  Authorization: "Bearer " + STRIPE_SECRET,
                  "Content-Type": "application/x-www-form-urlencoded",
                },
          body: new URLSearchParams(body).toString(),
        });
    return res.json();
  }

export async function POST(request: NextRequest) {
    try {
          var json = await request.json();
          var plan = json.plan;
          var userId = json.userId;
          var email = json.email;

          if (!plan || !PRICE_MAP[plan]) {
                  return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
                }
          if (!STRIPE_SECRET) {
                  return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
                }
          var priceId = PRICE_MAP[plan];
          if (!priceId) {
                  return NextResponse.json({ error: "Price not configured for " + plan }, { status: 503 });
                }

          var origin = request.headers.get("origin") || "https://nobod.ai";

          var session = await stripePost("/checkout/sessions", {
                  mode: "subscription",
                  "line_items[0][price]": priceId,
                  "line_items[0][quantity]": "1",
                  success_url: origin + "/dashboard?checkout=success",
                  cancel_url: origin + "/#pricing",
                  customer_email: email || "",
                  "metadata[user_id]": userId || "",
                  "metadata[plan]": plan,
                });

          if (session.error) {
                  return NextResponse.json({ error: session.error.message }, { status: 400 });
                }

          return NextResponse.json({ url: session.url });
        } catch (error: any) {
          return NextResponse.json({ error: error?.message || "Checkout failed" }, { status: 500 });
        }
  }

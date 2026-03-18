import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabase() {
    return createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || "",
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
        );
  }

export async function POST(request: NextRequest) {
    try {
          var body = await request.text();
          var event = JSON.parse(body);
          var supabase = getSupabase();

          if (event.type === "checkout.session.completed") {
                  var s = event.data.object;
                  var userId = s.metadata?.user_id;
                  var plan = s.metadata?.plan || "starter";
                  var limits: Record<string, number> = { free: 3, starter: 7, pro: 30, enterprise: 999 };
                  if (userId) {
                            await supabase.from("profiles").update({ plan: plan }).eq("id", userId);
                            await supabase.from("subscriptions").upsert({
                                        user_id: userId,
                                        stripe_customer_id: s.customer,
                                        stripe_subscription_id: s.subscription,
                                        plan: plan,
                                        status: "active",
                                        posts_limit: limits[plan] || 7,
                                        current_period_start: new Date().toISOString(),
                                        current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
                                      }, { onConflict: "user_id" });
                          }
                }

          if (event.type === "customer.subscription.deleted") {
                  var sub = event.data.object;
                  await supabase.from("subscriptions")
                    .update({ status: "cancelled", plan: "free", posts_limit: 3 })
                    .eq("stripe_subscription_id", sub.id);
                }

          return NextResponse.json({ received: true });
        } catch (error: any) {
          return NextResponse.json({ error: error?.message }, { status: 500 });
        }
  }

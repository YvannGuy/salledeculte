import Stripe from "stripe";

import { createAdminClient } from "@/lib/supabase/admin";

export async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata as Record<string, string> | null;
      const productType = metadata?.product_type;

      if (
        productType &&
        ["pass_24h", "pass_48h", "abonnement"].includes(productType) &&
        metadata?.user_id
      ) {
        const amount = session.amount_total ?? 0;
        const isSubscription = session.mode === "subscription" && session.subscription;
        const supabase = createAdminClient();

        await supabase.from("payments").insert({
          user_id: metadata.user_id,
          stripe_session_id: session.id,
          amount,
          currency: session.currency ?? "eur",
          product_type: productType,
          status: isSubscription ? "active" : "paid",
          subscription_id: isSubscription ? session.subscription : null,
        });

        const updates: Record<string, unknown> = {};
        const customerId = session.customer as string | null;
        if (customerId) updates.stripe_customer_id = customerId;
        if (isSubscription && session.subscription) updates.stripe_subscription_id = session.subscription;

        if (Object.keys(updates).length > 0) {
          await supabase.from("profiles").update(updates).eq("id", metadata.user_id);
        }
      }

      return {
        type: event.type,
        customerEmail: session.customer_details?.email ?? null,
        sessionId: session.id,
      };
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const supabase = createAdminClient();
      await supabase.from("profiles").update({ stripe_subscription_id: null }).eq("stripe_subscription_id", subscription.id);
      await supabase.from("payments").update({ status: "canceled" }).eq("subscription_id", subscription.id);
      return { type: event.type, subscriptionId: subscription.id };
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      if (["canceled", "unpaid", "incomplete_expired"].includes(subscription.status)) {
        const supabase = createAdminClient();
        await supabase.from("profiles").update({ stripe_subscription_id: null }).eq("stripe_subscription_id", subscription.id);
        await supabase.from("payments").update({ status: "canceled" }).eq("subscription_id", subscription.id);
      }
      return { type: event.type, subscriptionId: subscription.id, status: subscription.status };
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string | null;
      if (subscriptionId && invoice.billing_reason === "subscription_cycle") {
        const supabase = createAdminClient();
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", invoice.customer)
          .single();
        if (profile?.id) {
          await supabase.from("payments").insert({
            user_id: profile.id,
            stripe_session_id: invoice.id,
            amount: invoice.amount_paid ?? 0,
            currency: invoice.currency ?? "eur",
            product_type: "abonnement",
            status: "paid",
            subscription_id: subscriptionId,
          });
        }
      }
      return { type: event.type, invoiceId: invoice.id };
    }
    default:
      return { type: event.type, ignored: true };
  }
}

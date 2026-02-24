import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

type BadgeCounts = {
  demandeCount: number;
  visiteCount: number;
  messageCount: number;
  paymentCount: number;
  contractCount: number;
};

async function getUnreadMessageCount(
  supabase: SupabaseClient,
  userId: string,
  roleField: "seeker_id" | "owner_id"
): Promise<number> {
  const { data: convs, error: convError } = await supabase
    .from("conversations")
    .select("id")
    .eq(roleField, userId);
  if (convError || !convs?.length) return 0;

  const convIds = convs.map((c) => c.id);
  const { count, error: msgError } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .in("conversation_id", convIds)
    .neq("sender_id", userId)
    .is("read_at", null);

  if (msgError) return 0;
  return count ?? 0;
}

export async function getSeekerBadgeCounts(
  supabase: SupabaseClient,
  userId: string
): Promise<BadgeCounts> {
  const [{ count: demandesCount }, { count: visitesActionCount }, messageCount, { count: paymentActionCount }] = await Promise.all([
    supabase
      .from("demandes")
      .select("id", { count: "exact", head: true })
      .eq("seeker_id", userId)
      .in("status", ["sent", "viewed"]),
    (async () => {
      try {
        return await supabase
          .from("demandes_visite")
          .select("id", { count: "exact", head: true })
          .eq("seeker_id", userId)
          .in("status", ["pending", "reschedule_proposed"]);
      } catch {
        return { count: 0 };
      }
    })(),
    getUnreadMessageCount(supabase, userId, "seeker_id"),
    supabase
      .from("offers")
      .select("id", { count: "exact", head: true })
      .eq("seeker_id", userId)
      .eq("status", "pending")
      .gte("expires_at", new Date().toISOString()),
  ]);

  return {
    demandeCount: (demandesCount ?? 0) + (visitesActionCount ?? 0),
    visiteCount: 0,
    messageCount,
    paymentCount: paymentActionCount ?? 0,
    contractCount: 0,
  };
}

async function ownerMissingContractCount(salleIds: string[]): Promise<number> {
  if (salleIds.length === 0) return 0;
  const admin = createAdminClient();
  let missing = 0;
  for (const salleId of salleIds) {
    const { error } = await admin.storage
      .from("contrats")
      .download(`salles/${salleId}/modele.pdf`);
    if (error) missing += 1;
  }
  return missing;
}

export async function getOwnerBadgeCounts(
  supabase: SupabaseClient,
  userId: string
): Promise<BadgeCounts> {
  const [{ data: mySalles }, { data: profile }] = await Promise.all([
    supabase
    .from("salles")
    .select("id")
      .eq("owner_id", userId),
    supabase
      .from("profiles")
      .select("stripe_account_id")
      .eq("id", userId)
      .maybeSingle(),
  ]);
  const salleIds = (mySalles ?? []).map((s) => s.id);

  let visiteCount = 0;
  if (salleIds.length > 0) {
    try {
      const { count } = await supabase
        .from("demandes_visite")
        .select("id", { count: "exact", head: true })
        .in("salle_id", salleIds)
        .eq("status", "pending");
      visiteCount = count ?? 0;
    } catch {
      visiteCount = 0;
    }
  }

  const messageCount = await getUnreadMessageCount(supabase, userId, "owner_id");
  const contractCount = await ownerMissingContractCount(salleIds);
  const hasStripeAccount = !!(profile as { stripe_account_id?: string | null } | null)?.stripe_account_id;
  const paymentCount = salleIds.length > 0 && !hasStripeAccount ? 1 : 0;

  return {
    demandeCount: 0,
    visiteCount,
    messageCount,
    paymentCount,
    contractCount,
  };
}

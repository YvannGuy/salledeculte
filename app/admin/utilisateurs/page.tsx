import { createAdminClient } from "@/lib/supabase/admin";
import { UtilisateursClient } from "./utilisateurs-client";

export default async function AdminUtilisateursPage() {
  const supabase = createAdminClient();

  const [{ data: profiles }, { data: sallesByOwner }, { data: demandesBySeeker }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, full_name, user_type, created_at, suspended")
        .order("created_at", { ascending: false }),
      supabase.from("salles").select("owner_id"),
      supabase.from("demandes").select("seeker_id"),
    ]);

  const sallesCount = new Map<string, number>();
  (sallesByOwner ?? []).forEach((s) => {
    if (s.owner_id) {
      sallesCount.set(s.owner_id, (sallesCount.get(s.owner_id) ?? 0) + 1);
    }
  });
  const demandesCount = new Map<string, number>();
  (demandesBySeeker ?? []).forEach((d) => {
    if (d.seeker_id) {
      demandesCount.set(d.seeker_id, (demandesCount.get(d.seeker_id) ?? 0) + 1);
    }
  });

  const profilesList = (profiles ?? []).map((p) => ({
    ...p,
    salles_count: sallesCount.get(p.id) ?? 0,
    demandes_count: demandesCount.get(p.id) ?? 0,
  }));
  const ownersCount = profilesList.filter((p) => p.user_type === "owner").length;
  const actifsCount = profilesList.filter(
    (p) => !p.suspended
  ).length;
  const suspendedCount = profilesList.filter((p) => p.suspended).length;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const nouveaux7j = profilesList.filter(
    (p) => new Date(p.created_at) >= sevenDaysAgo
  ).length;

  const stats = {
    total: profilesList.length,
    actifs: actifsCount,
    owners: ownersCount,
    nouveaux7j,
  };

  return (
    <div className="p-6 md:p-8">
      <UtilisateursClient users={profilesList} stats={stats} />
    </div>
  );
}

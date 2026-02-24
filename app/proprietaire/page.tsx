import Image from "next/image";
import Link from "next/link";
import { AddSalleButton } from "@/components/proprietaire/add-salle-modal";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Banknote, CheckCircle, Clock, FolderOpen, Inbox, Star } from "lucide-react";

import { ConnectLoginButton } from "@/components/paiement/connect-login-button";
import { ConnectOnboardingButton } from "@/components/paiement/connect-onboarding-button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const TYPE_EVENEMENT_LABEL: Record<string, string> = {
  "culte-regulier": "Culte régulier",
  conference: "Conférence",
  celebration: "Célébration",
  bapteme: "Baptême",
  retraite: "Retraite",
};

const STATUT_SALLE_LABEL: Record<string, string> = {
  approved: "Active",
  pending: "En validation",
  rejected: "Refusée",
};

const STATUT_SALLE_COLOR: Record<string, string> = {
  approved: "text-emerald-600",
  pending: "text-amber-600",
  rejected: "text-red-600",
};

const STATUT_DEMANDE_LABEL: Record<string, string> = {
  sent: "Nouvelle",
  viewed: "Vue",
  replied: "Répondue",
  accepted: "Acceptée",
  rejected: "Refusée",
};

const STATUT_DEMANDE_COLOR: Record<string, string> = {
  sent: "text-emerald-600",
  viewed: "text-black",
  replied: "text-black",
  accepted: "text-emerald-600",
  rejected: "text-red-600",
};

const PRODUCT_LABEL: Record<string, string> = {
  pass_24h: "Pass 24h",
  pass_48h: "Pass 48h",
  abonnement: "Abonnement",
  reservation: "Réservation",
  autre: "Autre",
};

const STATUS_PAIEMENT_LABEL: Record<string, string> = {
  paid: "Payé",
  pending: "En cours",
  active: "Actif",
  failed: "Échoué",
  refunded: "Remboursé",
  canceled: "Annulé",
};

export default async function ProprietaireDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: sallesData }, { data: profile }, { data: recentPayments }] = await Promise.all([
    supabase
      .from("salles")
      .select("id, slug, name, city, images, status")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("stripe_account_id").eq("id", user.id).single(),
    (async () => {
      const adminSupabase = createAdminClient();
      const { data: paidOffers } = await adminSupabase
        .from("offers")
        .select("id")
        .eq("owner_id", user.id)
        .eq("status", "paid");
      const offerIds = (paidOffers ?? []).map((o) => (o as { id: string }).id);
      if (offerIds.length === 0) return { data: [] };
      const { data } = await adminSupabase
        .from("payments")
        .select("id, product_type, amount, status, created_at")
        .in("offer_id", offerIds)
        .eq("product_type", "reservation")
        .order("created_at", { ascending: false })
        .limit(5);
      return { data: data ?? [] };
    })(),
  ]);

  const salles = sallesData ?? [];
  const salleIds = salles.map((s) => s.id);

  const { data: demandesData } =
    salleIds.length > 0
      ? await supabase
          .from("demandes")
          .select("id, seeker_id, salle_id, type_evenement, date_debut, status, created_at")
          .in("salle_id", salleIds)
          .order("created_at", { ascending: false })
          .limit(20)
      : { data: [] };

  const demandes = demandesData ?? [];

  const seekerIds = [...new Set(demandes.map((d) => d.seeker_id).filter(Boolean))];
  const adminSupabase = createAdminClient();
  const { data: profiles } =
    seekerIds.length > 0
      ? await adminSupabase.from("profiles").select("id, full_name, email").in("id", seekerIds)
      : { data: [] };
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const salleMap = new Map(salles.map((s) => [s.id, s]));

  const demandesAvecProfil = demandes
    .map((d) => ({
      ...d,
      seeker: d.seeker_id ? profileMap.get(d.seeker_id) : undefined,
      salle: salleMap.get(d.salle_id),
    }))
    .slice(0, 10);

  const annoncesActives = salles.filter((s) => s.status === "approved").length;
  const enValidation = salles.filter((s) => s.status === "pending").length;
  const demandesRecues = demandes.length;
  const repondues = demandes.filter(
    (d) => d.status === "replied" || d.status === "accepted" || d.status === "rejected"
  ).length;
  const tauxReponse = demandesRecues > 0 ? Math.round((repondues / demandesRecues) * 100) : 0;

  const metrics = [
    { label: "Demandes reçues", value: String(demandesRecues), icon: FolderOpen, color: "text-black", bgColor: "bg-[#213398]/10" },
    { label: "Annonces actives", value: String(annoncesActives), icon: CheckCircle, color: "text-emerald-600", bgColor: "bg-emerald-100" },
    { label: "En validation", value: String(enValidation), icon: Clock, color: "text-amber-600", bgColor: "bg-amber-100" },
    { label: "Taux de réponse", value: `${tauxReponse}%`, icon: Star, color: "text-sky-500", bgColor: "bg-[#213398]/10" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black">Propriétaire · Tableau de bord</h1>
        <p className="mt-1 text-slate-500">Gérez vos annonces et vos demandes</p>
      </div>

      {/* Recevoir les paiements / Paiements activés */}
      <Card id="recevoir-paiements" className="mt-6 border-0 shadow-sm scroll-mt-24">
        <CardContent className="p-5">
          {(profile as { stripe_account_id?: string | null } | null)?.stripe_account_id ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                  <Banknote className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-black">Paiements activés</p>
                  <p className="mt-0.5 text-sm text-slate-600">
                    Gérez vos paiements et vos transferts depuis votre espace Stripe.
                  </p>
                </div>
              </div>
              <ConnectLoginButton hasStripeAccount={true} className="shrink-0">
                Ouvrir l&apos;espace Stripe
              </ConnectLoginButton>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#213398]/10">
                  <Banknote className="h-6 w-6 text-[#213398]" />
                </div>
                <div>
                  <p className="font-semibold text-black">Recevoir les paiements</p>
                  <p className="mt-0.5 text-sm text-slate-600">
                    Envoyez des offres aux locataires depuis la messagerie et recevez vos paiements directement.
                  </p>
                </div>
              </div>
              <ConnectOnboardingButton className="shrink-0 bg-[#213398] hover:bg-[#1a2980]">
                Activer les paiements
              </ConnectOnboardingButton>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="border-0 shadow-sm">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${m.bgColor}`}>
                  <Icon className={`h-6 w-6 ${m.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-black">{m.value}</p>
                  <p className="text-sm text-slate-500">{m.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Mes annonces</CardTitle>
            <Link href="/proprietaire/annonces" className="text-sm font-medium text-black hover:underline">
              Voir tout →
            </Link>
          </CardHeader>
          <CardContent>
            {salles.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-12 text-center">
                <Inbox className="mb-3 h-12 w-12 text-slate-300" />
                <p className="text-slate-500">Aucune annonce pour le moment</p>
                <AddSalleButton size="sm" className="mt-3 bg-[#213398] hover:bg-[#1a2980]">
                  Créer une annonce
                </AddSalleButton>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {salles.slice(0, 4).map((s) => (
                  <div
                    key={s.id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                  >
                    <div className="relative h-32">
                      <Image
                        src={Array.isArray(s.images) && s.images[0] ? String(s.images[0]) : "/img.png"}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-black">{s.name}</p>
                      <p className="text-sm text-slate-500">{s.city}</p>
                      <span className={`mt-2 inline-block text-sm font-medium ${STATUT_SALLE_COLOR[s.status] ?? "text-slate-600"}`}>
                        • {STATUT_SALLE_LABEL[s.status] ?? s.status}
                      </span>
                      <div className="mt-3 flex gap-2">
                        <Link href={`/salles/${s.slug}`}>
                          <Button variant="outline" size="sm" className="flex-1 border-slate-300">
                            Voir
                          </Button>
                        </Link>
                        <Link href={`/proprietaire/annonces?edit=${s.id}`}>
                          <Button size="sm" className="flex-1 bg-[#213398] hover:bg-[#1a2980]">
                            Modifier
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Mes paiements</CardTitle>
            <Link href="/proprietaire/paiement" className="text-sm font-medium text-black hover:underline">
              Voir →
            </Link>
          </CardHeader>
          <CardContent>
            {(recentPayments ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-12 text-center">
                <Banknote className="mb-3 h-12 w-12 text-slate-300" />
                <p className="text-slate-500">Aucun paiement pour le moment</p>
                <Link href="/proprietaire/paiement" className="mt-3">
                  <Button size="sm" className="bg-[#213398] hover:bg-[#1a2980]">
                    Accéder à l&apos;espace paiement
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {(recentPayments ?? []).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-black">
                        {PRODUCT_LABEL[(p as { product_type?: string }).product_type ?? ""] ?? (p as { product_type?: string }).product_type ?? "—"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {format(new Date((p as { created_at: string }).created_at), "d MMM yyyy", { locale: fr })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-black">
                        {(((p as { amount?: number }).amount ?? 0) / 100).toFixed(2)} €
                      </p>
                      <p className="text-sm text-emerald-600">
                        {STATUS_PAIEMENT_LABEL[(p as { status?: string }).status ?? ""] ?? (p as { status?: string }).status}
                      </p>
                    </div>
                  </div>
                ))}
                <Link href="/proprietaire/paiement" className="mt-2 block text-center text-sm font-medium text-[#213398] hover:underline">
                  Voir tout l&apos;historique →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Demandes récentes</CardTitle>
          <Link href="/proprietaire/demandes" className="text-sm font-medium text-black hover:underline">
            Voir tout →
          </Link>
        </CardHeader>
        <CardContent>
          {demandesAvecProfil.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-12 text-center">
              <Inbox className="mb-3 h-12 w-12 text-slate-300" />
              <p className="text-slate-500">Aucune demande pour le moment</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    <th className="pb-3 pr-4">Locataire</th>
                    <th className="pb-3 pr-4">Type d&apos;événement</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Statut</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {demandesAvecProfil.map((d) => (
                    <tr key={d.id} className="group">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-medium text-slate-600">
                            {(d.seeker?.full_name ?? d.seeker?.email ?? "?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-black">{d.seeker?.full_name ?? "—"}</p>
                            <p className="text-sm text-slate-500">{d.seeker?.email ?? "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-sm text-slate-600">{TYPE_EVENEMENT_LABEL[d.type_evenement ?? ""] ?? d.type_evenement ?? "—"}</td>
                      <td className="py-4 pr-4 text-sm text-slate-600">
                        {d.date_debut ? format(new Date(d.date_debut), "d MMMM yyyy", { locale: fr }) : "—"}
                      </td>
                      <td className="py-4 pr-4">
                        <span className={`text-sm font-medium ${STATUT_DEMANDE_COLOR[d.status] ?? "text-slate-600"}`}>
                          • {STATUT_DEMANDE_LABEL[d.status] ?? d.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <Link
                          href={`/proprietaire/demandes?id=${d.id}`}
                          className="text-sm font-medium text-black hover:underline"
                        >
                          Voir la demande
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

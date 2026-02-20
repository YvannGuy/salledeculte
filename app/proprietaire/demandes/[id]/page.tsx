import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, Calendar, MessageSquare, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function DemandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return notFound();

  const { data: demande } = await supabase
    .from("demandes")
    .select(
      "id, seeker_id, salle_id, date_debut, date_fin, nb_personnes, type_evenement, message, status, created_at, reply_message, replied_at, heure_debut_souhaitee, heure_fin_souhaitee"
    )
    .eq("id", id)
    .maybeSingle();

  if (!demande) return notFound();

  const [{ data: salle }, { data: profile }] = await Promise.all([
    supabase
      .from("salles")
      .select("id, name, owner_id")
      .eq("id", demande.salle_id)
      .eq("owner_id", user.id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", demande.seeker_id)
      .maybeSingle(),
  ]);

  if (!salle) return notFound();

  const STATUT_LABEL: Record<string, string> = {
    sent: "Nouvelle",
    viewed: "En attente",
    replied: "Répondue",
    accepted: "Acceptée",
    rejected: "Refusée",
  };

  const formatTime = (t: string | null) => {
    if (!t) return "";
    const m = String(t).match(/(\d{1,2}):(\d{2})/);
    return m ? `${m[1]}h${m[2]}` : "";
  };

  const hDebut = formatTime(demande.heure_debut_souhaitee ?? null);
  const hFin = formatTime(demande.heure_fin_souhaitee ?? null);

  return (
    <div className="p-8">
      <Link
        href="/proprietaire/demandes"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux demandes
      </Link>

      <div className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Détail de la demande</h1>
          <p className="mt-1 text-sm text-slate-500">Référence #{id.slice(0, 8)}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">Organisateur</p>
              <p className="mt-1 font-medium text-slate-900">{profile?.full_name ?? "—"}</p>
              <p className="text-sm text-slate-600">{profile?.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">Salle concernée</p>
              <p className="mt-1 font-medium text-slate-900">{salle.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">Type d&apos;événement</p>
              <p className="mt-1 text-slate-900">{demande.type_evenement ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">Statut</p>
              <p className="mt-1 font-medium text-slate-900">
                {STATUT_LABEL[demande.status] ?? demande.status}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-slate-700">
                {demande.date_debut
                  ? format(new Date(demande.date_debut), "d MMMM yyyy", { locale: fr })
                  : "—"}
                {demande.date_fin && demande.date_fin !== demande.date_debut && (
                  <> → {format(new Date(demande.date_fin), "d MMMM yyyy", { locale: fr })}</>
                )}
              </span>
            </div>
            {(hDebut || hFin) && (
              <p className="text-sm text-slate-700">
                Horaires souhaités : {hDebut || "—"} - {hFin || "—"}
              </p>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" />
              <span className="text-slate-700">
                {demande.nb_personnes ?? "—"} participants
              </span>
            </div>
          </div>

          {demande.message && (
            <div className="mt-6">
              <p className="flex items-center gap-2 text-xs font-medium uppercase text-slate-500">
                <MessageSquare className="h-4 w-4" />
                Message
              </p>
              <p className="mt-2 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                {demande.message}
              </p>
            </div>
          )}

          {demande.reply_message && (
            <div className="mt-6">
              <p className="text-xs font-medium uppercase text-slate-500">Votre réponse</p>
              <p className="mt-2 rounded-lg bg-sky-50 p-4 text-sm text-slate-700">
                {demande.reply_message}
              </p>
              {demande.replied_at && (
                <p className="mt-1 text-xs text-slate-500">
                  Répondu le {format(new Date(demande.replied_at), "d MMM yyyy à HH:mm", { locale: fr })}
                </p>
              )}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            {!["replied", "accepted", "rejected"].includes(demande.status) && (
              <>
                <Button className="bg-emerald-600 hover:bg-emerald-700">Accepter</Button>
                <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                  Refuser
                </Button>
                <Button variant="outline">Répondre</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

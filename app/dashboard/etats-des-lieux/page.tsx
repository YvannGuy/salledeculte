import Image from "next/image";

import { openUserDisputeCaseAction, submitEtatDesLieuxAction } from "@/app/actions/etats-des-lieux";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type EDLRow = {
  id: string;
  offer_id: string;
  role: "owner" | "seeker";
  phase: "before" | "after";
  notes: string | null;
  submitted_at: string;
};

type PhotoRow = {
  id: string;
  etat_des_lieux_id: string;
  offer_id: string;
  storage_path: string;
  description: string | null;
};

type CaseRow = {
  id: string;
  offer_id: string | null;
  case_type: "refund_full" | "refund_partial" | "dispute";
  status: "open" | "resolved" | "rejected";
  reason: string | null;
  amount_cents: number;
  created_at: string;
};

const PHASE_LABEL: Record<"before" | "after", string> = {
  before: "Avant événement (entrée)",
  after: "Après événement (sortie)",
};

const CASE_LABEL: Record<string, string> = {
  refund_full: "Remboursement total",
  refund_partial: "Remboursement partiel",
  dispute: "Litige",
};

export const dynamic = "force-dynamic";

export default async function SeekerEtatsDesLieuxPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = createAdminClient();
  const { data: offers } = await admin
    .from("offers")
    .select("id, salle_id, owner_id, amount_cents, date_debut, date_fin, created_at")
    .eq("seeker_id", user.id)
    .eq("status", "paid")
    .order("created_at", { ascending: false })
    .limit(100);

  const offerRows = (offers ?? []) as {
    id: string;
    salle_id: string;
    owner_id: string;
    amount_cents: number;
    date_debut: string | null;
    date_fin: string | null;
    created_at: string;
  }[];

  const offerIds = offerRows.map((o) => o.id);
  const salleIds = [...new Set(offerRows.map((o) => o.salle_id))];
  const ownerIds = [...new Set(offerRows.map((o) => o.owner_id))];

  const [{ data: salles }, { data: owners }] = await Promise.all([
    salleIds.length > 0
      ? admin.from("salles").select("id, name").in("id", salleIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    ownerIds.length > 0
      ? admin.from("profiles").select("id, full_name, email").in("id", ownerIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null; email: string | null }[] }),
  ]);

  let edlRows: EDLRow[] = [];
  let photoRows: PhotoRow[] = [];
  let caseRows: CaseRow[] = [];

  if (offerIds.length > 0) {
    try {
      const [{ data: edl }, { data: photos }, { data: cases }] = await Promise.all([
        admin
          .from("etat_des_lieux")
          .select("id, offer_id, role, phase, notes, submitted_at")
          .in("offer_id", offerIds),
        admin
          .from("etat_des_lieux_photos")
          .select("id, etat_des_lieux_id, offer_id, storage_path, description")
          .in("offer_id", offerIds),
        admin
          .from("refund_cases")
          .select("id, offer_id, case_type, status, reason, amount_cents, created_at")
          .in("offer_id", offerIds)
          .order("created_at", { ascending: false }),
      ]);

      edlRows = (edl ?? []) as EDLRow[];
      photoRows = (photos ?? []) as PhotoRow[];
      caseRows = (cases ?? []) as CaseRow[];
    } catch {
      // Les tables EDL peuvent ne pas exister tant que la migration SQL n'est pas exécutée.
    }
  }

  const photoUrlMap = new Map<string, string>();
  for (const photo of photoRows) {
    const { data } = await admin.storage.from("etat-des-lieux").createSignedUrl(photo.storage_path, 60 * 60);
    if (data?.signedUrl) photoUrlMap.set(photo.id, data.signedUrl);
  }

  const salleMap = new Map((salles ?? []).map((s) => [s.id, s.name]));
  const ownerMap = new Map(
    (owners ?? []).map((o) => [o.id, o.full_name || o.email || "Propriétaire"])
  );

  const byOffer = new Map<string, EDLRow[]>();
  for (const row of edlRows) {
    const list = byOffer.get(row.offer_id) ?? [];
    list.push(row);
    byOffer.set(row.offer_id, list);
  }

  const photosByEdl = new Map<string, PhotoRow[]>();
  for (const row of photoRows) {
    const list = photosByEdl.get(row.etat_des_lieux_id) ?? [];
    list.push(row);
    photosByEdl.set(row.etat_des_lieux_id, list);
  }

  const casesByOffer = new Map<string, CaseRow[]>();
  for (const row of caseRows) {
    if (!row.offer_id) continue;
    const list = casesByOffer.get(row.offer_id) ?? [];
    list.push(row);
    casesByOffer.set(row.offer_id, list);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-black">États des lieux</h1>
      <p className="mt-2 text-slate-600">
        Déposez vos photos avant/après événement (max 10 photos) pour sécuriser la caution et les litiges.
      </p>

      <Card className="mt-6 border-blue-200 bg-blue-50/40">
        <CardHeader>
          <CardTitle className="text-base text-blue-900">Consignes photos</CardTitle>
          <CardDescription className="text-blue-800">
            Photos bien éclairées, nettes, et couvrant les zones clés: entrée, salle principale, sanitaires, mobilier et chaque pièce utilisée.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="mt-6 space-y-6">
        {offerRows.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-slate-500">
              Aucune réservation payée à traiter pour le moment.
            </CardContent>
          </Card>
        ) : (
          offerRows.map((offer) => {
            const offerEdl = byOffer.get(offer.id) ?? [];
            const offerCases = casesByOffer.get(offer.id) ?? [];
            return (
              <Card key={offer.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {salleMap.get(offer.salle_id) ?? "Salle"} - {(offer.amount_cents / 100).toFixed(2)} €
                  </CardTitle>
                  <CardDescription>
                    Propriétaire: {ownerMap.get(offer.owner_id) ?? "—"} | Offre: {offer.id}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(["before", "after"] as const).map((phase) => {
                    const seekerEdl = offerEdl.find((r) => r.role === "seeker" && r.phase === phase);
                    const ownerEdl = offerEdl.find((r) => r.role === "owner" && r.phase === phase);
                    return (
                      <div key={phase} className="rounded-lg border border-slate-200 p-4">
                        <h3 className="font-semibold text-black">{PHASE_LABEL[phase]}</h3>
                        <p className="mt-1 text-xs text-slate-500">
                          Maximum 10 photos. Ajoutez des preuves claires des zones sensibles de la salle.
                        </p>

                        <form
                          action={async (formData) => {
                            "use server";
                            await submitEtatDesLieuxAction(formData);
                          }}
                          className="mt-3 space-y-3"
                        >
                          <input type="hidden" name="offerId" value={offer.id} />
                          <input type="hidden" name="phase" value={phase} />
                          <textarea
                            name="notes"
                            rows={3}
                            required
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                            placeholder="Décrivez les photos: pièces couvertes, état observé, anomalies éventuelles..."
                          />
                          <input
                            type="file"
                            name="photos"
                            accept="image/*"
                            multiple
                            required
                            className="block w-full text-sm"
                          />
                          <button
                            type="submit"
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                          >
                            Envoyer mon état des lieux {phase === "before" ? "d'entrée" : "de sortie"}
                          </button>
                        </form>

                        <div className="mt-4 grid gap-4 lg:grid-cols-2">
                          {[seekerEdl, ownerEdl].map((entry, idx) => (
                            <div key={idx} className="rounded-md bg-slate-50 p-3">
                              <p className="text-xs font-semibold uppercase text-slate-600">
                                {idx === 0 ? "Vos photos" : "Photos propriétaire"}
                              </p>
                              {!entry ? (
                                <p className="mt-2 text-sm text-slate-500">Aucun dépôt.</p>
                              ) : (
                                <>
                                  <p className="mt-2 text-sm text-slate-700">{entry.notes || "—"}</p>
                                  <div className="mt-3 grid grid-cols-3 gap-2">
                                    {(photosByEdl.get(entry.id) ?? []).map((photo) => {
                                      const signedUrl = photoUrlMap.get(photo.id);
                                      if (!signedUrl) return null;
                                      return (
                                        <a key={photo.id} href={signedUrl} target="_blank" rel="noreferrer">
                                          <Image
                                            src={signedUrl}
                                            alt="Photo état des lieux"
                                            width={220}
                                            height={150}
                                            unoptimized
                                            className="h-20 w-full rounded object-cover"
                                          />
                                        </a>
                                      );
                                    })}
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-4">
                    <h3 className="font-semibold text-amber-900">Ouvrir un litige</h3>
                    <p className="mt-1 text-xs text-amber-800">
                      Fournissez des preuves photo pour permettre à l&apos;admin d&apos;arbitrer.
                    </p>
                    <form
                      action={async (formData) => {
                        "use server";
                        await openUserDisputeCaseAction(formData);
                      }}
                      className="mt-3 space-y-3"
                    >
                      <input type="hidden" name="offerId" value={offer.id} />
                      <textarea
                        name="reason"
                        rows={3}
                        required
                        className="w-full rounded-md border border-amber-300 px-3 py-2 text-sm"
                        placeholder="Motif du litige, détails du dommage, contexte..."
                      />
                      <input
                        type="file"
                        name="photos"
                        accept="image/*"
                        multiple
                        required
                        className="block w-full text-sm"
                      />
                      <button
                        type="submit"
                        className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                      >
                        Soumettre un litige avec preuves
                      </button>
                    </form>
                    {offerCases.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {offerCases.map((c) => (
                          <div key={c.id} className="rounded border border-amber-200 bg-white p-2 text-xs text-slate-700">
                            <span className="font-semibold">{CASE_LABEL[c.case_type] ?? c.case_type}</span>
                            {" - "}
                            <span>{c.status}</span>
                            {c.amount_cents > 0 && <> - {(c.amount_cents / 100).toFixed(2)} €</>}
                            {c.reason && <p className="mt-1">{c.reason}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

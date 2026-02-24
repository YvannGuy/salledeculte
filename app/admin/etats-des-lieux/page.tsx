import Image from "next/image";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";

type OfferRow = {
  id: string;
  salle_id: string;
  owner_id: string;
  seeker_id: string;
  amount_cents: number;
  created_at: string;
};

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
  side: "owner" | "seeker" | "none";
  reason: string | null;
  amount_cents: number;
  created_at: string;
};

type EvidenceRow = {
  id: string;
  case_id: string;
  storage_path: string;
  description: string | null;
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

export default async function AdminEtatsDesLieuxPage() {
  const admin = createAdminClient();
  const { data: offers } = await admin
    .from("offers")
    .select("id, salle_id, owner_id, seeker_id, amount_cents, created_at")
    .eq("status", "paid")
    .order("created_at", { ascending: false })
    .limit(150);

  const offerRows = (offers ?? []) as OfferRow[];
  const offerIds = offerRows.map((o) => o.id);
  const salleIds = [...new Set(offerRows.map((o) => o.salle_id))];
  const profileIds = [...new Set(offerRows.flatMap((o) => [o.owner_id, o.seeker_id]))];

  const [{ data: salles }, { data: profiles }] = await Promise.all([
    salleIds.length > 0
      ? admin.from("salles").select("id, name").in("id", salleIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    profileIds.length > 0
      ? admin.from("profiles").select("id, full_name, email").in("id", profileIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null; email: string | null }[] }),
  ]);

  let edlRows: EDLRow[] = [];
  let photoRows: PhotoRow[] = [];
  let caseRows: CaseRow[] = [];
  let evidenceRows: EvidenceRow[] = [];

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
          .select("id, offer_id, case_type, status, side, reason, amount_cents, created_at")
          .in("offer_id", offerIds)
          .order("created_at", { ascending: false }),
      ]);
      edlRows = (edl ?? []) as EDLRow[];
      photoRows = (photos ?? []) as PhotoRow[];
      caseRows = (cases ?? []) as CaseRow[];

      const caseIds = caseRows.map((c) => c.id);
      if (caseIds.length > 0) {
        const { data: evidences } = await admin
          .from("refund_case_evidences")
          .select("id, case_id, storage_path, description")
          .in("case_id", caseIds);
        evidenceRows = (evidences ?? []) as EvidenceRow[];
      }
    } catch {
      // Les tables EDL peuvent ne pas exister tant que la migration SQL n'est pas exécutée.
    }
  }

  const fileUrlMap = new Map<string, string>();
  for (const photo of photoRows) {
    const { data } = await admin.storage.from("etat-des-lieux").createSignedUrl(photo.storage_path, 60 * 60);
    if (data?.signedUrl) fileUrlMap.set(photo.id, data.signedUrl);
  }
  for (const evidence of evidenceRows) {
    const { data } = await admin.storage.from("etat-des-lieux").createSignedUrl(evidence.storage_path, 60 * 60);
    if (data?.signedUrl) fileUrlMap.set(evidence.id, data.signedUrl);
  }

  const salleMap = new Map((salles ?? []).map((s) => [s.id, s.name]));
  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p.full_name || p.email || "Utilisateur"])
  );

  const edlByOffer = new Map<string, EDLRow[]>();
  for (const row of edlRows) {
    const list = edlByOffer.get(row.offer_id) ?? [];
    list.push(row);
    edlByOffer.set(row.offer_id, list);
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

  const evidencesByCase = new Map<string, EvidenceRow[]>();
  for (const row of evidenceRows) {
    const list = evidencesByCase.get(row.case_id) ?? [];
    list.push(row);
    evidencesByCase.set(row.case_id, list);
  }

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-black">États des lieux</h1>
      <p className="mt-2 text-slate-600">
        Vue admin consolidée des états des lieux avant/après, photos des deux parties et preuves de litige.
      </p>

      <Card className="mt-6 border-blue-200 bg-blue-50/40">
        <CardHeader>
          <CardTitle className="text-base text-blue-900">Règles qualité photo</CardTitle>
          <CardDescription className="text-blue-800">
            10 photos maximum par dépôt, bien éclairées, nettes, et couvrant les zones clés de chaque pièce.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="mt-6 space-y-6">
        {offerRows.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-slate-500">
              Aucune réservation payée disponible.
            </CardContent>
          </Card>
        ) : (
          offerRows.map((offer) => {
            const offerEdl = edlByOffer.get(offer.id) ?? [];
            const offerCases = casesByOffer.get(offer.id) ?? [];
            return (
              <Card key={offer.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {salleMap.get(offer.salle_id) ?? "Salle"} - {(offer.amount_cents / 100).toFixed(2)} €
                  </CardTitle>
                  <CardDescription>
                    Propriétaire: {profileMap.get(offer.owner_id) ?? "—"} | Locataire: {profileMap.get(offer.seeker_id) ?? "—"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(["before", "after"] as const).map((phase) => {
                    const ownerEdl = offerEdl.find((r) => r.role === "owner" && r.phase === phase);
                    const seekerEdl = offerEdl.find((r) => r.role === "seeker" && r.phase === phase);
                    return (
                      <div key={phase} className="rounded-lg border border-slate-200 p-4">
                        <h3 className="font-semibold text-black">{PHASE_LABEL[phase]}</h3>
                        <div className="mt-3 grid gap-4 lg:grid-cols-2">
                          {[ownerEdl, seekerEdl].map((entry, idx) => (
                            <div key={idx} className="rounded-md bg-slate-50 p-3">
                              <p className="text-xs font-semibold uppercase text-slate-600">
                                {idx === 0 ? "Photos propriétaire" : "Photos locataire"}
                              </p>
                              {!entry ? (
                                <p className="mt-2 text-sm text-slate-500">Aucun dépôt.</p>
                              ) : (
                                <>
                                  <p className="mt-2 text-sm text-slate-700">{entry.notes || "—"}</p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    Déposé le {new Date(entry.submitted_at).toLocaleString("fr-FR")}
                                  </p>
                                  <div className="mt-3 grid grid-cols-4 gap-2">
                                    {(photosByEdl.get(entry.id) ?? []).map((photo) => {
                                      const signedUrl = fileUrlMap.get(photo.id);
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

                  {offerCases.length > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-4">
                      <h3 className="font-semibold text-amber-900">Dossiers remboursement / litige</h3>
                      <div className="mt-3 space-y-3">
                        {offerCases.map((c) => (
                          <div key={c.id} className="rounded border border-amber-200 bg-white p-3 text-sm text-slate-700">
                            <p className="font-semibold">
                              {CASE_LABEL[c.case_type] ?? c.case_type} - {c.status}
                              {c.amount_cents > 0 && <> - {(c.amount_cents / 100).toFixed(2)} €</>}
                            </p>
                            <p className="text-xs text-slate-500">Partie: {c.side}</p>
                            {c.reason && <p className="mt-1 text-xs">{c.reason}</p>}
                            {(evidencesByCase.get(c.id) ?? []).length > 0 && (
                              <div className="mt-2 grid grid-cols-5 gap-2">
                                {(evidencesByCase.get(c.id) ?? []).map((evidence) => {
                                  const signedUrl = fileUrlMap.get(evidence.id);
                                  if (!signedUrl) return null;
                                  return (
                                    <a key={evidence.id} href={signedUrl} target="_blank" rel="noreferrer">
                                      <Image
                                        src={signedUrl}
                                        alt="Preuve litige"
                                        width={220}
                                        height={150}
                                        unoptimized
                                        className="h-16 w-full rounded object-cover"
                                      />
                                    </a>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

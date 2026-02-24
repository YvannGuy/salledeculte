"use client";

import { useMemo, useState } from "react";
import { Clock3 } from "lucide-react";

import { updateSalleVisitesCalendarAction } from "@/app/actions/proprietaire-salle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SalleCalendrier = {
  id: string;
  name: string;
  city: string | null;
  jours_visite: string[] | null;
  visite_dates: string[] | null;
  visite_heure_debut: string | null;
  visite_heure_fin: string | null;
  visite_horaires_par_date: Record<string, { debut: string; fin: string }> | null;
};

const JOURS = [
  { id: "lundi", label: "Lun" },
  { id: "mardi", label: "Mar" },
  { id: "mercredi", label: "Mer" },
  { id: "jeudi", label: "Jeu" },
  { id: "vendredi", label: "Ven" },
  { id: "samedi", label: "Sam" },
  { id: "dimanche", label: "Dim" },
] as const;

function normalizeTime(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback;
  const m = String(value).match(/(\d{1,2}):(\d{2})/);
  if (!m) return fallback;
  return `${m[1]!.padStart(2, "0")}:${m[2]!}`;
}

function deriveInitialDays(s: SalleCalendrier): string[] {
  if (Array.isArray(s.jours_visite) && s.jours_visite.length > 0) return s.jours_visite;
  if (!Array.isArray(s.visite_dates) || s.visite_dates.length === 0) return [];
  const map: Record<number, string> = {
    0: "dimanche",
    1: "lundi",
    2: "mardi",
    3: "mercredi",
    4: "jeudi",
    5: "vendredi",
    6: "samedi",
  };
  const unique = new Set<string>();
  for (const d of s.visite_dates) {
    const day = new Date(`${d}T12:00:00`).getDay();
    unique.add(map[day]);
  }
  return [...unique];
}

export function CalendrierVisitesManager({ salles }: { salles: SalleCalendrier[] }) {
  const initialState = useMemo(() => {
    return Object.fromEntries(
      salles.map((s) => {
        const firstDate = s.visite_dates?.[0];
        const perDate = firstDate ? s.visite_horaires_par_date?.[firstDate] : undefined;
        return [
          s.id,
          {
            jours: deriveInitialDays(s),
            heureDebut: normalizeTime(perDate?.debut ?? s.visite_heure_debut, "14:00"),
            heureFin: normalizeTime(perDate?.fin ?? s.visite_heure_fin, "18:00"),
            saving: false,
          },
        ];
      })
    ) as Record<
      string,
      { jours: string[]; heureDebut: string; heureFin: string; saving: boolean }
    >;
  }, [salles]);

  const [state, setState] = useState(initialState);

  return (
    <div className="space-y-5">
      {salles.map((salle) => {
        const current = state[salle.id];
        return (
          <div key={salle.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-black">{salle.name}</h3>
                <p className="text-sm text-slate-500">{salle.city ?? "—"}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                Créneaux sur 12 semaines
              </span>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-slate-700">Jours de visite</p>
              <div className="flex flex-wrap gap-2">
                {JOURS.map((j) => {
                  const active = current?.jours.includes(j.id);
                  return (
                    <button
                      key={j.id}
                      type="button"
                      className={`rounded-lg border px-3 py-2 text-sm transition ${
                        active
                          ? "border-[#213398] bg-[#213398]/10 text-black"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                      onClick={() => {
                        setState((prev) => {
                          const old = prev[salle.id];
                          const exists = old.jours.includes(j.id);
                          return {
                            ...prev,
                            [salle.id]: {
                              ...old,
                              jours: exists
                                ? old.jours.filter((x) => x !== j.id)
                                : [...old.jours, j.id],
                            },
                          };
                        });
                      }}
                    >
                      {j.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Heure début</label>
                <Input
                  type="time"
                  value={current?.heureDebut ?? "14:00"}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      [salle.id]: { ...prev[salle.id], heureDebut: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Heure fin</label>
                <Input
                  type="time"
                  value={current?.heureFin ?? "18:00"}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      [salle.id]: { ...prev[salle.id], heureFin: e.target.value },
                    }))
                  }
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button
                className="bg-[#213398] hover:bg-[#1a2980]"
                disabled={current?.saving}
                onClick={async () => {
                  setState((prev) => ({
                    ...prev,
                    [salle.id]: { ...prev[salle.id], saving: true },
                  }));
                  const res = await updateSalleVisitesCalendarAction({
                    salleId: salle.id,
                    joursVisite: current.jours,
                    heureDebut: current.heureDebut,
                    heureFin: current.heureFin,
                  });
                  setState((prev) => ({
                    ...prev,
                    [salle.id]: { ...prev[salle.id], saving: false },
                  }));
                  if (!res.success) {
                    alert(res.error ?? "Erreur de mise à jour");
                  }
                }}
              >
                {current?.saving ? "Enregistrement..." : "Enregistrer le calendrier"}
              </Button>
              <p className="flex items-center gap-1 text-xs text-slate-500">
                <Clock3 className="h-3.5 w-3.5" />
                Ces créneaux seront utilisés dans “Organiser une visite”.
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

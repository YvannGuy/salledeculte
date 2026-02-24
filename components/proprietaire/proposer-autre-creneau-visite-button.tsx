"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";

import { proposerAutreCreneauVisite } from "@/app/actions/demande-visite-owner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function ProposerAutreCreneauVisiteButton({ demandeVisiteId }: { demandeVisiteId: string }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [heureDebut, setHeureDebut] = useState("");
  const [heureFin, setHeureFin] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="border-sky-300 text-sky-700 hover:bg-sky-50"
        onClick={() => setOpen(true)}
      >
        <CalendarClock className="mr-1 h-4 w-4" />
        Proposer un autre créneau
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Proposer un autre créneau</DialogTitle>
            <DialogDescription>
              Le locataire recevra une notification avec la nouvelle date de visite.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Heure début</label>
                <Input type="time" value={heureDebut} onChange={(e) => setHeureDebut(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Heure fin</label>
                <Input type="time" value={heureFin} onChange={(e) => setHeureFin(e.target.value)} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" disabled={loading} onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button
              disabled={loading || !date || !heureDebut || !heureFin}
              className="bg-sky-600 hover:bg-sky-700"
              onClick={async () => {
                setLoading(true);
                const res = await proposerAutreCreneauVisite(demandeVisiteId, date, heureDebut, heureFin);
                setLoading(false);
                if (!res.success) {
                  alert(res.error ?? "Erreur lors de la reprogrammation");
                  return;
                }
                setOpen(false);
              }}
            >
              {loading ? "Envoi..." : "Envoyer la proposition"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { resolveDepositClaimAdminAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminLitigeDecisionActions({
  offerId,
  holdStatus,
  maxDepositAmountCents,
  disabled,
}: {
  offerId: string;
  holdStatus: string | null;
  maxDepositAmountCents: number;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"capture" | "release" | null>(null);
  const [amountEur, setAmountEur] = useState(
    maxDepositAmountCents > 0 ? (maxDepositAmountCents / 100).toFixed(2) : ""
  );

  if (disabled) {
    return <p className="text-xs text-slate-500">Dossier déjà clôturé.</p>;
  }

  if (!["authorized", "claim_requested"].includes(holdStatus ?? "")) {
    return <p className="text-xs text-slate-500">Aucune action caution disponible (statut: {holdStatus ?? "none"}).</p>;
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={amountEur}
          onChange={(e) => setAmountEur(e.target.value)}
          className="h-8 w-28 text-xs"
          inputMode="decimal"
          placeholder="Montant €"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={loading !== null}
          onClick={async () => {
            const parsed = Number(amountEur.replace(",", "."));
            if (!Number.isFinite(parsed) || parsed <= 0) {
              alert("Montant invalide");
              return;
            }
            setLoading("capture");
            const res = await resolveDepositClaimAdminAction({
              offerId,
              decision: "capture",
              captureAmountEur: parsed,
            });
            setLoading(null);
            if (!res.success) {
              alert(res.error ?? "Erreur capture caution");
              return;
            }
            router.refresh();
          }}
        >
          {loading === "capture" ? "..." : "Valider retenue"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-red-200 text-red-700 hover:bg-red-50"
          disabled={loading !== null}
          onClick={async () => {
            setLoading("release");
            const res = await resolveDepositClaimAdminAction({
              offerId,
              decision: "release",
            });
            setLoading(null);
            if (!res.success) {
              alert(res.error ?? "Erreur libération caution");
              return;
            }
            router.refresh();
          }}
        >
          {loading === "release" ? "..." : "Refuser retenue"}
        </Button>
      </div>
      <p className="text-[11px] text-slate-500">
        Décision financière prise depuis ce litige.
      </p>
    </div>
  );
}


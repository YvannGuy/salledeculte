"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  accepterPropositionVisite,
  refuserPropositionVisite,
} from "@/app/actions/demande-visite-seeker";
import { ContactVisiteSeekerButton } from "@/components/demandes/contact-visite-seeker-button";
import { Button } from "@/components/ui/button";

export function ReprogrammationVisiteActions({
  demandeVisiteId,
  compact = false,
  className = "",
}: {
  demandeVisiteId: string;
  compact?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "refuse" | null>(null);
  const stackOnMobile = compact;

  return (
    <div
      className={`${compact ? "" : "mt-3"} flex ${
        stackOnMobile ? "flex-col sm:flex-row" : "flex-wrap"
      } gap-2 ${className}`.trim()}
    >
      <Button
        size="sm"
        className={`bg-emerald-600 hover:bg-emerald-700 ${
          stackOnMobile ? "w-full sm:w-auto" : ""
        }`.trim()}
        disabled={loading !== null}
        onClick={async () => {
          setLoading("accept");
          const res = await accepterPropositionVisite(demandeVisiteId);
          setLoading(null);
          if (!res.success) {
            alert(res.error ?? "Erreur");
            return;
          }
          router.refresh();
        }}
      >
        {loading === "accept" ? "Validation..." : compact ? "Accepter" : "Accepter ce créneau"}
      </Button>

      <ContactVisiteSeekerButton
        demandeVisiteId={demandeVisiteId}
        label={compact ? "Contacter" : "Contacter le propriétaire"}
        className={stackOnMobile ? "w-full sm:w-auto" : undefined}
      />

      <Button
        variant="outline"
        size="sm"
        className={`border-red-300 text-red-700 hover:bg-red-50 ${
          stackOnMobile ? "w-full sm:w-auto" : ""
        }`.trim()}
        disabled={loading !== null}
        onClick={async () => {
          setLoading("refuse");
          const res = await refuserPropositionVisite(demandeVisiteId);
          setLoading(null);
          if (!res.success) {
            alert(res.error ?? "Erreur");
            return;
          }
          router.refresh();
        }}
      >
        {loading === "refuse" ? "Refus..." : compact ? "Refuser" : "Refuser la proposition"}
      </Button>
    </div>
  );
}

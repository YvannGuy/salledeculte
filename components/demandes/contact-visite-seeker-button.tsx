"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

import { contactProprietaireVisiteAction } from "@/app/actions/contact-proprietaire-visite";
import { Button } from "@/components/ui/button";

/** Bouton pour le locataire : contacter le propriétaire (visite) */
export function ContactVisiteSeekerButton({ demandeVisiteId }: { demandeVisiteId: string }) {
  const [loading, setLoading] = useState(false);
  return (
    <form
      action={async () => {
        setLoading(true);
        const res = await contactProprietaireVisiteAction(demandeVisiteId);
        setLoading(false);
        if (!res?.success && res?.error) {
          alert(res.error);
        }
      }}
    >
      <Button type="submit" disabled={loading} size="sm" className="bg-[#213398] hover:bg-[#1a2980]">
        <MessageCircle className="mr-2 h-4 w-4" />
        {loading ? "Ouverture…" : "Contacter le propriétaire"}
      </Button>
    </form>
  );
}

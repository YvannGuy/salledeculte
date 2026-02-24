"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

import { contactLocataireVisiteAction } from "@/app/actions/contact-locataire-visite";
import { Button } from "@/components/ui/button";

/** Bouton pour le propriétaire : contacter le locataire (visite) */
export function ContactVisiteOwnerButton({ demandeVisiteId }: { demandeVisiteId: string }) {
  const [loading, setLoading] = useState(false);
  return (
    <form
      action={async () => {
        setLoading(true);
        const res = await contactLocataireVisiteAction(demandeVisiteId);
        setLoading(false);
        if (!res?.success && res?.error) {
          alert(res.error);
        }
      }}
    >
      <Button type="submit" disabled={loading} variant="outline" size="sm">
        <MessageCircle className="mr-2 h-4 w-4" />
        {loading ? "Ouverture…" : "Contacter le locataire"}
      </Button>
    </form>
  );
}

import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { buildCanonical } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Rechercher une salle",
  description:
    "Trouvez une salle pour votre culte, baptême, conférence ou événement cultuel en Île-de-France. Filtrez par ville, capacité et type d'événement.",
  alternates: { canonical: buildCanonical("/rechercher") },
};

export default function RechercherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}

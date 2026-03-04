import type { Metadata } from "next";

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
      <section className="border-b border-slate-100 bg-slate-50/80 py-6">
        <div className="container max-w-[1400px]">
          <h1 className="sr-only">Rechercher une salle pour votre culte ou événement cultuel en Île-de-France</h1>
          <p className="max-w-3xl text-[15px] leading-relaxed text-slate-700">
            Trouvez une salle adaptée à vos événements cultuels en Île-de-France : cultes réguliers, baptêmes,
            conférences, célébrations et retraites. {siteConfig.name} met en relation les organisateurs avec des
            propriétaires de salles vérifiées (églises, salles paroissiales, centres communautaires, salles
            polyvalentes). Filtrez par ville, date, capacité et type d&apos;événement pour affiner votre recherche.
            La consultation des annonces et l&apos;envoi de demandes sont gratuits ; vous échangez directement
            avec les propriétaires pour confirmer la disponibilité et les conditions. Toutes les communes
            d&apos;Île-de-France sont couvertes (Paris, Seine-Saint-Denis, Hauts-de-Seine, Val-de-Marne,
            Seine-et-Marne, Yvelines, Essonne, Val-d&apos;Oise) pour vous aider à réserver un lieu proche de
            votre communauté. Utilisez les filtres ci-dessous pour affiner par prix ou capacité et consultez
            les fiches détaillées (équipements, accès, horaires) avant d&apos;envoyer votre demande.
          </p>
        </div>
      </section>
      {children}
      <SiteFooter />
    </div>
  );
}

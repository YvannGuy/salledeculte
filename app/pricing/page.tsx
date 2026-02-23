import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { buildCanonical } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "salledeculte.com propose une consultation gratuite. Explorez les annonces et envoyez vos demandes aux propriétaires sans frais.",
  alternates: { canonical: buildCanonical("/pricing") },
};

export default function PricingPage() {
  return (
    <main className="container py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-black">Consultation gratuite</h1>
        <p className="mt-4 text-slate-600">
          Parcourez les annonces librement et envoyez vos demandes aux propriétaires sans frais.
        </p>
      </div>

      <section className="mx-auto mt-12 max-w-md">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Accès gratuit</CardTitle>
            <CardDescription>Explorez et contactez sans limite</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-black">0 €</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-black" />
                Consultation des annonces illimitée
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-black" />
                Envoi de demandes gratuit
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-black" />
                Mise en relation directe avec les propriétaires
              </li>
            </ul>
            <Link href="/rechercher" className="mt-6 block">
              <Button className="w-full bg-[#213398] hover:bg-[#1a2980]">
                Rechercher une salle
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <p className="mt-8 text-center text-sm text-slate-500">
        Les tarifs des locations sont fixés directement par les propriétaires.
      </p>
    </main>
  );
}

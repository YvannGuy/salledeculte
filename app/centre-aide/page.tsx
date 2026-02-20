import Link from "next/link";

import { siteConfig } from "@/config/site";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, Building2, Search, Info } from "lucide-react";

const CATEGORIES = [
  {
    href: "/centre-aide/organisateur",
    title: "Chercher une salle",
    desc: "Tout savoir sur la recherche et la réservation d'une salle sur la plateforme.",
    icon: Search,
  },
  {
    href: "/centre-aide/proprietaire",
    title: "Propriétaire",
    desc: "Découvrez comment proposer votre salle et recevoir des demandes ciblées.",
    icon: Building2,
  },
  {
    href: "/centre-aide/general",
    title: "Général",
    desc: "Questions fréquentes et informations générales sur {site}.",
    icon: Info,
  },
];

export default function CentreAidePage() {
  return (
    <div className="min-h-screen bg-[#f3f6fa]">
      <SiteHeader />
      <main className="container max-w-[900px] py-16 px-4">
        <h1 className="text-[32px] font-bold tracking-tight text-black sm:text-[38px]">
          Comment pouvons-nous vous aider ?
        </h1>
        <p className="mt-4 max-w-[640px] text-[16px] leading-relaxed text-slate-600">
          Chez {siteConfig.name}, nous sommes là pour rendre votre expérience la plus fluide possible. Que vous ayez
          des questions, besoin d&apos;assistance ou simplement envie de découvrir notre plateforme, nous sommes
          prêts à vous accompagner.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link key={cat.href} href={cat.href}>
                <Card className="h-full rounded-xl border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-md">
                  <CardContent className="flex flex-col p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#213398]/10">
                      <Icon className="h-5 w-5 text-[#213398]" />
                    </div>
                    <h2 className="mt-4 font-semibold text-black">{cat.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{cat.desc.replace("{site}", siteConfig.name)}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-16 rounded-xl border border-slate-200 bg-white p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#213398]/10">
              <HelpCircle className="h-6 w-6 text-[#213398]" />
            </div>
            <h2 className="text-xl font-semibold text-black">Nous contacter</h2>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
            Vous avez d&apos;autres questions ou besoin d&apos;aide ? N&apos;hésitez pas à contacter notre équipe
            support à{" "}
            <a
              href="mailto:contact@salledeculte.com"
              className="font-medium text-[#213398] hover:underline"
            >
              contact@salledeculte.com
            </a>
            . Nous sommes là pour vous aider à tirer le meilleur parti de {siteConfig.name}. Bienvenue à bord !
          </p>
        </div>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 text-[14px] font-medium text-slate-600 hover:text-black"
        >
          ← Retour à l&apos;accueil
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}

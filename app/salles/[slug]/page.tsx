import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  ListChecks,
  MapPin,
  Share2,
  Car,
  CookingPot,
  Piano,
  Tv,
  Volume2,
  Wifi,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getSalleBySlug, mockSalles } from "@/lib/mock-salles";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  check: CheckCircle2,
  parking: Car,
  wheelchair: CheckCircle2,
  furniture: ListChecks,
  speaker: Volume2,
  wifi: Wifi,
  clock: Clock,
  volume: Volume2,
  list: ListChecks,
  piano: Piano,
  video: Tv,
  kitchen: CookingPot,
};

export async function generateStaticParams() {
  return mockSalles.map((s) => ({ slug: s.slug }));
}

export default async function SalleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const salle = getSalleBySlug(slug);
  if (!salle) notFound();

  const nearbySalles = mockSalles
    .filter((s) => s.slug !== slug && s.city === salle.city)
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <main className="container max-w-[1120px] py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="mb-8 grid gap-3 md:grid-cols-[1fr_120px]">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-100">
                <Image
                  src={salle.images[0] ?? "/img.png"}
                  alt={salle.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 65vw"
                />
              </div>
              <div className="hidden flex-col gap-3 md:flex">
                {salle.images.slice(1, 4).map((img, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
                    <Image src={img} alt="" fill className="object-cover" sizes="120px" />
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-6 flex gap-4">
              <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                <Share2 className="h-4 w-4" />
                Partager
              </button>
              <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                <Heart className="h-4 w-4" />
                Sauvegarder
              </button>
            </div>

            <div className="space-y-8">
              <div>
                <h1 className="text-[28px] font-bold text-[#304256]">{salle.name}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin className="h-4 w-4" />
                    {salle.address}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[13px] font-medium text-slate-700">
                    Jusqu&apos;à {salle.capacity} personnes
                  </span>
                </div>
              </div>

              <section>
                <h2 className="mb-3 text-lg font-semibold text-[#304256]">Description</h2>
                <p className="text-[15px] leading-[1.6] text-slate-600">{salle.description}</p>
              </section>

              <section>
                <h2 className="mb-3 text-lg font-semibold text-[#304256]">Caractéristiques</h2>
                <ul className="space-y-3">
                  {salle.features.map((f, i) => {
                    const Icon = iconMap[f.icon] ?? CheckCircle2;
                    return (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        {f.label}
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section>
                <h2 className="mb-3 text-lg font-semibold text-[#304256]">Conditions d&apos;accueil</h2>
                <ul className="space-y-3">
                  {salle.conditions.map((c, i) => {
                    const Icon = iconMap[c.icon] ?? Clock;
                    return (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                        {c.label}
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section>
                <h2 className="mb-3 text-lg font-semibold text-[#304256]">Tarification</h2>
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                  <p className="text-xl font-bold text-[#304256]">{salle.pricePerDay} € / jour</p>
                  <p className="mt-1 text-[13px] text-slate-500">
                    Le tarif est indicatif et est à confirmer par le propriétaire
                  </p>
                  {salle.pricingInclusions.length > 0 && (
                    <>
                      <p className="mt-4 text-[13px] font-medium text-slate-700">Ce tarif comprend :</p>
                      <ul className="mt-2 space-y-2">
                        {salle.pricingInclusions.map((inc, i) => (
                          <li key={i} className="flex items-center gap-2 text-[13px] text-slate-600">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            {inc}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </section>

              <section>
                <h2 className="mb-3 text-lg font-semibold text-[#304256]">Localisation</h2>
                <div className="flex aspect-[16/9] items-center justify-center rounded-xl border border-slate-200 bg-slate-100">
                  <div className="text-center text-slate-500">
                    <MapPin className="mx-auto h-12 w-12" />
                    <p className="mt-2 text-sm">Carte à venir</p>
                    <p className="mt-1 text-xs">
                      Localisation exacte communiquée après validation de votre réservation
                    </p>
                  </div>
                </div>
              </section>

              {nearbySalles.length > 0 && (
                <section>
                  <h2 className="mb-4 text-lg font-semibold text-[#304256]">Autres salles proches</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {nearbySalles.map((s) => (
                      <Link
                        key={s.id}
                        href={`/salles/${s.slug}`}
                        className="group overflow-hidden rounded-xl border border-slate-200 transition hover:border-slate-300"
                      >
                        <div className="relative aspect-[16/9] bg-slate-100">
                          <Image
                            src={s.images[0] ?? "/img.png"}
                            alt={s.name}
                            fill
                            className="object-cover transition group-hover:scale-[1.02]"
                            sizes="(max-width: 640px) 100vw, 50vw"
                          />
                        </div>
                        <div className="p-4">
                          <p className="font-semibold text-[#304256]">{s.name}</p>
                          <p className="mt-1 text-[13px] text-slate-500">
                            {s.address} • Jusqu&apos;à {s.capacity} personnes
                          </p>
                          <p className="mt-2 text-sm font-medium text-[#2d435a]">
                            À partir de {s.pricePerDay} € / jour
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#304256]">Intéressé par cette salle ?</h3>
              <p className="mt-2 text-[14px] text-slate-600">
                Envoyez une demande au propriétaire pour vérifier la disponibilité.
              </p>
              <Link href={`/rechercher?demande=${salle.slug}`}>
                <Button className="mt-4 h-12 w-full bg-[#2d435a] font-semibold hover:bg-[#243a4d]">
                  Vérifier les disponibilités
                </Button>
              </Link>
              <div className="mt-4 flex flex-wrap gap-3 text-[13px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Réserver sur ce site
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart className="h-4 w-4" />
                  Pas d&apos;engagement
                </span>
              </div>
              <p className="mt-4 text-[12px] text-slate-400">
                12 organisateurs ont consulté cette salle récemment.
              </p>
            </div>
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/80 p-6">
              <h3 className="text-lg font-semibold text-[#304256]">Besoin d&apos;aide ?</h3>
              <p className="mt-2 text-[14px] text-slate-600">
                Notre équipe est disponible pour vous accompagner dans votre recherche.
              </p>
              <a href="#" className="mt-3 inline-block text-[14px] font-medium text-[#2d435a] hover:underline">
                Contacter le support
              </a>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

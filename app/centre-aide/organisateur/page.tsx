import Link from "next/link";

import { siteConfig } from "@/config/site";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

const FAQ_ORGANISATEUR = [
  {
    q: "Comment rechercher une salle ?",
    a: "Utilisez la barre de recherche sur la page d'accueil ou la page « Rechercher une salle ». Filtrez par ville, date, nombre de personnes et type d'événement (culte, baptême, conférence, etc.) pour trouver les lieux adaptés.",
  },
  {
    q: "La consultation des annonces est-elle payante ?",
    a: "Non, la consultation des annonces est gratuite. Pour envoyer des demandes aux propriétaires, vous aurez besoin d'un pass (24h, 48h ou abonnement) selon vos besoins.",
  },
  {
    q: "Comment fonctionne le pass et les demandes ?",
    a: "Une fois votre pass activé, vous pouvez envoyer des demandes illimitées pendant sa durée. Chaque demande est transmise au propriétaire, qui vous répond directement via la messagerie.",
  },
  {
    q: "Puis-je visiter la salle avant de réserver ?",
    a: "Les annonces incluent des photos et des informations détaillées. Pour une visite sur place, contactez le propriétaire via la messagerie après avoir envoyé une demande ; il pourra organiser une visite si possible.",
  },
  {
    q: "Quel type d'événement puis-je organiser ?",
    a: "Cultes réguliers, conférences, baptêmes, célébrations, retraites et tout événement à caractère cultuel. Vous précisez le type lors de votre recherche pour trouver les lieux adaptés.",
  },
  {
    q: "Combien de temps le propriétaire a-t-il pour répondre ?",
    a: "Les propriétaires sont notifiés immédiatement. Le délai varie, mais la plupart répondent sous 24 à 48 heures. N'hésitez pas à nous contacter si vous n'avez pas de réponse sous 72 heures.",
  },
  {
    q: "Que faire si je n'ai pas de réponse ?",
    a: "Si vous n'avez pas de réponse sous 72 heures, contactez-nous à contact@salledeculte.com. Vous pouvez aussi envoyer des demandes à plusieurs salles pour maximiser vos chances.",
  },
  {
    q: "Comment bien préparer ma demande ?",
    a: "Indiquez le type d'événement, la date, le nombre de personnes et éventuellement un message personnalisé. Plus votre demande est précise, plus le propriétaire pourra vous répondre rapidement.",
  },
  {
    q: "Comment suivre mes demandes ?",
    a: "Rendez-vous dans « Mes demandes » depuis votre tableau de bord. Vous y voyez l'état de chaque demande et pouvez échanger avec les propriétaires via la messagerie.",
  },
  {
    q: "Puis-je contacter plusieurs propriétaires en même temps ?",
    a: "Oui, c'est possible et recommandé. Envoyez des demandes à plusieurs salles pour multiplier vos chances de trouver la salle idéale dans vos délais.",
  },
  {
    q: "Les salles sont-elles adaptées aux événements cultuels ?",
    a: "Oui. Toutes les annonces précisent les conditions d'accueil. Vous pouvez filtrer par type d'événement : cultes, baptêmes, conférences, célébrations, retraites, etc.",
  },
  {
    q: "Pourquoi la recherche est-elle limitée à l'Île-de-France ?",
    a: `${siteConfig.name} se concentre sur l'Île-de-France pour offrir un service localisé et de qualité. Toutes les communes de la région sont couvertes.`,
  },
  {
    q: "J'ai un essai gratuit, comment l'activer ?",
    a: "Si vous avez droit à l'essai, un bouton « Activer l'essai » apparaît sur la page d'accueil. Cliquez dessus et suivez les étapes pour activer vos demandes offertes.",
  },
  {
    q: "Comment payer mon pass ?",
    a: "Le paiement se fait par carte bancaire de manière sécurisée (Stripe) depuis la page Paiement de votre tableau de bord, après avoir choisi votre formule.",
  },
  {
    q: "Comment contacter le support ?",
    a: "Écrivez-nous à contact@salledeculte.com. Nous répondons généralement sous 24 à 48 heures ouvrées.",
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="mb-8">
      <h3 className="font-semibold text-black">{question}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{answer}</p>
    </div>
  );
}

export default function CentreAideOrganisateurPage() {
  const half = Math.ceil(FAQ_ORGANISATEUR.length / 2);
  const left = FAQ_ORGANISATEUR.slice(0, half);
  const right = FAQ_ORGANISATEUR.slice(half);

  return (
    <div className="min-h-screen bg-[#f3f6fa]">
      <SiteHeader />
      <main className="container max-w-[1000px] py-16 px-4">
        <Link href="/centre-aide" className="text-[14px] font-medium text-slate-600 hover:text-black">
          ← Retour au centre d&apos;aide
        </Link>
        <h1 className="mt-6 text-[32px] font-bold tracking-tight text-black">Chercher une salle</h1>
        <p className="mt-4 max-w-[640px] text-[16px] leading-relaxed text-slate-600">
          Chez {siteConfig.name}, nous voulons que votre recherche de salle soit simple et efficace. Voici un guide
          pour vous accompagner à chaque étape.
        </p>

        <div className="mt-12 grid gap-x-12 gap-y-4 md:grid-cols-2">
          <div>
            {left.map((item) => (
              <FaqItem key={item.q} question={item.q} answer={item.a} />
            ))}
          </div>
          <div>
            {right.map((item) => (
              <FaqItem key={item.q} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>

        <Link href="/centre-aide" className="mt-12 inline-block text-[14px] font-medium text-slate-600 hover:text-black">
          ← Retour au centre d&apos;aide
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}

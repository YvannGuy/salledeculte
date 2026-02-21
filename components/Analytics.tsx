"use client";

import Script from "next/script";
import { ConsentGate } from "@/components/cookies/ConsentGate";

/**
 * Exemple d'intégration analytics : charge le script seulement si consentement.
 * Remplacer GA_ID par votre mesure Google Analytics quand vous le configurerez.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID; // ex: "G-XXXXXXXXXX"

export function Analytics() {
  if (!GA_ID) return null;

  return (
    <ConsentGate category="analytics">
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </ConsentGate>
  );
}

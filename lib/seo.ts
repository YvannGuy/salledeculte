import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

const baseUrl = siteConfig.url;
const siteName = siteConfig.name;

/** Image OG par défaut (1200x630 recommandé) */
const defaultOgImage = `${baseUrl}/og-image.png`;

/**
 * Metadata par défaut pour toutes les pages.
 * Utilisé comme base dans layout et étendu par page.
 */
export const defaultMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `${siteName} - Trouvez et réservez une salle pour vos événements cultuels`,
    template: `%s | ${siteName}`,
  },
  description:
    "La plateforme de référence pour trouver et proposer des salles dédiées aux événements cultuels en Île-de-France. Cultes, baptêmes, conférences.",
  keywords: [
    "salle événement cultuel",
    "location salle culte",
    "salle baptême",
    "salle conférence religieuse",
    "Île-de-France",
    "salledeculte",
  ],
  authors: [{ name: siteName, url: baseUrl }],
  creator: siteName,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName,
    url: baseUrl,
    title: `${siteName} - Trouvez et réservez une salle pour vos événements cultuels`,
    description:
      "La plateforme de référence pour trouver et proposer des salles dédiées aux événements cultuels en Île-de-France.",
    images: [{ url: defaultOgImage, width: 1200, height: 630, alt: siteName }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - Salles pour événements cultuels`,
    description: "Trouvez et réservez une salle pour vos événements cultuels en Île-de-France.",
    images: [defaultOgImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  // Note: alternates.canonical doit être défini par page (generateMetadata) pour éviter le contenu dupliqué
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any", type: "image/x-icon" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/site.webmanifest",
};

/** Construit les alternates.canonical pour une URL de page */
export function buildCanonical(path: string): string {
  const url = new URL(path, baseUrl);
  return url.toString();
}

/** Pages à exclure du sitemap (zones privées) */
export const SITEMAP_EXCLUDE_PREFIXES = [
  "/admin",
  "/dashboard",
  "/proprietaire",
  "/auth",
  "/login",
  "/signup",
  "/onboarding",
];

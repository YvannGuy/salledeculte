import type { Metadata } from "next";
import Home from "@/app/accueil/page";

import { buildCanonical } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Proposer ou louer une salle pour vos évènements cultuels et célébrations | ${siteConfig.name}`,
  description: siteConfig.description,
  alternates: { canonical: buildCanonical("/") },
};

export default function HomePage() {
  return <Home />;
}

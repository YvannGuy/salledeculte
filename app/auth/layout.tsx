import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion | salledeculte.com",
  description: "Connectez-vous ou créez un compte sur salledeculte.com",
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

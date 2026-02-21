"use client";

import { useState, useEffect } from "react";
import { hasConsent, type ConsentCategory } from "@/lib/consent";

/**
 * Charge les children (ex: Script) uniquement si l'utilisateur a consenti à la catégorie.
 */
export function ConsentGate({
  category,
  children,
}: {
  category: "analytics" | "marketing";
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    setReady(true);
    setConsented(hasConsent(category));
  }, [category]);

  useEffect(() => {
    const handler = () => setConsented(hasConsent(category));
    window.addEventListener("consent:updated", handler);
    return () => window.removeEventListener("consent:updated", handler);
  }, [category]);

  if (!ready || !consented) return null;
  return <>{children}</>;
}
